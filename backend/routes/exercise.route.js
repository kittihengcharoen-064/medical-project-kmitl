const { Router } = require("express");
const { asyncHandler } = require("../middlewares/error-handler");
const db = require("../config/db");
const HttpException = require("../libs/HttpException");

const exerciseRoute = Router();

exerciseRoute.get(
  "/:pid",
  asyncHandler((req, res) => {
    const pid = req.params.pid;

    if (!pid) {
      throw new HttpException(400, "Missing patient ID");
    }

    const sports = db
      .prepare(
        `
        select 
          exe.exercise_id as exeId,
          exe.date,
          exe.time,
          s.sport_id as sportId,
          s.sport_type as type
        from exercise exe
        left join sport s on s.exercise_id = exe.exercise_id
        where exe.patient_pid = ?
          and s.sport_type is not null
        order by exe.date desc, exe.time desc
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
          f.food_name as foodName
        from exercise exe
        left join food f on f.exercise_id = exe.exercise_id
        where exe.patient_pid = ?
          and f.food_name is not null
        order by exe.date desc, exe.time desc
        `
      )
      .all(pid);

    res.status(200).json({ error: false, data: { sports, foods } });
  })
);

exerciseRoute.post(
  "/add",
  asyncHandler((req, res) => {
    const { patientId, food = [], exercise = [] } = req.body;

    if (!patientId) {
      throw new HttpException(400, "Missing required field: patientId");
    }

    const patient = db
      .prepare("select pid from patient where pid = ?")
      .get(patientId);

    if (!patient) {
      throw new HttpException(404, `Patient '${patientId}' not found`);
    }

    const insertExerciseStmt = db.prepare(`
      insert into exercise (date, time, patient_pid)
      values (?, ?, ?)
    `);

    const insertSportStmt = db.prepare(`
      insert into sport (sport_type, date, time, exercise_id)
      values (?, ?, ?, ?)
    `);

    const insertFoodStmt = db.prepare(`
      insert into food (food_name, date, time, exercise_id)
      values (?, ?, ?, ?)
    `);

    const insertAll = db.transaction(() => {
      if (Array.isArray(exercise) && exercise.length > 0) {
        for (const row of exercise) {
          if (!row.sportType) continue;

          const exe = insertExerciseStmt.run(
            row.date || new Date().toISOString().split("T")[0],
            row.time || new Date().toTimeString().slice(0, 8),
            patientId
          );
          const exerciseId = exe.lastInsertRowid;

          insertSportStmt.run(
            row.sportType,
            row.date || null,
            row.time || null,
            exerciseId
          );
        }
      }

      if (Array.isArray(food) && food.length > 0) {
        for (const row of food) {
          if (!row.foodName) continue;

          const exe = insertExerciseStmt.run(
            row.date || new Date().toISOString().split("T")[0],
            row.time || new Date().toTimeString().slice(0, 8),
            patientId
          );
          const exerciseId = exe.lastInsertRowid;

          insertFoodStmt.run(
            row.foodName,
            row.date || null,
            row.time || null,
            exerciseId
          );
        }
      }
    });

    insertAll();

    res.status(201).json({
      message: "Exercise records added successfully",
      sportCount: exercise.length,
      foodCount: food.length,
    });
  })
);

exerciseRoute.patch(
  "/replace-all",
  asyncHandler((req, res) => {
    const { patientId, food = [], exercise = [] } = req.body;

    if (!patientId) {
      throw new HttpException(400, "Missing required field: patientId");
    }

    const patient = db
      .prepare("SELECT pid FROM patient WHERE pid = ?")
      .get(patientId);
    if (!patient) {
      throw new HttpException(404, `Patient '${patientId}' not found`);
    }

    const deleteExerciseStmt = db.prepare(`
      DELETE FROM exercise WHERE patient_pid = ?
    `);

    const insertExerciseStmt = db.prepare(`
      INSERT INTO exercise (date, time, patient_pid)
      VALUES (?, ?, ?)
    `);

    const insertFoodStmt = db.prepare(`
      INSERT INTO food (exercise_id, food_name, date, time)
      VALUES (?, ?, ?, ?)
    `);

    const insertSportStmt = db.prepare(`
      INSERT INTO sport (exercise_id, sport_type, date, time)
      VALUES (?, ?, ?, ?)
    `);

    const getExerciseIdStmt = db.prepare(`
      SELECT exercise_id AS exeId FROM exercise
      WHERE date = ? AND time = ? AND patient_pid = ?
    `);

    // One transaction — ensures atomicity
    const replaceAll = db.transaction(() => {
      // 1. Delete everything related to this patient
      deleteExerciseStmt.run(patientId);

      // 2. Reinsert new data
      for (const ex of exercise) {
        const { date, time, sportType } = ex;
        if (!date || !time || !sportType) continue;

        insertExerciseStmt.run(date, time, patientId);

        const { exeId } = getExerciseIdStmt.get(date, time, patientId);
        insertSportStmt.run(exeId, sportType, date, time);
      }

      for (const fd of food) {
        const { date, time, foodName } = fd;
        if (!date || !time || !foodName) continue;

        // Reuse existing exercise if same date/time, otherwise create new
        let exerciseRow = getExerciseIdStmt.get(date, time, patientId);
        let exerciseId;

        if (exerciseRow) {
          exerciseId = exerciseRow.exeId;
        } else {
          insertExerciseStmt.run(date, time, patientId);
          exerciseId = getExerciseIdStmt.get(date, time, patientId).exeId;
        }

        insertFoodStmt.run(exerciseId, foodName, date, time);
      }
    });

    replaceAll();

    res.status(200).json({
      message: "All exercise and food data replaced successfully",
      sportCount: exercise.length,
      foodCount: food.length,
    });
  })
);

exerciseRoute.delete(
  "/delete/:exerciseId",
  asyncHandler((req, res) => {
    const exerciseId = req.params.exerciseId;

    const exercise = db
      .prepare("select * from exercise where exercise_id = ?")
      .get(exerciseId);

    if (!exercise) {
      throw new HttpException(404, `Exercise record '${exerciseId}' not found`);
    }

    db.prepare("delete from sport where exercise_id = ?").run(exerciseId);
    db.prepare("delete from food where exercise_id = ?").run(exerciseId);
    db.prepare("delete from exercise where exercise_id = ?").run(exerciseId);

    res.status(200).json({
      message: `Exercise record '${exerciseId}' deleted successfully`,
    });
  })
);

module.exports = exerciseRoute;
