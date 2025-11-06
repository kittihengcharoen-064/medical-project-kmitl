const betterSqlite3 = require("better-sqlite3");
const fs = require("node:fs");
const path = require("node:path");

const db = betterSqlite3("db/mydb.db");
const initializeFile = fs.readFileSync(
  path.join(__dirname, "../db/init.sql"),
  "utf-8"
);

db.exec(initializeFile);

process.on("exit", () => {
  db.close();
  console.log("Database connection closed.");
});

module.exports = db;
