PRAGMA foreign_keys = ON;

-- -----------------------------------------------------
-- Table: account
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS account (
        account_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'staff'))
    );

-- -----------------------------------------------------
-- Table: patient
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS patient (
        pid TEXT PRIMARY KEY,
        fname TEXT NOT NULL,
        lname TEXT NOT NULL,
        phone TEXT NOT NULL,
        account_id INTEGER NOT NULL,
        FOREIGN KEY (account_id) REFERENCES account (account_id) ON DELETE NO ACTION ON UPDATE NO ACTION
    );

CREATE INDEX IF NOT EXISTS idx_patient_account_id ON patient (account_id);

-- -----------------------------------------------------
-- Table: patient_info
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS patient_info (
        record_id INTEGER PRIMARY KEY AUTOINCREMENT,
        date_of_birth DATE,
        fname TEXT NOT NULL,
        lname TEXT NOT NULL,
        id_card TEXT,
        phone TEXT NOT NULL,
        reserve_phone TEXT,
        address TEXT,
        gender TEXT CHECK (gender IN ('ชาย', 'หญิง')),
        blood_type TEXT CHECK (blood_type IN ('O', 'B', 'A', 'AB')),
        patient_id TEXT NOT NULL UNIQUE,
        weight INTEGER,
        height INTEGER,
        FOREIGN KEY (patient_id) REFERENCES patient (pid) ON DELETE NO ACTION ON UPDATE NO ACTION
    );

CREATE INDEX IF NOT EXISTS idx_patient_info_patient_id ON patient_info (patient_id);

-- -----------------------------------------------------
-- Table: record_pressure
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS record_pressure (
        record_id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT DEFAULT CURRENT_DATE,
        time TEXT,
        SYS REAL NOT NULL,
        DIA REAL NOT NULL,
        PUL REAL NOT NULL,
        patient_id TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patient (pid) ON DELETE NO ACTION ON UPDATE NO ACTION
    );

CREATE INDEX IF NOT EXISTS idx_record_pressure_patient_id ON record_pressure (patient_id);

-- -----------------------------------------------------
-- Table: staff
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS staff (
        sid TEXT PRIMARY KEY,
        fname TEXT NOT NULL,
        lname TEXT NOT NULL,
        phone TEXT,
        id_card TEXT,
        account_id INTEGER NOT NULL,
        FOREIGN KEY (account_id) REFERENCES account (account_id) ON DELETE NO ACTION ON UPDATE NO ACTION
    );

CREATE INDEX IF NOT EXISTS idx_staff_account_id ON staff (account_id);

-- -----------------------------------------------------
-- Table: record_sugar
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS record_sugar (
        record_id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        time TEXT,
        value REAL,
        patient_pid TEXT NOT NULL,
        FOREIGN KEY (patient_pid) REFERENCES patient (pid) ON DELETE NO ACTION ON UPDATE NO ACTION
    );

CREATE INDEX IF NOT EXISTS idx_record_sugar_patient_pid ON record_sugar (patient_pid);

-- -----------------------------------------------------
-- Table: blood_result
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS blood_result (
        result_id INTEGER PRIMARY KEY AUTOINCREMENT,
        WBC REAL,
        RCB REAL,
        Hb REAL,
        FBS REAL,
        HbA1c REAL,
        total_cholestrol REAL,
        LDL REAL,
        HDL REAL,
        patient_pid TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_pid) REFERENCES patient (pid) ON DELETE NO ACTION ON UPDATE NO ACTION
    );

CREATE INDEX IF NOT EXISTS idx_blood_result_patient_pid ON blood_result (patient_pid);

-- -----------------------------------------------------
-- Trigger: blood_result.updated_at
-- -----------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_blood_result_updated_at AFTER
UPDATE ON blood_result FOR EACH ROW BEGIN
UPDATE blood_result
SET
    updated_at = CURRENT_TIMESTAMP
WHERE
    result_id = OLD.result_id;

END;

-- -----------------------------------------------------
-- Table: appointment
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS appointment (
        app_id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
        staff_sid TEXT NOT NULL,
        patient_pid TEXT NOT NULL,
        FOREIGN KEY (staff_sid) REFERENCES staff (sid) ON DELETE NO ACTION ON UPDATE NO ACTION,
        FOREIGN KEY (patient_pid) REFERENCES patient (pid) ON DELETE NO ACTION ON UPDATE NO ACTION
    );

CREATE INDEX IF NOT EXISTS idx_appointment_staff_sid ON appointment (staff_sid);

CREATE INDEX IF NOT EXISTS idx_appointment_patient_pid ON appointment (patient_pid);

-- -----------------------------------------------------
-- Table: medication_record
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS medication_record (
        record_id INTEGER PRIMARY KEY AUTOINCREMENT,
        treatment_date DATE NOT NULL,
        description TEXT NOT NULL,
        patient_id TEXT NOT NULL,
        staff_id TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patient (pid) ON DELETE NO ACTION ON UPDATE NO ACTION,
        FOREIGN KEY (staff_id) REFERENCES staff (sid) ON DELETE NO ACTION ON UPDATE NO ACTION
    );

CREATE INDEX IF NOT EXISTS idx_medication_patient_id ON medication_record (patient_id);

CREATE INDEX IF NOT EXISTS idx_medication_staff_id ON medication_record (staff_id);

-- -----------------------------------------------------
-- Table: medicine_record
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS medicine_record (
        record_id INTEGER PRIMARY KEY AUTOINCREMENT,
        quantity INTEGER NOT NULL,
        title TEXT NOT NULL,
        date DATE DEFAULT CURRENT_DATE,
        patient_pid TEXT NOT NULL,
        FOREIGN KEY (patient_pid) REFERENCES patient (pid) ON DELETE NO ACTION ON UPDATE NO ACTION
    );

CREATE INDEX IF NOT EXISTS idx_medicine_record_patient_pid ON medicine_record (patient_pid);

-- -----------------------------------------------------
-- Table: exercise
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS exercise (
        exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        patient_pid TEXT NOT NULL,
        UNIQUE (date, time, patient_pid),
        FOREIGN KEY (patient_pid) REFERENCES patient (pid) ON DELETE NO ACTION ON UPDATE NO ACTION
    );

CREATE INDEX IF NOT EXISTS idx_exercise_patient_pid ON exercise (patient_pid);

-- -----------------------------------------------------
-- Table: sport
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS sport (
        sport_id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER NOT NULL,
        sport_type TEXT NOT NULL,
        date TEXT,
        time TEXT,
        UNIQUE (exercise_id, sport_type),
        FOREIGN KEY (exercise_id) REFERENCES exercise (exercise_id) ON DELETE CASCADE ON UPDATE NO ACTION
    );

CREATE INDEX IF NOT EXISTS idx_sport_exercise_id ON sport (exercise_id);

-- -----------------------------------------------------
-- Table: food
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS food (
        food_id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER NOT NULL,
        food_name TEXT NOT NULL,
        date TEXT,
        time TEXT,
        UNIQUE (exercise_id, food_name),
        FOREIGN KEY (exercise_id) REFERENCES exercise (exercise_id) ON DELETE CASCADE ON UPDATE NO ACTION
    );

CREATE INDEX IF NOT EXISTS idx_food_exercise_id ON food (exercise_id);