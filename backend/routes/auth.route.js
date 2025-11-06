const { Router } = require("express");
const auth = require("../libs/auth");
const { asyncHandler } = require("../middlewares/error-handler");
const db = require("../config/db");
const HttpException = require("../libs/HttpException");

const authRoute = Router();

authRoute.get(
  "/info/:accountId",
  asyncHandler((req, res) => {
    const accountId = req.params.accountId;

    const { role } = db
      .prepare(`select role from account where account_id = ?`)
      .get(accountId);

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

    res.status(200).json({ error: false, data });
  })
);

authRoute.post(
  "/staff/info",
  asyncHandler((req, res) => {
    const payload = req.body;
    const { phone, accountId } = payload;

    if (!phone || !accountId) {
      throw new HttpException(400, "Invalid request payload");
    }

    db.prepare("update staff set phone = ? where account_id = ?").run(
      phone,
      accountId
    );

    res.status(200).json({ error: false, message: "Staff info updated successfully" });
  })
);

authRoute.post(
  "/login",
  asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;
    const account = auth.login(username, password);
    res.status(200).json({ error: false, data: account });
  })
);

authRoute.post(
  "/signUp",
  asyncHandler(async (req, res, next) => {
    const result = await auth.signUp(req.body);
    res.status(200).json({ error: false, data: null, message: result.message });
  })
);

module.exports = authRoute;
