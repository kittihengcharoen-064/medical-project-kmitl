const db = require("../config/db");
const HttpException = require("./HttpException");
const IdGenerator = require("./utils/idGenerator");
const { validateRequestBody } = require("./utils/validateRequestBody");

function login(username, password) {
  if (!username || !password)
    throw new HttpException(401, "Invalid username or password");

  const result = db
    .prepare(
      "select account_id as accountId, username, role from account where username = ? and password = ?"
    )
    .get(username, password);

  if (!result) throw new HttpException(401, "Invalid username or password");

  const { role, accountId } = result;

  if (!role) {
    throw new HttpException(404, "Account not found");
  }

  if (!["patient", "staff"].includes(role)) {
    throw new HttpException(404, "Account not found");
  }

  let data = db
    .prepare(
      `select ${
        role === "staff" ? "sid" : "pid"
      }, fname as firstName, lname as lastName, phone from ${role} where account_id = ?`
    )
    .get(accountId);

  if (!data) {
    throw new HttpException(404, "Account not found");
  }

  return { ...data, role, accountId };
}

function signUp(payload) {
  if (
    !validateRequestBody(payload, [
      "username",
      "password",
      "type",
      "firstName",
      "lastName",
      "phone",
    ])
  ) {
    throw new HttpException(400, "Invalid request body");
  }

  const {
    username,
    password,
    type,
    firstName,
    lastName,
    phone,
    idCard = null,
  } = payload;

  const existing = db
    .prepare("SELECT account_id FROM account WHERE username = ?")
    .get(username);
  if (existing) {
    throw new HttpException(409, `Username '${username}' already exists`);
  }

  const transaction = db.transaction(() => {
    const accountId = createAccount(username, password, type);

    if (type === "patient") {
      const patientId = IdGenerator.gen("P");

      db.prepare(
        "INSERT INTO patient (pid, fname, lname, phone, account_id) VALUES (?, ?, ?, ?, ?)"
      ).run(patientId, firstName, lastName, phone, accountId);

      db.prepare(
        "INSERT INTO patient_info (fname, lname, phone, patient_id) VALUES (?, ?, ?, ?)"
      ).run(firstName, lastName, phone, patientId);

      return {
        message: "Patient account created successfully",
        pid: patientId,
        accountId,
      };
    }

    if (type === "staff") {
      const staffId = IdGenerator.gen("S");

      db.prepare(
        "INSERT INTO staff (sid, fname, lname, phone, id_card, account_id) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(staffId, firstName, lastName, phone, idCard, accountId);

      return {
        message: "Staff account created successfully",
        sid: staffId,
        accountId,
      };
    }

    throw new HttpException(400, "Invalid account type");
  });

  const result = transaction();

  return Promise.resolve(result);

  function createAccount(username, password, role) {
    try {
      const stmt = db.prepare(
        "INSERT INTO account (username, password, role) VALUES (?, ?, ?)"
      );
      const result = stmt.run(username, password, role);
      return result.lastInsertRowid;
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        throw new HttpException(409, "Username already exists");
      }
      throw error;
    }
  }
}

module.exports = { login, signUp };
