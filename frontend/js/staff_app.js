// ====================================================================
// js/staff_app.js - (ไฟล์หลักสำหรับควบคุม Dashboard บุคลากร)
// ====================================================================

document.addEventListener("DOMContentLoaded", () => {
  // --- (ส่วนที่ 1: การยืนยันตัวตน และ โหลดข้อมูลส่วนกลาง) ---

  // (สมมติว่าเราเก็บ ID บุคลากรไว้ใน localStorage ตอน Login)
  // const staffId = localStorage.getItem('staffId');

  // (สำหรับทดสอบ)
  const userId = localStorage.getItem("userId");
  const staffId = localStorage.getItem("staffId");

  if (!userId || !staffId) {
    // ถ้าไม่มี ID คนไข้ (ยังไม่ได้ล็อกอิน) ให้เด้งกลับไปหน้า Log in
    alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
    window.location.href = "index.html";
    return; // หยุดการทำงานทันที
  }
  // โหลดข้อมูลส่วนกลาง (Header)
  loadStaffGlobalData(userId);

  // --- (ส่วนที่ 2: การโหลดข้อมูลตามหน้า) ---
  // ตรวจสอบว่าเรากำลังอยู่ที่หน้าไหน แล้วสั่งโหลดข้อมูลเฉพาะของหน้านั้น
  const path = window.location.pathname;

  if (path.includes("profile_staff.html")) {
    setupStaffProfilePage(userId);
  } else if (path.includes("staff_patient.html")) {
    setupPatientListPage(staffId);
  }
  // (หากมีหน้าอื่นๆ ของ Staff ก็เพิ่ม 'else if' ที่นี่)
});

/**
 * ฟังก์ชัน: โหลดข้อมูลส่วนกลาง (Header ของบุคลากร)
 */
function loadStaffGlobalData(staffId) {
  // --- (จำลองการยิง API) ---

  fetch(`/api/auth/info/${staffId}`)
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;
      if (document.getElementById("username")) {
        document.getElementById(
          "username"
        ).textContent = `นพ. ${data.firstName}`;
      }
      if (document.getElementById("userId")) {
        document.getElementById("userId").textContent = data.sid;
      }
    })
    .catch((error) => console.error("Error loading global data:", error));
}

// ******************************************************
// *** 1. ฟังก์ชันสำหรับหน้า "โปรไฟล์บุคลากร" (profile_staff.html) ***
// ******************************************************

/**
 * ฟังก์ชัน: ตั้งค่า Event Listener และโหลดข้อมูลหน้าโปรไฟล์บุคลากร
 */
function setupStaffProfilePage(staffId) {
  console.log("กำลังตั้งค่าหน้า โปรไฟล์บุคลากร...");

  const editBtn = document.getElementById("editProfileBtn");
  const saveBtn = document.getElementById("saveProfileBtn");
  const profileForm = document.getElementById("staffProfileForm");

  // โหลดข้อมูลโปรไฟล์ (และตั้งค่าเป็น readonly ตอนเริ่ม)
  loadStaffProfileData(staffId);

  // ควบคุมปุ่ม
  editBtn.addEventListener("click", () => {
    toggleStaffProfileEdit(true); // เปิดโหมดแก้ไข
    editBtn.style.display = "none";
    saveBtn.style.display = "block";
  });

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveStaffProfileData(staffId); // บันทึกข้อมูล
    toggleStaffProfileEdit(false); // ปิดโหมดแก้ไข
    editBtn.style.display = "block";
    saveBtn.style.display = "none";
  });
}

/**
 * ฟังก์ชัน: โหลดข้อมูลโปรไฟล์บุคลากร (จำลอง)
 */
function loadStaffProfileData(staffId) {
  console.log("กำลังโหลดข้อมูลโปรไฟล์บุคลากร...");

  fetch(`/api/auth/info/${staffId}`)
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;
      populateStaffProfileForm({
        firstname: data.firstName,
        lastname: data.lastName,
        idcard: data.idCard ?? "",
        phone: data.phone ?? "",
        staffId: data.sid,
      });
    })
    .catch((error) => console.error("Error loading global data:", error));

  toggleStaffProfileEdit(false);
}

/**
 * ฟังก์ชัน: ช่วยเติมข้อมูลลงในฟอร์มโปรไฟล์บุคลากร
 */
function populateStaffProfileForm(data) {
  document.getElementById("firstname").value = data.firstname;
  document.getElementById("lastname").value = data.lastname;
  document.getElementById("idcard").value = data.idcard;
  document.getElementById("phone").value = data.phone;
  document.getElementById("staffId").value = data.staffId;
}

/**
 * ฟังก์ชัน: สลับโหมด อ่านอย่างเดียว / แก้ไข
 */
function toggleStaffProfileEdit(isEditable) {
  // บุคลากรแก้ไขได้แค่เบอร์โทร
  document.getElementById("phone").readOnly = !isEditable;

  // ช่องอื่นๆ อ่านอย่างเดียวตลอด
  document.getElementById("firstname").readOnly = true;
  document.getElementById("lastname").readOnly = true;
  document.getElementById("idcard").readOnly = true;
  document.getElementById("staffId").readOnly = true;
}

/**
 * ฟังก์ชัน: รวบรวมข้อมูลและ "บันทึก" (โปรไฟล์บุคลากร)
 */
function saveStaffProfileData(accountId) {
  const dataToSave = {
    accountId,
    phone: document.getElementById("phone").value,
  };

  console.log("ข้อมูลโปรไฟล์บุคลากรที่จะส่งไป Backend:", dataToSave);

  fetch(`/api/auth/staff/info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dataToSave),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.error) {
        alert("บันทึกข้อมูลเรียบร้อย!");
      } else {
        alert("เกิดข้อผิดพลาด: " + data.message);
      }
    })
    .catch((error) => console.error("Error saving data:", error));
}

// ******************************************************
// *** 2. ฟังก์ชันสำหรับหน้า "คนไข้" (staff_patient.html) ***
// ******************************************************

// (ตัวแปร Global สำหรับเก็บข้อมูลคนไข้ทั้งหมดในหน้านี้)
let allPatientsData = [];

/**
 * ฟังก์ชัน: ตั้งค่า Event Listener และโหลดข้อมูลคนไข้
 */
function setupPatientListPage(staffId) {
  console.log("กำลังตั้งค่าหน้า รายชื่อคนไข้...");

  // 1. ค้นหาองค์ประกอบ
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  // 2. ผูก Event
  // (ใช้ 'keyup' เพื่อให้ค้นหาทันทีที่พิมพ์)
  searchInput.addEventListener("keyup", filterPatients);
  searchBtn.addEventListener("click", filterPatients);

  // 3. โหลดรายชื่อคนไข้ทั้งหมด
  loadAllPatients(staffId);
}

/**
 * ฟังก์ชัน: โหลดรายชื่อคนไข้ทั้งหมด (จำลอง)
 */
function loadAllPatients(staffId) {
  console.log("กำลังโหลดรายชื่อคนไข้ทั้งหมด...");

  // --- (จำลองการยิง API) ---
  // (Backend ควรส่งรายชื่อคนไข้ที่ "staffId" คนนี้ดูแลอยู่)

  fetch(`/api/patients`)
    .then((response) => response.json())
    .then((result) => {
      const data = result.data;
      allPatientsData = data;
      renderPatientList(allPatientsData);
    })
    .catch((error) => console.error("Error loading patient list:", error));

  // --- (สำหรับทดสอบชั่วคราว) ---
  //   allPatientsData = [
  //     { id: "P-123456", name: "สมหมาย รักสุขภาพ", age: "45 ปี", blood: "O" },
  //     { id: "P-234567", name: "สุดา ใจดี", age: "52 ปี", blood: "AB" },
  //     { id: "P-345678", name: "มานี รักเรียน", age: "8 ปี", blood: "B" },
  //     { id: "P-456789", name: "ประสิทธิ์ วิทยา", age: "67 ปี", blood: "A" },
  //     { id: "P-567890", name: "สมชาย จริงใจ", age: "33 ปี", blood: "A" },
  //   ];
  //   renderPatientList(allPatientsData);
  // --- (จบส่วนทดสอบ) ---
}

/**
 * ฟังก์ชัน: นำข้อมูล Array มาสร้างเป็นการ์ด HTML
 */
function renderPatientList(patients) {
  const patientListDiv = document.getElementById("patientList");
  const noResultsDiv = document.getElementById("noResults");

  patientListDiv.innerHTML = ""; // เคลียร์ของเก่า

  if (patients.length === 0) {
    noResultsDiv.style.display = "block"; // แสดง "ไม่พบ"
  } else {
    noResultsDiv.style.display = "none"; // ซ่อน "ไม่พบ"
  }

  patients.forEach((patient) => {
    const card = document.createElement("div");
    card.className = "patient-card";
    card.setAttribute("data-patient-id", patient.pid);

    card.innerHTML = `
            <div class="patient-info">
                <div class="patient-name">${patient.patientName}</div>
                <div class="patient-details">
                    <span class="patient-id">ID: ${patient.pid}</span>
                    <span class="patient-age">อายุ: ${getAge(
                      patient.dateOfBirth,
                      true
                    )}</span>
                    <span class="patient-blood">กรุ๊ปเลือด: ${
                      patient.bloodType
                    }</span>
                </div>
            </div>
            <button class="view-btn">ดูข้อมูล</button>
        `;

    // *** (สำคัญ) ผูก Event Click ให้ปุ่ม "ดูข้อมูล" ***
    card.querySelector(".view-btn").addEventListener("click", () => {
      viewPatient(patient.pid);
    });

    patientListDiv.appendChild(card);
  });
}

/**
 * ฟังก์ชัน: กรองรายชื่อคนไข้ตามช่องค้นหา
 */
function filterPatients() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  const filteredPatients = allPatientsData.filter((patient) => {
    // ค้นหาจาก "ชื่อ" (และ ID ถ้าต้องการ)
    return (
      patient.name.toLowerCase().includes(searchTerm) ||
      patient.id.toLowerCase().includes(searchTerm)
    );
  });

  // แสดงผลเฉพาะที่ค้นหาเจอ
  renderPatientList(filteredPatients);
}

/**
 * ฟังก์ชัน: เปลี่ยนหน้าไปยังหน้า Dashboard ของคนไข้
 * (เราจะส่ง ID คนไข้ไปทาง URL)
 */
function viewPatient(patientId) {
  console.log(`บุคลากรกำลังดูข้อมูลคนไข้ ID: ${patientId}`);

  // เปลี่ยนหน้าไปยังหน้าที่เราสร้างไว้ (หน้าเดียวรวมทุกอย่าง)
  window.location.href = `staff_edit_patient.html?id=${patientId}`;
}

function getAge(date, isBuddhist = false) {
  if (!date) return null;

  let birthDate;

  if (isBuddhist) {
    const bd = new Date(date);
    bd.setFullYear(bd.getFullYear() - 543);
    birthDate = bd;
  } else {
    birthDate = new Date(date);
  }

  if (isNaN(birthDate)) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}
