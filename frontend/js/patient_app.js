// ====================================================================
// js/patient_app.js - (ไฟล์หลักสำหรับควบคุม Dashboard คนไข้)
// ====================================================================

// รอให้หน้าเว็บโหลดเสร็จก่อน
document.addEventListener("DOMContentLoaded", async () => {
  // --- (ส่วนที่ 1: การยืนยันตัวตน และ โหลดข้อมูลส่วนกลาง) ---

  // (สมมติว่าเราเก็บ ID คนไข้ไว้ใน localStorage ตอน Login)
  const userId = localStorage.getItem("userId");
  const patientId = localStorage.getItem("patientId");

  if (!userId || !patientId) {
    // ถ้าไม่มี ID คนไข้ (ยังไม่ได้ล็อกอิน) ให้เด้งกลับไปหน้า Log in
    alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
    window.location.href = "index.html";
    return; // หยุดการทำงานทันที
  }

  // เมื่อมี ID แล้ว ให้โหลดข้อมูลส่วนกลาง (Header)
  await loadGlobalData(userId);

  // --- (ส่วนที่ 2: การโหลดข้อมูลตามหน้า) ---
  // ตรวจสอบว่าเรากำลังอยู่ที่หน้าไหน แล้วสั่งโหลดข้อมูลเฉพาะของหน้านั้น

  const path = window.location.pathname;

  if (path.includes("profile_patient.html")) {
    setupProfilePage(userId, patientId);
  } else if (path.includes("patient_foodandexercise.html")) {
    setupFoodExercisePage(patientId);
  } else if (path.includes("patient_bloodpressure.html")) {
    setupBloodPressurePage(patientId);
  } else if (path.includes("patient_bloodsugar.html")) {
    setupBloodSugarPage(patientId);
  } else if (path.includes("patient_lab.html")) {
    loadLabData(patientId); // (Read-only)
  } else if (path.includes("patient_medicine.html")) {
    loadMedicineData(patientId); // (Read-only)
  } else if (path.includes("patient_history.html")) {
    loadTreatmentHistory(patientId); // (Read-only)
  } else if (path.includes("patient_appointments.html")) {
    loadAppointmentData(patientId); // (Read-only)
  }
});

/**
 * ฟังก์ชัน: โหลดข้อมูลส่วนกลาง (ที่จะใช้ในทุกหน้า)
 * เช่น ชื่อ และ ID ที่ Header
 */
function loadGlobalData(accountId) {
  // --- (จำลองการยิง API ไปหา Backend) ---

  fetch(`/api/auth/info/${accountId}`)
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;

      if (document.getElementById("username")) {
        document.getElementById("username").textContent = data.firstName;
      }
      if (document.getElementById("userId")) {
        document.getElementById("userId").textContent = data.pid;
      }
    })
    .catch((error) => console.error("Error loading global data:", error));

}

// ******************************************************
// *** 1. ฟังก์ชันสำหรับหน้า "โปรไฟล์" (profile_patient.html) ***
// ******************************************************

/**
 * ฟังก์ชัน: ตั้งค่า Event Listener และโหลดข้อมูลหน้าโปรไฟล์
 */
async function setupProfilePage(patientId, userPatientId) {
  console.log("กำลังตั้งค่าหน้า โปรไฟล์...");

  const editBtn = document.getElementById("editProfileBtn");
  const saveBtn = document.getElementById("saveProfileBtn");
  const profileForm = document.getElementById("profileForm");

  // โหลดข้อมูลโปรไฟล์ (และตั้งค่าเป็น readonly ตอนเริ่ม)
  await loadProfileData(patientId);

  // ควบคุมปุ่ม
  editBtn.addEventListener("click", () => {
    toggleProfileEdit(true); // เปิดโหมดแก้ไข
    editBtn.style.display = "none";
    saveBtn.style.display = "block";
  });

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault(); // ป้องกันหน้ารีเฟรช
    saveProfileData(userPatientId); // บันทึกข้อมูล
    toggleProfileEdit(false); // ปิดโหมดแก้ไข
    editBtn.style.display = "block";
    saveBtn.style.display = "none";
  });
}

/**
 * ฟังก์ชัน: โหลดข้อมูลโปรไฟล์ (จำลอง)
 */
function loadProfileData(accountId) {
  console.log("กำลังโหลดข้อมูลโปรไฟล์...");
  fetch(`/api/patients/${accountId}`)
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;
      populateProfileForm(data);
      toggleProfileEdit(false);
    })
    .catch((error) => console.error("Error loading global data:", error));

  // ตั้งค่าเป็น "อ่านอย่างเดียว" ตอนเริ่มต้น
}

/**
 * ฟังก์ชัน: ช่วยเติมข้อมูลลงในฟอร์มโปรไฟล์
 */
function populateProfileForm(data) {
  document.getElementById("firstname").value = data.firstName;
  document.getElementById("lastname").value = data.lastName;
  document.getElementById("birthdate").value = data.dateOfBirth;
  document.getElementById("idcard").value = data.idCard;
  document.getElementById("bloodtype").value = data.bloodType;
  document.getElementById("gender").value = data.gender;
  document.getElementById("weight").value = data.weight;
  document.getElementById("height").value = data.height;
  document.getElementById("phone").value = data.phone;
  // document.getElementById("emergencyPhone").value = data.reservePhone;
  document.getElementById("address").value = data.address;
}

/**
 * ฟังก์ชัน: สลับโหมด อ่านอย่างเดียว / แก้ไข
 */
function toggleProfileEdit(isEditable) {
  document.getElementById("weight").readOnly = !isEditable;
  document.getElementById("height").readOnly = !isEditable;
  document.getElementById("phone").readOnly = !isEditable;
  document.getElementById("address").readOnly = !isEditable;
}

/**
 * ฟังก์ชัน: รวบรวมข้อมูลและ "บันทึก" (โปรไฟล์)
 */
function saveProfileData(patientId) {
  const dataToSave = {
    weight: document.getElementById("weight").value,
    height: document.getElementById("height").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
  };

  console.log("ข้อมูลโปรไฟล์ที่จะส่งไป Backend:", dataToSave);

  fetch(`api/patients/update/${patientId}`, {
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
}

// ******************************************************
// *** 2. ฟังก์ชันสำหรับหน้า "อาหาร/ออกกำลังกาย" ***
// ******************************************************

function setupFoodExercisePage(patientId) {
  console.log("กำลังตั้งค่าหน้า อาหาร/ออกกำลังกาย...");
  document
    .getElementById("addFoodRowBtn")
    .addEventListener("click", addFoodRow);
  document
    .getElementById("addExerciseRowBtn")
    .addEventListener("click", addExerciseRow);
  document.getElementById("saveDataBtn").addEventListener("click", () => {
    saveFoodAndExerciseData(patientId);
  });
  loadFoodAndExerciseData(patientId);
}

function loadFoodAndExerciseData(patientId) {
  fetch(`/api/exercises/${patientId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((result) => {
      const data = result.data;
      if (!result?.error) {
        data.foods.forEach((food) =>
          addFoodRow(food.date, food.foodName, food.time, true)
        );
        data.sports.forEach((sport) =>
          addExerciseRow(sport.date, sport.type, sport.time, true)
        );
      } else {
        alert("เกิดข้อผิดพลาด: " + data?.message);
      }
    })
    .catch((error) => console.error("Error saving data:", error));
}

function addFoodRow(date = "", name = "", time = "", isLoaded = false) {
  const tableBody = document.getElementById("foodTableBody");
  const newRow = document.createElement("tr");
  newRow.dataset.isFromLoaded = isLoaded;

  newRow.innerHTML = `
        <td><input type="date" class="table-input" value="${date}"></td>
        <td><input type="text" class="table-input" placeholder="ชื่ออาหาร" value="${name}"></td>
        <td><input type="time" class="table-input" value="${time}"></td>
    `;
  tableBody.appendChild(newRow);
}

function addExerciseRow(date = "", name = "", time = "", isLoaded = false) {
  const tableBody = document.getElementById("exerciseTableBody");
  const newRow = document.createElement("tr");
  newRow.dataset.isFromLoaded = isLoaded;

  newRow.innerHTML = `
        <td><input type="date" class="table-input" value="${date}"></td>
        <td><input type="text" class="table-input" placeholder="ประเภทกีฬา" value="${name}"></td>
        <td><input type="time" class="table-input" value="${time}"></td>
    `;
  tableBody.appendChild(newRow);
}

function saveFoodAndExerciseData(patientId) {
  console.log("กำลังบันทึกข้อมูลอาหาร/ออกกำลังกาย...");
  const foodData = [];
  document
    .querySelectorAll("#foodTableBody tr[data-is-from-loaded='false']")
    .forEach((row) => {
      const inputs = row.querySelectorAll("input");
      const rowData = {
        date: inputs[0].value,
        foodName: inputs[1].value,
        time: inputs[2].value,
      };
      if (rowData.date || rowData.name || rowData.time) foodData.push(rowData);
    });

  const exerciseData = [];
  document
    .querySelectorAll("#exerciseTableBody tr[data-is-from-loaded='false']")
    .forEach((row) => {
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

  fetch(`/api/exercises/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataToSave),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result?.error) {
        alert(result?.message);
      }
    })
    .catch((error) => console.error("Error saving data:", error));

  // (จำลองการส่งข้อมูล)
  alert("ทดสอบบันทึกข้อมูลสำเร็จ!");
}

// ******************************************************
// *** 3. ฟังก์ชันสำหรับหน้า "ความดันโลหิต" ***
// ******************************************************

function setupBloodPressurePage(patientId) {
  console.log("กำลังตั้งค่าหน้า ความดันโลหิต...");
  document.getElementById("addBpRowBtn").addEventListener("click", addBpRow);
  document.getElementById("saveDataBtn").addEventListener("click", () => {
    saveBpData(patientId);
  });
  loadBpData(patientId);
}

function loadBpData(patientId) {
  fetch(`/api/records/pressures/${patientId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((result) => {
      const data = result.data;
      if (!result?.error) {
        data.forEach((bp) =>
          addBpRow(bp.date, bp.sys, bp.dia, bp.pul, bp.time, true)
        );
        const { sys, dia, pul } = data[data.length - 1];
        updateBpDisplay(sys, dia, pul);
      } else {
        alert("เกิดข้อผิดพลาด: " + data?.message);
      }
    })
    .catch((error) => console.error("Error saving data:", error))
    .finally(() => {
      addBpRow();
    });
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
  isLoaded = false
) {
  const tableBody = document.getElementById("bpTableBody");
  const newRow = document.createElement("tr");
  newRow.dataset.isFromLoaded = isLoaded;

  newRow.innerHTML = `
        <td><input type="date" class="table-input" value="${date}"></td>
        <td><input type="number" class="table-input" placeholder="SYS" value="${sys}"></td>
        <td><input type="number" class="table-input" placeholder="DIA" value="${dia}"></td>
        <td><input type="number" class="table-input" placeholder="PUL" value="${pul}"></td>
        <td><input type="time" class="table-input" value="${time}"></td>
    `;
  tableBody.appendChild(newRow);
}

function saveBpData(patientId) {
  console.log("กำลังบันทึกข้อมูลความดัน...");
  const bpData = [];
  document
    .querySelectorAll("#bpTableBody tr[data-is-from-loaded='false']")
    .forEach((row) => {
      const inputs = row.querySelectorAll("input");
      if (!Array.from(inputs).every((input) => input.value)) return;
      const rowData = {
        date: inputs[0].value,
        sys: inputs[1].value,
        dia: inputs[2].value,
        pul: inputs[3].value,
        time: inputs[4].value,
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

  if (bpData.length < 1) return;

  const dataToSave = { patientId: patientId, history: bpData };
  console.log("ข้อมูลที่จะส่ง:", dataToSave);

  fetch(`/api/records/pressures/add`, {
    method: "POST",
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

// ******************************************************
// *** 4. ฟังก์ชันสำหรับหน้า "ค่าน้ำตาลในเลือด" ***
// ******************************************************

function setupBloodSugarPage(patientId) {
  console.log("กำลังตั้งค่าหน้า ค่าน้ำตาล...");
  document.getElementById("addBsRowBtn").addEventListener("click", addBsRow);
  document.getElementById("saveDataBtn").addEventListener("click", () => {
    saveBsData(patientId);
  });
  loadBsData(patientId);
}

function loadBsData(patientId) {
  fetch(`/api/records/sugar/${patientId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((result) => {
      const data = result.data;
      if (!result?.error) {
        data.forEach((bs) => addBsRow(bs.date, bs.sugar, bs.time, true));
        const { sugar } = data[data.length - 1];
        updateBsDisplay(sugar);
      } else {
        alert("เกิดข้อผิดพลาด: " + data?.message);
      }
    })
    .catch((error) => console.error("Error saving data:", error))
    .finally(() => {
      addBsRow(); // เพิ่มแถวว่าง
    });
}

function updateBsDisplay(sugar) {
  document.getElementById("currentSugar").textContent = sugar || "--";
}

function addBsRow(date = "", sugar = "", time = "", isLoaded = false) {
  const tableBody = document.getElementById("bsTableBody");
  const newRow = document.createElement("tr");
  newRow.dataset.isFromLoaded = isLoaded;

  newRow.innerHTML = `
        <td><input type="date" class="table-input" value="${date}"></td>
        <td><input type="number" class="table-input" placeholder="ค่าน้ำตาล" value="${sugar}"></td>
        <td><input type="time" class="table-input" value="${time}"></td>
    `;
  tableBody.appendChild(newRow);
}

function saveBsData(patientId) {
  console.log("กำลังบันทึกข้อมูลค่าน้ำตาล...");
  const bsData = [];
  document
    .querySelectorAll("#bsTableBody tr[data-is-from-loaded='false']")
    .forEach((row) => {
      const inputs = row.querySelectorAll("input");
      const rowData = {
        date: inputs[0].value,
        sugar: inputs[1].value,
        time: inputs[2].value,
      };
      if (rowData.date || rowData.sugar || rowData.time) bsData.push(rowData);
    });

  const dataToSave = { patientId: patientId, history: bsData };
  console.log("ข้อมูลที่จะส่ง:", dataToSave);

  fetch(`/api/records/sugar/add`, {
    method: "POST",
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

// ******************************************************
// *** 5. ฟังก์ชันสำหรับหน้า "ผลตรวจเลือด" (Read-only) ***
// ******************************************************

function loadLabData(patientId) {
  console.log("กำลังโหลดข้อมูลผลตรวจเลือด...");

  // (จำลองการโหลดข้อมูล)
  const testData = {
    lastUpdate: "04/11/2025",
    results: {
      wbc: "6.8",
      rbc: "4.7",
      hb: "14.5",
      fbs: "92",
      hba1c: "5.5",
      ldl: "110",
      hdl: "50",
      cholesterol: "180",
    },
  };
  populateLabForm(testData.results);
  document.getElementById(
    "lastUpdate"
  ).textContent = `อัพเดทล่าสุด: ${testData.lastUpdate}`;
}

function populateLabForm(data) {
  document.getElementById("wbc").value = data.wbc || "N/A";
  document.getElementById("rbc").value = data.rbc || "N/A";
  document.getElementById("hb").value = data.hb || "N/A";
  document.getElementById("fbs").value = data.fbs || "N/A";
  document.getElementById("hba1c").value = data.hba1c || "N/A";
  document.getElementById("ldl").value = data.ldl || "N/A";
  document.getElementById("hdl").value = data.hdl || "N/A";
  document.getElementById("cholesterol").value = data.cholesterol || "N/A";
}

// ******************************************************
// *** 6. ฟังก์ชันสำหรับหน้า "การจ่ายยา" (Read-only) ***
// ******************************************************

function loadMedicineData(patientId) {
  console.log("กำลังโหลดข้อมูลการจ่ายยา...");

  // (จำลองการโหลดข้อมูล)
  const testData = {
    history: [
      {
        date: "2025-11-05",
        type: "ยาเม็ด",
        name: "Paracetamol 500mg",
        quantity: "10 เม็ด",
      },
      { date: "2025-11-05", type: "ยาน้ำ", name: "ยาแก้ไอ", quantity: "1 ขวด" },
      {
        date: "2025-10-12",
        type: "ยาเม็ด",
        name: "Amlodipine 5mg",
        quantity: "30 เม็ด",
      },
    ],
  };
  populateMedicineTable(testData.history);
}

function populateMedicineTable(historyData) {
  const tableBody = document.getElementById("medicationTableBody");
  tableBody.innerHTML = ""; // เคลียร์ข้อมูลเก่าทิ้ง

  if (historyData.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="4">ยังไม่มีประวัติการจ่ายยา</td></tr>';
    return;
  }

  historyData.forEach((med) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
            <td>${med.date}</td>
            <td>${med.type}</td>
            <td>${med.name}</td>
            <td>${med.quantity}</td>
        `;
    tableBody.appendChild(newRow);
  });
}

// ******************************************************
// *** 7. ฟังก์ชันสำหรับหน้า "ประวัติการรักษา" (Read-only) ***
// ******************************************************

function loadTreatmentHistory(patientId) {
  console.log("กำลังโหลดข้อมูลประวัติการรักษา...");

  fetch(`/api/records/medications/${patientId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((result) => {
      const data = result.data;
      if (!result?.error) {
        populateHistoryTable(data);
      } else {
        alert("เกิดข้อผิดพลาด: " + data?.message);
      }
    })
    .catch((error) => console.error("Error saving data:", error));
}

function populateHistoryTable(historyData) {
  const tableBody = document.getElementById("historyTableBody");
  tableBody.innerHTML = ""; // เคลียร์ข้อมูลเก่าทิ้ง

  if (historyData.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="3" style="text-align: center;">ยังไม่มีประวัติการรักษา</td></tr>';
    return;
  }

  historyData.forEach((item) => {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
            <td>${item.date}</td>
            <td>${item.diagnosis}</td>
            <td>${item.doctor}</td>
        `;
    tableBody.appendChild(newRow);
  });
}

// ******************************************************
// *** 8. ฟังก์ชันสำหรับหน้า "การนัดหมายแพทย์" (Read-only) ***
// ******************************************************

function loadAppointmentData(patientId) {
  console.log("กำลังโหลดข้อมูลการนัดหมาย...");

  fetch(`/api/appointments/${patientId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((result) => {
      const data = result.data;
      if (!result?.error) {
        populateAppointmentTable(data);
      } else {
        alert("เกิดข้อผิดพลาด: " + data?.message);
      }
    })
    .catch((error) => console.error("Error saving data:", error));
}

function populateAppointmentTable(appointmentData) {
  const tableBody = document.getElementById("appointmentTableBody");
  tableBody.innerHTML = ""; // เคลียร์ข้อมูลเก่าทิ้ง

  if (appointmentData.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4">ยังไม่มีการนัดหมาย</td></tr>';
    return;
  }

  appointmentData.forEach((item) => {
    const newRow = document.createElement("tr");

    // แปลง status (string) เป็น HTML (badge)
    let statusBadge = "";
    if (item.status === "upcoming") {
      statusBadge =
        '<span class="status-badge upcoming">นัดหมายล่วงหน้า</span>';
    } else if (item.status === "completed") {
      statusBadge = '<span class="status-badge completed">เสร็จสิ้น</span>';
    } else if (item.status === "cancelled") {
      statusBadge = '<span class="status-badge cancelled">ยกเลิก</span>';
    }

    newRow.innerHTML = `
            <td>${item.date}</td>
            <td>${item.time}</td>
            <td>${item.doctor}</td>
            <td>${statusBadge}</td>
        `;
    tableBody.appendChild(newRow);
  });
}
