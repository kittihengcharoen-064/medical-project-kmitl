const { Router } = require("express");
const { asyncHandler } = require("../middlewares/error-handler");
const db = require("../config/db");
const { validateRequestBody } = require("../libs/utils/validateRequestBody");
const HttpException = require("../libs/HttpException");

const recordRoute = Router();

recordRoute.get(
  "/pressures/:pid",
  asyncHandler((req, res) => {
    const pid = req.params.pid;
    const records = db
      .prepare(
        `select date, time, SYS as sys, DIA as dia, PUL as pul from record_pressure where patient_id = ?`
      )
      .all(pid);
    res.status(200).json({ error: false, data: records });
  })
);

recordRoute.post(
  "/pressures/add",
  asyncHandler((req, res) => {
    const payload = req.body;
    const pid = payload.patientId;

    const records = Array.isArray(payload.history)
      ? payload.history
      : [payload.history];

    if (records.length === 0) {
      throw new HttpException(400, "No records provided");
    }

    const stmt = db.prepare(
      `insert into record_pressure (date, time, SYS, DIA, PUL, patient_id) 
       values (?, ?, ?, ?, ?, ?)`
    );

    const insertMany = db.transaction((rows) => {
      for (const record of rows) {
        const { date, time, sys, dia, pul } = record;

        if (
          !validateRequestBody(record, ["date", "time", "sys", "dia", "pul"])
        ) {
          throw new HttpException(
            400,
            "Missing SYS, DIA, or PUL in one record"
          );
        }

        stmt.run(date, time, sys, dia, pul, pid);
      }
    });

    insertMany(records);

    res.status(201).json({
      message: `${records.length} pressure record(s) added successfully`,
    });
  })
);

recordRoute.put(
  "/pressures/replace-all",
  asyncHandler((req, res) => {
    const { patientId, history = [] } = req.body;

    if (!patientId) {
      throw new HttpException(400, "Missing required field: patientId");
    }

    const patient = db
      .prepare("SELECT pid FROM patient WHERE pid = ?")
      .get(patientId);

    if (!patient) {
      throw new HttpException(404, `Patient '${patientId}' not found`);
    }

    const deleteStmt = db.prepare(`
      DELETE FROM record_pressure WHERE patient_id = ?
    `);

    const insertStmt = db.prepare(`
      INSERT INTO record_pressure (date, time, SYS, DIA, PUL, patient_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const replaceAll = db.transaction((rows) => {
      deleteStmt.run(patientId);

      for (const record of rows) {
        const { date, time, sys, dia, pul } = record;

        if (!date || !time || sys == null || dia == null || pul == null) {
          throw new HttpException(
            400,
            "Missing required fields (date, time, SYS, DIA, PUL)"
          );
        }

        insertStmt.run(date, time, sys, dia, pul, patientId);
      }
    });

    replaceAll(history);

    res.status(200).json({
      message: `${history.length} blood pressure record(s) replaced successfully`,
    });
  })
);

recordRoute.patch(
  "/pressures/update/:recordId",
  asyncHandler((req, res) => {
    const recordId = req.params.recordId;
    const payload = req.body;

    const record = db
      .prepare("select * from record_pressure where record_id = ?")
      .get(recordId);

    if (!record) {
      throw new HttpException(404, `Pressure record '${recordId}' not found`);
    }

    const allowedFields = ["date", "SYS", "DIA", "PUL"];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(payload)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new HttpException(400, "No valid fields provided for update");
    }

    const sql = `update record_pressure set ${updates.join(
      ", "
    )} where rid = ?`;
    values.push(recordId);

    db.prepare(sql).run(...values);

    res.status(200).json({ message: "Pressure record updated successfully" });
  })
);

recordRoute.delete(
  "/pressures/delete/:recordId",
  asyncHandler((req, res) => {
    const recordId = req.params.recordId;

    const record = db
      .prepare("select * from record_pressure where record_id = ?")
      .get(recordId);

    if (!record) {
      throw new HttpException(404, `Pressure record '${recordId}' not found`);
    }

    db.prepare("delete from record_pressure where record_id = ?").run(recordId);

    res.status(200).json({ message: "Pressure record deleted successfully" });
  })
);

recordRoute.get(
  "/sugar/:pid",
  asyncHandler((req, res) => {
    const pid = req.params.pid;
    const records = db
      .prepare(
        `select date, time, value as sugar from record_sugar where patient_pid = ?`
      )
      .all(pid);
    res.status(200).json({ error: false, data: records });
  })
);

recordRoute.post(
  "/sugar/add",
  asyncHandler((req, res) => {
    const payload = req.body;
    const pid = payload.patientId;

    const records = Array.isArray(payload.history)
      ? payload.history
      : [payload.history];

    if (records.length === 0) {
      throw new HttpException(400, "No records provided");
    }

    const stmt = db.prepare(
      `insert into record_sugar (date, time, value, patient_pid) 
       values (?, ?, ?, ?)`
    );

    const insertMany = db.transaction((rows) => {
      for (const record of rows) {
        const { date, time, sugar } = record;

        if (!validateRequestBody(record, ["date", "time", "sugar"])) {
          throw new HttpException(
            400,
            "Missing date, time, sugar in one record"
          );
        }

        stmt.run(date, time, sugar, pid);
      }
    });

    insertMany(records);

    res.status(201).json({
      message: `${records.length} Sugar record(s) added successfully`,
    });
  })
);

recordRoute.put(
  "/sugar/replace-all",
  asyncHandler((req, res) => {
    const { patientId, history = [] } = req.body;

    if (!patientId) {
      throw new HttpException(400, "Missing required field: patientId");
    }

    const patient = db
      .prepare("SELECT pid FROM patient WHERE pid = ?")
      .get(patientId);

    if (!patient) {
      throw new HttpException(404, `Patient '${patientId}' not found`);
    }

    const deleteStmt = db.prepare(`
      DELETE FROM record_sugar WHERE patient_pid = ?
    `);

    const insertStmt = db.prepare(`
      INSERT INTO record_sugar (date, time, value, patient_pid)
      VALUES (?, ?, ?, ?)
    `);

    const replaceAll = db.transaction((rows) => {
      deleteStmt.run(patientId);

      for (const record of rows) {
        const { date, time, sugar } = record;

        if (!date || !time || sugar == null) {
          throw new HttpException(400, "Missing date, time, or sugar value");
        }

        insertStmt.run(date, time, sugar, patientId);
      }
    });

    replaceAll(history);

    res.status(200).json({
      message: `${history.length} sugar record(s) replaced successfully`,
    });
  })
);

recordRoute.patch(
  "/sugar/update/:recordId",
  asyncHandler((req, res) => {
    const recordId = req.params.recordId;
    const payload = req.body;

    const record = db
      .prepare("select * from record_sugar where record_id = ?")
      .get(recordId);

    if (!record) {
      throw new HttpException(404, `Sugar record '${recordId}' not found`);
    }

    const allowedFields = ["date", "value"];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(payload)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new HttpException(400, "No valid fields provided for update");
    }

    const sql = `update record_sugar set ${updates.join(
      ", "
    )} where record_id = ?`;
    values.push(recordId);

    db.prepare(sql).run(...values);

    res.status(200).json({ message: "Sugar record updated successfully" });
  })
);

recordRoute.delete(
  "/sugar/delete/:recordId",
  asyncHandler((req, res) => {
    const recordId = req.params.recordId;

    const record = db
      .prepare("select * from record_sugar where record_id = ?")
      .get(recordId);

    if (!record) {
      throw new HttpException(404, `Sugar record '${recordId}' not found`);
    }

    db.prepare("delete from record_sugar where record_id = ?").run(recordId);

    res.status(200).json({ message: "Sugar record deleted successfully" });
  })
);

recordRoute.get(
  "/medications/:pid",
  asyncHandler((req, res) => {
    const pid = req.params.pid;
    const records = db
      .prepare(
        `select 
            mr.record_id as id,  
            mr.treatment_date as date,
            mr.description as diagnosis,
            s.fname || ' ' || s.lname as doctor
        from medication_record mr left join staff s on s.sid = mr.staff_id where mr.patient_id = ?`
      )
      .all(pid);
    res.status(200).json({ error: false, data: records });
  })
);

recordRoute.post(
  "/medications/create",
  asyncHandler((req, res) => {
    const payload = req.body;

    if (!validateRequestBody(payload, ["date", "diagnosis", "pid", "sid"])) {
      throw new HttpException(400, "Invalid request body");
    }

    const allowedFields = ["date", "diagnosis", "pid", "sid"];
    const values = [];

    for (let [key, value] of Object.entries(payload)) {
      if (allowedFields.includes(key)) {
        values.push(value);
      }
    }

    db.prepare(
      `insert into medication_record (treatment_date, description, patient_id, staff_id) 
        values (?, ?, ?, ?)`
    ).run(...values);

    res.status(200).json({
      error: false,
      message: "Medication record created successfully",
    });
  })
);

recordRoute.put(
  "/medications/replace-all",
  asyncHandler((req, res) => {
    const { patientId: pid, history = [] } = req.body;

    const patient = db
      .prepare("SELECT pid FROM patient WHERE pid = ?")
      .get(pid);
    if (!patient) {
      throw new HttpException(404, `Patient '${pid}' not found`);
    }

    const deleteStmt = db.prepare(`
      DELETE FROM medication_record WHERE patient_id = ?
    `);

    const insertStmt = db.prepare(`
      INSERT INTO medication_record (treatment_date, description, patient_id, staff_id)
      VALUES (?, ?, ?, ?)
    `);

    const replaceAll = db.transaction((rows) => {
      deleteStmt.run(pid);
      for (const record of rows) {
        const { date, diagnosis, sid } = record;
        const staff = db
          .prepare("SELECT sid FROM staff WHERE sid = ?")
          .get(sid);
        if (!staff) {
          throw new HttpException(404, `Staff '${sid}' not found`);
        }
        if (!date || !diagnosis) continue;
        insertStmt.run(date, diagnosis, pid, sid);
      }
    });

    replaceAll(history);

    res.status(200).json({
      message: `${history.length} medication record(s) replaced successfully`,
    });
  })
);

recordRoute.delete(
  "/medication/delete/:recordId",
  asyncHandler((req, res) => {
    const recordId = req.params.recordId;

    const record = db
      .prepare("select * from medication_record where record_id = ?")
      .get(recordId);

    if (!record) {
      throw new HttpException(404, `Medication record '${recordId}' not found`);
    }

    db.prepare("delete from medication_record where record_id = ?").run(
      recordId
    );

    res.status(200).json({
      error: false,
      message: "Medication record deleted successfully",
    });
  })
);

recordRoute.patch(
  "/medication/update/:recordId",
  asyncHandler((req, res) => {
    const recordId = req.params.recordId;
    const payload = req.body;

    const record = db
      .prepare("select * from medication_record where mid = ?")
      .get(recordId);

    if (!record) {
      throw new HttpException(404, `Medication record '${recordId}' not found`);
    }

    const allowedFields = ["treatmentDate", "description", "pid", "sid"];
    const fieldMap = {
      treatmentDate: "treatment_date",
      description: "description",
      pid: "patient_id",
      sid: "staff_id",
    };

    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(payload)) {
      if (allowedFields.includes(key)) {
        updates.push(`${fieldMap[key]} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new HttpException(400, "No valid fields provided for update");
    }

    const sql = `update medication_record set ${updates.join(
      ", "
    )} where record_id = ?`;
    values.push(recordId);

    db.prepare(sql).run(...values);

    res.status(200).json({
      error: false,
      message: "Medication record updated successfully",
    });
  })
);

module.exports = recordRoute;
