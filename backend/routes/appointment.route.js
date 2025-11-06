const { Router } = require("express");
const { asyncHandler } = require("../middlewares/error-handler");
const db = require("../config/db");
const { validateRequestBody } = require("../libs/utils/validateRequestBody");

const appointmentRoute = Router();

appointmentRoute.get(
  "/:pid",
  asyncHandler((req, res) => {
    const pid = req.params.pid;

    const results = db
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

    res.status(200).json({ error: false, data: results });
  })
);

appointmentRoute.post(
  "/create",
  asyncHandler((req, res) => {
    const payload = req.body;

    if (
      !validateRequestBody(payload, ["date", "time", "status", "pid", "sid"])
    ) {
      throw new HttpException(400, "Invalid request body");
    }

    const allowedFields = ["date", "time", "status", "pid", "sid"];
    const values = [];

    for (let [key, value] of Object.entries(payload)) {
      if (allowedFields.includes(key)) {
        values.push(value);
      }
    }

    db.prepare(
      `insert into appointment (date, time, status, patient_pid, staff_sid) 
        values (?, ?, ?, ?, ?)`
    ).run(...values);

    res.status(200).json({
      error: false,
      message: "Appointment created successfully",
    });
  })
);

appointmentRoute.put(
  "/replace-all",
  asyncHandler((req, res) => {
    const { patientId: pid, appointments } = req.body;

    if (!pid) {
      throw new HttpException(400, "Missing required fields: pid");
    }

    const deleteStmt = db.prepare(`
      DELETE FROM appointment 
      WHERE patient_pid = ?
    `);

    const insertStmt = db.prepare(`
      INSERT INTO appointment (date, time, status, patient_pid, staff_sid)
      VALUES (?, ?, ?, ?, ?)
    `);

    const replaceAll = db.transaction((rows) => {
      deleteStmt.run(pid);

      for (const appt of rows) {
        if (!validateRequestBody(appt, ["date", "time", "status", "sid"])) {
          throw new HttpException(
            400,
            "Missing date, time, or status in one appointment"
          );
        }

        const { date, time, status, sid } = appt;

        const staff = db
          .prepare("SELECT sid FROM staff WHERE sid = ?")
          .get(sid);

        if (!staff) {
          throw new HttpException(404, `Staff '${sid}' not found`);
        }

        insertStmt.run(date, time, status, pid, sid);
      }
    });

    replaceAll(appointments);

    res.status(200).json({
      error: false,
      message: `Replaced all appointments successfully (${appointments.length} records).`,
      count: appointments.length,
    });
  })
);

appointmentRoute.delete(
  "/delete/:appId",
  asyncHandler((req, res) => {
    const appId = req.params.appId;

    const appointment = db
      .prepare("select * from appointment where app_id = ?")
      .get(appId);

    if (!appointment) {
      throw new HttpException(404, `Appointment '${appId}' not found`);
    }

    db.prepare("delete from appointment where app_id = ?").run(appId);

    res
      .status(200)
      .json({ message: `Appointment '${appId}' deleted successfully` });
  })
);

appointmentRoute.patch(
  "/update/:appId",
  asyncHandler((req, res) => {
    const appId = req.params.appId;
    const payload = req.body;

    const appointment = db
      .prepare("select * from appointment where app_id = ?")
      .get(appId);

    if (!appointment) {
      throw new HttpException(404, `Appointment '${appId}' not found`);
    }

    const allowedFields = ["datet", "time", "description", "status"];
    const fieldMap = {
      date: "datetime",
      time: "time",
      description: "description",
      status: "status",
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

    const sql = `update appointment set ${updates.join(", ")} where app_id = ?`;
    values.push(appId);

    db.prepare(sql).run(...values);

    res.status(200).json({
      message: `Appointment '${appId}' updated successfully`,
    });
  })
);

module.exports = appointmentRoute;
