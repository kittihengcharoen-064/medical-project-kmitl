const path = require("path");
const express = require("express");
const http = require("http");

const HttpException = require("./libs/HttpException");

const authRoute = require("./routes/auth.route");
const patientInfoRoute = require("./routes/patient.route");
const recordRoute = require("./routes/record.route");
const exerciseRoute = require("./routes/exercise.route");
const appointmentRoute = require("./routes/appointment.route");

const PORT = 8000;

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("../frontend"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.use("/api/auth", authRoute);
app.use("/api/patients", patientInfoRoute);
app.use("/api/records", recordRoute);
app.use("/api/exercises", exerciseRoute);
app.use("/api/appointments", appointmentRoute);

app.use((err, req, res, next) => {
  if (err instanceof HttpException) {
    res.status(err.statusCode).json({ error: true, message: err.message });
  } else {
    console.error(err);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

server.listen(PORT, () => {
  console.log(`Sever is running on port ${PORT}`);
});
