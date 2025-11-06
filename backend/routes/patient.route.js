const { Router } = require("express");
const { asyncHandler } = require("../middlewares/error-handler");
const db = require("../config/db");
const HttpException = require("../libs/HttpException");
const { validateRequestBody } = require("../libs/utils/validateRequestBody");

const patientInfoRoute = Router();

patientInfoRoute.get(
  "/:pid/all",
  asyncHandler((req, res) => {
    const pid = req.params.pid;

    const profile = db
      .prepare(
        `select 
          fname as firstname, 
          lname as lastname, 
          date_of_birth as birthdate,
          id_card as idcard,
          blood_type as bloodtype,
          gender,
          weight,
          height,
          phone,
          reserve_phone as emergencyPhone,
          address
          from patient_info where patient_id = ?`
      )
      .get(pid);

    const exercises = db
      .prepare(
        `
        select 
          exe.exercise_id as exeId,
          exe.date,
          exe.time,
          s.sport_id as sportId,
          s.sport_type as name
        from exercise exe
        left join sport s on s.exercise_id = exe.exercise_id
        where exe.patient_pid = ?
          and s.sport_type is not null
        order by exe.date asc, exe.time desc
        `
      )
      .all(pid);

    const foods = db
      .prepare(
        `
        select 
          exe.exercise_id as exeId,
          exe.date,
          exe.time,
          f.food_id as foodId,
          f.food_name as name
        from exercise exe
        left join food f on f.exercise_id = exe.exercise_id
        where exe.patient_pid = ?
          and f.food_name is not null
        order by exe.date asc, exe.time desc
        `
      )
      .all(pid);

    const sugars = db
      .prepare(
        `select date, time, value as sugar from record_sugar where patient_pid = ?`
      )
      .all(pid);

    const pressures = db
      .prepare(
        `select date, time, SYS as sys, DIA as dia, PUL as pul from record_pressure where patient_id = ?`
      )
      .all(pid);

    const medicationRecord = db
      .prepare(
        `select 
            mr.record_id as id,  
            mr.treatment_date as date,
            mr.description as diagnosis,
            s.fname || ' ' || s.lname as doctor,
            s.sid as staffId
        from medication_record mr left join staff s on s.sid = mr.staff_id where mr.patient_id = ?`
      )
      .all(pid);

    const appointments = db
      .prepare(
        `select 
            app.app_id as appId,
            app.date,
            app.time,
            app.status,
            s.sid as staffId,
            s.fname || ' ' || s.lname as doctor
        from appointment app
        left join staff s on s.sid = app.staff_sid
        where app.patient_pid = ?
        order by app.date desc`
      )
      .all(pid);

    res.status(200).json({
      error: false,
      data: {
        profile,
        exercises,
        foods,
        sugars,
        pressures,
        medicationRecord,
        appointments,
      },
    });
  })
);

patientInfoRoute.get(
  "/",
  asyncHandler((req, res) => {
    const patients = db
      .prepare(
        `select 
          p.pid,
          pi.fname || ' ' || pi.lname as patientName,
          pi.date_of_birth as dateOfBirth,
          pi.blood_type as bloodType
        from patient_info pi left join patient p 
          on p.pid = pi.patient_id`
      )
      .all();

    res.status(200).json({ error: false, data: patients });
  })
);

patientInfoRoute.get(
  "/:accountId",
  asyncHandler((req, res) => {
    const accountId = req.params.accountId;
    const patient = db
      .prepare(
        `select 
            pi.fname as firstName, 
            pi.lname as lastName, 
            pi.phone, 
            pi.date_of_birth as dateOfBirth, 
            pi.id_card as idCard,
            pi.reserve_phone as reservePhone,
            pi.address,
            pi.gender,
            pi.blood_type as bloodType,
            pi.weight,
            pi.height 
          from patient left join 
            patient_info pi 
          on pi.patient_id = pid where account_id = ?`
      )
      .get(accountId);

    if (!patient) {
      throw new HttpException(
        404,
        `Patient info not found for account id '${accountId}'`
      );
    }

    res.status(200).json({ error: false, data: patient });
  })
);

patientInfoRoute.post(
  "/create/:accountId",
  asyncHandler((req, res) => {
    const accountId = req.params.accountId;

    const payload = req.body;
    if (
      !validateRequestBody(payload, [
        "dateOfBirth",
        "firstName",
        "lastName",
        "idCard",
        "phone",
        "address",
      ])
    )
      throw new HttpException(400, "Invalid request body");

    const patient = db
      .prepare("select * from patient where account_id = ?")
      .get(accountId);

    if (!patient) {
      throw new HttpException(
        404,
        `Patient info not found for account id '${accountId}'`
      );
    }

    const pid = patient.pid;

    console.log(pid);

    db.prepare(
      `insert into patient_info 
        (date_of_birth, fname, lname, id_card, phone, reserve_phone, address, gender, blood_type, patient_id, weight, height) 
        values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      payload.dateOfBirth,
      payload.firstName,
      payload.lastName,
      payload.idCard,
      payload.phone,
      payload?.reservePhone ?? null,
      payload.address,
      payload?.gender ?? null,
      payload?.bloodType ?? null,
      pid,
      payload?.weight ?? null,
      payload?.height ?? null
    );

    res.status(204).json({ message: "Patient info created successfully" });
  })
);

patientInfoRoute.patch(
  "/update/:pid",
  asyncHandler((req, res) => {
    const pid = req.params.pid;
    const payload = req.body;

    const patientInfo = db
      .prepare("SELECT * FROM patient_info WHERE patient_id = ?")
      .get(pid);

    if (!patientInfo) {
      throw new HttpException(
        404,
        `Patient info not found for patient_id '${pid}'`
      );
    }

    const allowedFields = [
      "dateOfBirth",
      "firstName",
      "lastName",
      "idCard",
      "phone",
      "reservePhone",
      "address",
      "gender",
      "bloodType",
      "weight",
      "height",
    ];

    const fieldMap = {
      dateOfBirth: "date_of_birth",
      firstName: "fname",
      lastName: "lname",
      idCard: "id_card",
      phone: "phone",
      reservePhone: "reserve_phone",
      address: "address",
      gender: "gender",
      bloodType: "blood_type",
      weight: "weight",
      height: "height",
    };

    const updates = [];
    const values = [];

    for (const key of allowedFields) {
      if (payload[key] !== undefined) {
        updates.push(`${fieldMap[key]} = ?`);
        values.push(payload[key]);
      }
    }

    if (updates.length === 0) {
      throw new HttpException(400, "No valid fields provided for update");
    }

    const sql = `UPDATE patient_info SET ${updates.join(
      ", "
    )} WHERE patient_id = ?`;
    values.push(pid);

    db.prepare(sql).run(...values);

    res.status(200).json({ message: "Patient info updated successfully" });
  })
);

module.exports = patientInfoRoute;
