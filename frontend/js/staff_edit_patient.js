// ====================================================================
// js/staff_edit_patient.js - (ไฟล์ควบคุมหน้าแก้ไขข้อมูลคนไข้แบบรวม)
// ====================================================================

let userData = {};

document.addEventListener("DOMContentLoaded", () => {
  // --- (ส่วนที่ 1: ดึง ID คนไข้ และ ID บุคลากร) ---

  const userId = localStorage.getItem("userId");
  const staffId = localStorage.getItem("staffId");

  // (ดึง ID คนไข้ จาก URL ?id=P-123456)
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get("id");

  if (!staffId || !patientId) {
    alert("ข้อมูลไม่ถูกต้อง กรุณากลับไปหน้ารายชื่อ");
    window.location.href = "staff_patient.html";
    return;
  }

  // --- (ส่วนที่ 2: โหลดข้อมูลทั้งหมด) ---
  loadStaffGlobalData(userId);
  loadAllPatientData(patientId);

  // --- (ส่วนที่ 3: ผูก Event ปุ่ม) ---

  // (ฟอร์มประวัติ)
  document.getElementById("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveProfileData(patientId);
  });

  document.getElementById("historyForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveMedicationData(patientId);
  });
  document.getElementById("appointmentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    saveAppointmentData(patientId);
  });

  document
    .getElementById("addHistoryRowBtn")
    .addEventListener("click", () => addMedicationRow(staffId));
  document
    .getElementById("addApptRowBtn")
    .addEventListener("click", () => addAppointmentRow(staffId, patientId));
  // (คุณสามารถเพิ่ม Event Listener สำหรับฟอร์มอื่นๆ ที่นี่)
});

// ------------------------------------
// ฟังก์ชันโหลดข้อมูล
// ------------------------------------

function loadStaffGlobalData(staffId) {
  fetch(`/api/auth/info/${staffId}`)
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;
      userData = data;
      if (document.getElementById("staffUsername")) {
        document.getElementById(
          "staffUsername"
        ).textContent = `นพ. ${data.firstName}`;
      }
      if (document.getElementById("staffUserId")) {
        document.getElementById("staffUserId").textContent = data.sid;
      }
    })
    .catch((error) => console.error("Error loading global data:", error));
}

/**
 * ฟังก์ชัน: โหลดข้อมูล "ทั้งหมด" ของคนไข้ (จำลอง)
 */
function loadAllPatientData(patientId) {
  console.log(`กำลังโหลดข้อมูลทั้งหมดของ ID: ${patientId}`);

  // --- (จำลองการยิง API ดึงข้อมูลทั้งหมด) ---

  fetch(`/api/patients/${patientId}/all`)
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;
      console.log(data);
      // 1. เติม Header
      document.getElementById(
        "patientName"
      ).textContent = `${data.profile.firstname} ${data.profile.lastname}`;
      document.getElementById("patientId").textContent = `ID: ${patientId}`;

      // 2. เติมฟอร์มประวัติ
      populateProfileForm(data.profile);

      data.medicationRecord.forEach((item) =>
        addMedicationRow(item.staffId, item.date, item.diagnosis)
      );

      data.appointments.forEach((item) =>
        addAppointmentRow(item.staffId, patientId, item.date, item.time)
      );

      // 3. เติมฟอร์ม Lab
      //   populateLabForm(data.lab.results);

      // 4. เติมตารางอาหาร/ออกกำลังกาย
      populateFood(data.foods);
      populateExercise(data.exercises);

      const pressures = data.pressures;
      populatePressures(pressures);

      if (pressures.length > 0) {
        const { sys, dia, pul } = data.pressures[data.pressures.length - 1];
        updateBpDisplay(sys, dia, pul);
      }

      const sugars = data.sugars;
      populateBloodSugar(sugars);

      if (sugars.length > 0) {
        const { sugar } = data.sugars[data.sugars.length - 1];
        updateBsDisplay(sugar);
      }

      // (เติมข้อมูลส่วนอื่นๆ)
    })
    .catch((error) => console.error("Error loading all patient data:", error));
}

// ------------------------------------
// ฟังก์ชันเติมข้อมูล (Populate)
// ------------------------------------

function populateProfileForm(data) {
  document.getElementById("firstname").value = data.firstname;
  document.getElementById("lastname").value = data.lastname;
  document.getElementById("birthdate").value = data.birthdate;
  document.getElementById("idcard").value = data.idcard;
  document.getElementById("bloodtype").value = data?.bloodtype ?? "";
  document.getElementById("gender").value = data.gender;
  document.getElementById("weight").value = data.weight;
  document.getElementById("height").value = data.height;
  document.getElementById("address").value = data.address;
}

function addTableRow(tableId, columns, isLoaded = false, onDelete) {
  const tableBody = document.getElementById(tableId);
  if (!tableBody) {
    console.error(`Table body with id '${tableId}' not found.`);
    return;
  }

  const newRow = document.createElement("tr");
  newRow.dataset.isFromLoaded = isLoaded;

  // Create cells from column config
  columns.forEach((col) => {
    const td = document.createElement("td");
    const input = document.createElement("input");
    input.type = col.type || "text";
    input.className = "table-input";
    if (col.placeholder) input.placeholder = col.placeholder;
    if (col.value) input.value = col.value;
    td.appendChild(input);
    newRow.appendChild(td);
  });

  // Add delete button
  const deleteCell = document.createElement("td");
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "delete-btn";
  deleteBtn.addEventListener("click", () => {
    if (typeof onDelete === "function") {
      // Gather current input values before delete
      const data = {};
      newRow.querySelectorAll("input").forEach((input, i) => {
        data[columns[i]?.key || `col${i + 1}`] = input.value;
      });
      onDelete(data, newRow);
    } else {
      newRow.remove();
    }
  });
  deleteCell.appendChild(deleteBtn);
  newRow.appendChild(deleteCell);

  tableBody.appendChild(newRow);
}

// (ฟังก์ชันเพิ่มแถวของ อาหาร/ออกกำลังกาย)
function addFoodRow(
  date = "",
  name = "",
  time = "",
  isLoaded = false,
  onDelete
) {
  addTableRow(
    "foodTableBody",
    [
      { key: "date", type: "date", value: date },
      { key: "name", type: "text", placeholder: "ชื่ออาหาร", value: name },
      { key: "time", type: "time", value: time },
    ],
    isLoaded,
    onDelete
  );
}

function addExerciseRow(
  date = "",
  name = "",
  time = "",
  isLoaded = false,
  onDelete
) {
  addTableRow(
    "exerciseTableBody",
    [
      { key: "date", type: "date", value: date },
      { key: "name", type: "text", placeholder: "ประเภทกีฬา", value: name },
      { key: "time", type: "time", value: time },
    ],
    isLoaded,
    onDelete
  );
}

// ------------------------------------
// ฟังก์ชันบันทึกข้อมูล (Save)
// ------------------------------------

function saveProfileData(patientId) {
  // (รวบรวมข้อมูลจากฟอร์ม 'profileForm')
  const dataToSave = {
    firstName: document.getElementById("firstname").value,
    lastName: document.getElementById("lastname").value,
    birthDate: document.getElementById("birthdate").value,
    idCard: document.getElementById("idcard").value,
    bloodType: document.getElementById("bloodtype").value,
    gender: document.getElementById("gender").value,
    weight: document.getElementById("weight").value,
    height: document.getElementById("height").value,
    address: document.getElementById("address").value,
  };
  console.log("Staff กำลังบันทึก (ประวัติ):", dataToSave);

  fetch(`/api/patients/update/${patientId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataToSave),
  })
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;
      if (!data?.error) {
        alert("บันทึกข้อมูลเรียบร้อย!");
      } else {
        alert("เกิดข้อผิดพลาด: " + data.message);
      }
    })
    .catch((error) => console.error("Error saving data:", error));
  // (ยิง API... fetch(...))
}

function saveLabData(patientId) {
  // (รวบรวมข้อมูลจากฟอร์ม 'labForm')
  const dataToSave = {
    patientId: patientId,
    wbc: document.getElementById("wbc").value,
    rbc: document.getElementById("rbc").value,
    hb: document.getElementById("hb").value,
    fbs: document.getElementById("fbs").value,
    hba1c: document.getElementById("hba1c").value,
    ldl: document.getElementById("ldl").value,
    hdl: document.getElementById("hdl").value,
    cholesterol: document.getElementById("cholesterol").value,
  };
  console.log("Staff กำลังบันทึก (ผล Lab):", dataToSave);
  alert("ทดสอบบันทึกผล Lab สำเร็จ!");

  // (ยิง API... fetch(...))
}

function saveDietData(patientId) {
  // (รวบรวมข้อมูลจากฟอร์ม 'dietForm')
  const foodData = [];
  document.querySelectorAll("#foodTableBody tr").forEach((row) => {
    const inputs = row.querySelectorAll("input");
    const rowData = {
      date: inputs[0].value,
      foodName: inputs[1].value,
      time: inputs[2].value,
    };
    if (rowData.date || rowData.name || rowData.time) foodData.push(rowData);
  });

  const exerciseData = [];
  document.querySelectorAll("#exerciseTableBody tr").forEach((row) => {
    const inputs = row.querySelectorAll("input");
    const rowData = {
      date: inputs[0].value,
      sportType: inputs[1].value,
      time: inputs[2].value,
    };
    if (rowData.date || rowData.name || rowData.time)
      exerciseData.push(rowData);
  });

  const dataToSave = {
    patientId: patientId,
    food: foodData,
    exercise: exerciseData,
  };
  console.log("Staff กำลังบันทึก (อาหาร/ออกกำลังกาย):", dataToSave);

  fetch(`/api/exercises/replace-all`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataToSave),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result?.error) {
        alert(result?.message);
      } else {
        alert("บันทึกข้อมูลเรียบร้อย!");
      }
    })
    .catch((error) => console.error("Error saving data:", error));

  // (ยิง API... fetch(...))
}

function updateBpDisplay(sys, dia, pul) {
  document.getElementById("currentSys").textContent = sys || "--";
  document.getElementById("currentDia").textContent = dia || "--";
  document.getElementById("currentPul").textContent = pul || "--";
}

function addBpRow(
  date = "",
  sys = "",
  dia = "",
  pul = "",
  time = "",
  isLoaded = false,
  onDelete
) {
  const tableBody = document.getElementById("bpTableBody");
  if (!tableBody) {
    console.error("Table body with id 'bpTableBody' not found.");
    return;
  }

  const newRow = document.createElement("tr");
  newRow.dataset.isFromLoaded = isLoaded;

  // Create cells for inputs
  const dateCell = createInputCell("date", date, true);
  const sysCell = createInputCell("number", sys, "SYS");
  const diaCell = createInputCell("number", dia, "DIA");
  const pulCell = createInputCell("number", pul, "PUL");
  const timeCell = createInputCell("time", time, true);

  // Delete button
  const deleteCell = createButtonCell("Delete", () => {
    if (typeof onDelete === "function") {
      onDelete({ date, sys, dia, pul, time }, newRow);
    } else {
      newRow.remove(); // fallback to basic removal
    }
  });

  // Append all cells
  [dateCell, sysCell, diaCell, pulCell, timeCell, deleteCell].forEach((cell) =>
    newRow.appendChild(cell)
  );

  tableBody.appendChild(newRow);
}

function saveBpData(patientId) {
  console.log("กำลังบันทึกข้อมูลความดัน...");
  const bpData = [];
  document.querySelectorAll("#bpTableBody tr").forEach((row) => {
    const inputs = row.querySelectorAll("input");
    if (!Array.from(inputs).every((input) => input.value)) return;
    const rowData = {
      date: inputs[0]?.value,
      sys: inputs[1]?.value,
      dia: inputs[2]?.value,
      pul: inputs[3]?.value,
      time: inputs[4]?.value,
    };
    if (
      rowData.date ||
      rowData.sys ||
      rowData.dia ||
      rowData.pul ||
      rowData.time
    )
      bpData.push(rowData);
  });

  const dataToSave = { patientId: patientId, history: bpData };
  console.log("ข้อมูลที่จะส่ง:", dataToSave);

  fetch(`/api/records/pressures/replace-all`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataToSave),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result?.error) {
        alert(result?.message);
      } else {
        alert("ทดสอบบันทึกข้อมูลสำเร็จ!");
      }
    })
    .catch((error) => console.error("Error saving data:", error));

  const lastRow = bpData[bpData.length - 1];
  if (lastRow) updateBpDisplay(lastRow.sys, lastRow.dia, lastRow.pul);
}

function saveMedicationData(patientId) {
  const medData = [];

  document.querySelectorAll("#historyTableBody tr").forEach((row) => {
    const inputs = row.querySelectorAll("input");
    if (!Array.from(inputs).every((input) => input.value)) return;
    const rowData = {
      date: inputs[0].value,
      diagnosis: inputs[1].value,
      sid: inputs[2].value,
    };
    if (rowData.date || rowData.diagnosis || rowData.sid || rowData.pid)
      medData.push(rowData);
  });

  const dataToSave = { patientId: patientId, history: medData };
  console.log("ข้อมูลที่จะส่ง:", dataToSave);

  fetch(`/api/records/medications/replace-all`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataToSave),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result?.error) {
        alert(result?.message);
      } else {
        alert("ทดสอบบันทึกข้อมูลสำเร็จ!");
      }
    })
    .catch((error) => console.error("Error saving data:", error));
}

function saveAppointmentData(patientId) {
  const apptData = [];

  document.querySelectorAll("#apptTableBody tr").forEach((row) => {
    const inputs = row.querySelectorAll("input");
    const selects = row.querySelectorAll("select");

    if (!Array.from(inputs).every((input) => input.value)) return;

    const rowData = {
      date: inputs[0]?.value,
      time: inputs[1]?.value,
      sid: inputs[2]?.value,
      status: selects[0]?.value,
    };
    if (rowData.date || rowData.time || rowData.sid || rowData.status)
      apptData.push(rowData);
  });

  const dataToSave = { patientId: patientId, appointments: apptData };
  console.log("ข้อมูลที่จะส่ง:", dataToSave);

  fetch(`/api/appointments/replace-all`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataToSave),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result?.error) {
        alert(result?.message);
      } else {
        alert("ทดสอบบันทึกข้อมูลสำเร็จ!");
      }
    })
    .catch((error) => console.error("Error saving data:", error));
}

function updateBsDisplay(sugar) {
  document.getElementById("currentSugar").textContent = sugar || "--";
}

function addBsRow(
  date = "",
  sugar = "",
  time = "",
  isLoaded = false,
  onDelete
) {
  const tableBody = document.getElementById("bsTableBody");
  if (!tableBody) {
    console.error("Table body with id 'bsTableBody' not found.");
    return;
  }

  const newRow = document.createElement("tr");
  newRow.dataset.isFromLoaded = isLoaded;

  // Create cells
  const dateCell = createInputCell("date", date, true);
  const sugarCell = createInputCell("number", sugar, "ค่าน้ำตาล");
  const timeCell = createInputCell("time", time, true);
  const deleteCell = createButtonCell("Delete", () => {
    if (typeof onDelete === "function") {
      onDelete({ date, sugar, time }, newRow);
    } else {
      newRow.remove(); // default delete behavior
    }
  });

  // Append all to the row
  [dateCell, sugarCell, timeCell, deleteCell].forEach((cell) =>
    newRow.appendChild(cell)
  );

  tableBody.appendChild(newRow);
}

function addMedicationRow(
  doctorId,
  date = "",
  diagnosis = "",
  isLoaded = false
) {
  const tableBody = document.getElementById("historyTableBody");
  if (!tableBody) {
    console.error("Table body element not found.");
    return;
  }

  const newRow = document.createElement("tr");
  newRow.dataset.isFromLoaded = isLoaded;

  // Build cells programmatically (safer than innerHTML)
  const cells = [
    createInputCell("date", date, true),
    createInputCell("text", diagnosis),
    createReadOnlyCell(doctorId),
    createButtonCell("Delete", () => newRow.remove()),
  ];

  // Append all cells to the row
  cells.forEach((cell) => newRow.appendChild(cell));
  tableBody.appendChild(newRow);
}

function addAppointmentRow(
  doctorId,
  patientId,
  date = "",
  time = "",
  status = "upcoming",
  isLoaded = false
) {
  const tableBody = document.getElementById("apptTableBody");
  if (!tableBody) {
    console.error("Table body element not found.");
    return;
  }

  const newRow = document.createElement("tr");
  newRow.dataset.isFromLoaded = isLoaded;

  // Build cells programmatically (safer than innerHTML)
  const cells = [
    createInputCell("date", date, true),
    createInputCell("time", time, true),
    createReadOnlyCell(doctorId),
    createSelectCell(
      [
        { value: "upcoming", text: "นัดหมายล่วงหน้า" },
        { value: "cancelled", text: "ยกเลิก" },
        { value: "completed", text: "เสร็จสิน" },
      ],
      status
    ),
    createButtonCell("Delete", () => newRow.remove()),
  ];

  // Append all cells to the row
  cells.forEach((cell) => newRow.appendChild(cell));
  tableBody.appendChild(newRow);
}

/* ---------- Helper functions ---------- */

function createReadOnlyCell(value) {
  const td = document.createElement("td");
  const input = document.createElement("input");
  input.type = "text";
  input.className = "table-input";
  input.readOnly = true;
  input.value = value;
  td.appendChild(input);
  return td;
}

function createSelectCell(options, value) {
  const td = document.createElement("td");
  const select = document.createElement("select");

  select.setAttribute("required", true);
  select.className = "table-select";
  select.value = value;

  options.forEach(({ value, text }) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    select.appendChild(option);
  });

  td.appendChild(select);
  return td;
}

/* ---------- Reusable Helpers ---------- */
function createInputCell(type, value = "", placeholder = "", required = false) {
  const td = document.createElement("td");
  const input = document.createElement("input");
  input.setAttribute("required", required);
  input.type = type;
  input.className = "table-input";
  input.value = value;
  if (placeholder) input.placeholder = placeholder;
  td.appendChild(input);
  return td;
}

function createButtonCell(label, onClick) {
  const td = document.createElement("td");
  const button = document.createElement("button");
  button.textContent = label;
  button.className = "delete-btn";
  button.addEventListener("click", onClick);
  td.appendChild(button);
  return td;
}

function saveBsData(patientId) {
  console.log("กำลังบันทึกข้อมูลค่าน้ำตาล...");
  const bsData = [];

  document.querySelectorAll("#bsTableBody tr").forEach((row) => {
    const inputs = row.querySelectorAll("input");
    if (!Array.from(inputs).every((input) => input.value)) return;
    const rowData = {
      date: inputs[0].value,
      sugar: inputs[1].value,
      time: inputs[2].value,
    };
    if (rowData.date || rowData.sugar || rowData.time) bsData.push(rowData);
  });

  const dataToSave = { patientId: patientId, history: bsData };
  console.log("ข้อมูลที่จะส่ง:", dataToSave);

  fetch(`/api/records/sugar/replace-all`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataToSave),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result?.error) {
        alert(result?.message);
      } else {
        alert("ทดสอบบันทึกข้อมูลสำเร็จ!");
      }
    });

  const lastRow = bsData[bsData.length - 1];
  if (lastRow) updateBsDisplay(lastRow.sugar);
}

function populateTable(tableId, data, columns, emptyMessage, onDelete) {
  const tableBody = document.getElementById(tableId);
  if (!tableBody) {
    console.error(`Table body with id "${tableId}" not found.`);
    return;
  }

  tableBody.innerHTML = "";

  data.forEach((item, index) => {
    const newRow = document.createElement("tr");

    // Create data cells
    columns.forEach((col) => {
      const td = document.createElement("td");
      const value =
        typeof col.render === "function" ? col.render(item) : item[col.key];
      td.innerHTML = value ?? "";
      newRow.appendChild(td);
    });

    // Create delete button
    const tdAction = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";

    deleteBtn.addEventListener("click", () => {
      if (typeof onDelete === "function") {
        onDelete(item, index, newRow); // call custom callback
      } else {
        newRow.remove(); // fallback default behavior
      }
    });

    // tdAction.appendChild(deleteBtn);
    // newRow.appendChild(tdAction);
    tableBody.appendChild(newRow);
  });
}

/* ---------- Specialized Wrappers ---------- */

function populateHistoryTable(historyData) {
  populateTable(
    "historyTableBody",
    historyData,
    [{ key: "date" }, { key: "diagnosis" }, { key: "doctor" }],
    "ยังไม่มีประวัติการรักษา"
  );
}

function populateFood(foods) {
  populateTable(
    "foodTableBody",
    foods,
    [{ key: "date" }, { key: "name" }, { key: "time" }],
    "ยังไม่มีข้อมูล"
  );
}

function populateExercise(exercises) {
  populateTable(
    "exerciseTableBody",
    exercises,
    [{ key: "date" }, { key: "name" }, { key: "time" }],
    "ยังไม่มีข้อมูล"
  );
}

function populatePressures(pressures) {
  populateTable(
    "bpTableBody",
    pressures,
    [
      { key: "date" },
      { key: "sys" },
      { key: "dia" },
      { key: "pul" },
      { key: "time" },
    ],
    "ยังไม่มีข้อมูล"
  );
}

function populateBloodSugar(sugars) {
  populateTable(
    "bsTableBody",
    sugars,
    [{ key: "date" }, { key: "value" }, { key: "time" }],
    "ยังไม่มีข้อมูล"
  );
}

function populateAppointmentTable(appointmentData) {
  populateTable(
    "apptTableBody",
    appointmentData,
    [
      { key: "date" },
      { key: "time" },
      { key: "doctor" },
      {
        key: "status",
        render: (item) => getStatusBadge(item.status),
      },
    ],
    "ยังไม่มีการนัดหมาย"
  );
}

function getStatusBadge(status) {
  const badges = {
    upcoming: '<span class="status-badge upcoming">นัดหมายล่วงหน้า</span>',
    completed: '<span class="status-badge completed">เสร็จสิ้น</span>',
    cancelled: '<span class="status-badge cancelled">ยกเลิก</span>',
  };
  return badges[status] || "";
}
