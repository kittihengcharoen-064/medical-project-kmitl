// ====================================================================
// js/patient_app.js - (ไฟล์หลักสำหรับควบคุม Dashboard คนไข้)
// ====================================================================

// รอให้หน้าเว็บโหลดเสร็จก่อน
document.addEventListener("DOMContentLoaded", () => {
    
    // --- (ส่วนที่ 1: การยืนยันตัวตน และ โหลดข้อมูลส่วนกลาง) ---
    
    // (สมมติว่าเราเก็บ ID คนไข้ไว้ใน localStorage ตอน Login)
    // const patientId = localStorage.getItem('patientId'); 
    
    // (สำหรับทดสอบ)
    const patientId = 'P-123456'; // สมมติว่านี่คือ ID คนไข้ที่ล็อกอินเข้ามา

    if (!patientId) {
        // ถ้าไม่มี ID คนไข้ (ยังไม่ได้ล็อกอิน) ให้เด้งกลับไปหน้า Log in
        alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
        window.location.href = 'index.html';
        return; // หยุดการทำงานทันที
    }

    // เมื่อมี ID แล้ว ให้โหลดข้อมูลส่วนกลาง (Header)
    loadGlobalData(patientId);


    // --- (ส่วนที่ 2: การโหลดข้อมูลตามหน้า) ---
    // ตรวจสอบว่าเรากำลังอยู่ที่หน้าไหน แล้วสั่งโหลดข้อมูลเฉพาะของหน้านั้น

    const path = window.location.pathname;

    if (path.includes("profile_patient.html")) {
        setupProfilePage(patientId);
    } 
    else if (path.includes("patient_foodandexercise.html")) {
        setupFoodExercisePage(patientId);
    }
    else if (path.includes("patient_bloodpressure.html")) {
        setupBloodPressurePage(patientId);
    }
    else if (path.includes("patient_bloodsugar.html")) {
        setupBloodSugarPage(patientId);
    }
    else if (path.includes("patient_lab.html")) {
        loadLabData(patientId); // (Read-only)
    }
    else if (path.includes("patient_medicine.html")) {
        loadMedicineData(patientId); // (Read-only)
    }
    else if (path.includes("patient_history.html")) {
        loadTreatmentHistory(patientId); // (Read-only)
    }
    else if (path.includes("patient_appointments.html")) {
        loadAppointmentData(patientId); // (Read-only)
    }

});

/**
 * ฟังก์ชัน: โหลดข้อมูลส่วนกลาง (ที่จะใช้ในทุกหน้า)
 * เช่น ชื่อ และ ID ที่ Header
 */
function loadGlobalData(patientId) {
    
    // --- (จำลองการยิง API ไปหา Backend) ---
    /*
    fetch(`https://your-backend-api.com/patient/${patientId}/header`)
        .then(response => response.json())
        .then(data => {
            if (document.getElementById('username')) {
                document.getElementById('username').textContent = data.firstname;
            }
            if (document.getElementById('userId')) {
                document.getElementById('userId').textContent = data.patientId;
            }
        })
        .catch(error => console.error("Error loading global data:", error));
    */

    // --- (สำหรับทดสอบชั่วคราว) ---
    const testData = {
        firstname: "สมหมาย",
        patientId: "P-123456"
    };
    if (document.getElementById('username')) {
        document.getElementById('username').textContent = testData.firstname;
    }
    if (document.getElementById('userId')) {
        document.getElementById('userId').textContent = testData.patientId;
    }
    // --- (จบส่วนทดสอบ) ---
}


// ******************************************************
// *** 1. ฟังก์ชันสำหรับหน้า "โปรไฟล์" (profile_patient.html) ***
// ******************************************************

/**
 * ฟังก์ชัน: ตั้งค่า Event Listener และโหลดข้อมูลหน้าโปรไฟล์
 */
function setupProfilePage(patientId) {
    console.log("กำลังตั้งค่าหน้า โปรไฟล์...");

    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.getElementById('saveProfileBtn');
    const profileForm = document.getElementById('profileForm');

    // โหลดข้อมูลโปรไฟล์ (และตั้งค่าเป็น readonly ตอนเริ่ม)
    loadProfileData(patientId);

    // ควบคุมปุ่ม
    editBtn.addEventListener('click', () => {
        toggleProfileEdit(true); // เปิดโหมดแก้ไข
        editBtn.style.display = 'none';
        saveBtn.style.display = 'block';
    });

    profileForm.addEventListener('submit', (event) => {
        event.preventDefault(); // ป้องกันหน้ารีเฟรช
        saveProfileData(patientId); // บันทึกข้อมูล
        toggleProfileEdit(false); // ปิดโหมดแก้ไข
        editBtn.style.display = 'block';
        saveBtn.style.display = 'none';
    });
}

/**
 * ฟังก์ชัน: โหลดข้อมูลโปรไฟล์ (จำลอง)
 */
function loadProfileData(patientId) {
    console.log("กำลังโหลดข้อมูลโปรไฟล์...");

    // (สมมติว่าดึงข้อมูลจาก Backend...)
    const testData = {
        firstname: "สมหมาย",
        lastname: "รักสุขภาพ",
        birthdate: "10/05/1980",
        idcard: "1234567890123",
        bloodtype: "O",
        gender: "ชาย",
        weight: "75", 
        height: "170",
        phone: "081-234-5678",
        emergencyPhone: "089-876-5432",
        address: "123 ถ.สุขุมวิท แขวงพระโขนง เขตคลองเตย กทม. 10110"
    };

    populateProfileForm(testData);
    
    // ตั้งค่าเป็น "อ่านอย่างเดียว" ตอนเริ่มต้น
    toggleProfileEdit(false);
}

/**
 * ฟังก์ชัน: ช่วยเติมข้อมูลลงในฟอร์มโปรไฟล์
 */
function populateProfileForm(data) {
    document.getElementById('firstname').value = data.firstname;
    document.getElementById('lastname').value = data.lastname;
    document.getElementById('birthdate').value = data.birthdate;
    document.getElementById('idcard').value = data.idcard;
    document.getElementById('bloodtype').value = data.bloodtype;
    document.getElementById('gender').value = data.gender;
    document.getElementById('weight').value = data.weight;
    document.getElementById('height').value = data.height;
    document.getElementById('phone').value = data.phone;
    document.getElementById('emergencyPhone').value = data.emergencyPhone;
    document.getElementById('address').value = data.address;
}

/**
 * ฟังก์ชัน: สลับโหมด อ่านอย่างเดียว / แก้ไข
 */
function toggleProfileEdit(isEditable) {
    document.getElementById('weight').readOnly = !isEditable;
    document.getElementById('height').readOnly = !isEditable;
    document.getElementById('phone').readOnly = !isEditable;
    document.getElementById('emergencyPhone').readOnly = !isEditable;
    document.getElementById('address').readOnly = !isEditable;
}

/**
 * ฟังก์ชัน: รวบรวมข้อมูลและ "บันทึก" (โปรไฟล์)
 */
function saveProfileData(patientId) {
    const dataToSave = {
        patientId: patientId,
        weight: document.getElementById('weight').value,
        height: document.getElementById('height').value,
        phone: document.getElementById('phone').value,
        emergencyPhone: document.getElementById('emergencyPhone').value,
        address: document.getElementById('address').value,
    };

    console.log("ข้อมูลโปรไฟล์ที่จะส่งไป Backend:", dataToSave);

    // (จำลองการส่งข้อมูล)
    alert("ทดสอบบันทึกข้อมูลสำเร็จ!");
    
    /* (โค้ดจริงสำหรับส่งข้อมูล)
    fetch(`https://your-backend-api.com/patient/${patientId}/profile`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("บันทึกข้อมูลเรียบร้อย!");
        } else {
            alert("เกิดข้อผิดพลาด: " + data.message);
        }
    })
    .catch(error => console.error("Error saving data:", error));
    */
}


// ******************************************************
// *** 2. ฟังก์ชันสำหรับหน้า "อาหาร/ออกกำลังกาย" ***
// ******************************************************

function setupFoodExercisePage(patientId) {
    console.log("กำลังตั้งค่าหน้า อาหาร/ออกกำลังกาย...");
    document.getElementById('addFoodRowBtn').addEventListener('click', addFoodRow);
    document.getElementById('addExerciseRowBtn').addEventListener('click', addExerciseRow);
    document.getElementById('saveDataBtn').addEventListener('click', () => {
        saveFoodAndExerciseData(patientId);
    });
    loadFoodAndExerciseData(patientId);
}

function loadFoodAndExerciseData(patientId) {
    // (จำลองการโหลดข้อมูล)
    addFoodRow(); // เพิ่มแถวว่าง
    addExerciseRow(); // เพิ่มแถวว่าง
}

function addFoodRow(date = '', name = '', time = '') {
    const tableBody = document.getElementById('foodTableBody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="date" class="table-input" value="${date}"></td>
        <td><input type="text" class="table-input" placeholder="ชื่ออาหาร" value="${name}"></td>
        <td><input type="time" class="table-input" value="${time}"></td>
    `;
    tableBody.appendChild(newRow);
}

function addExerciseRow(date = '', name = '', time = '') {
    const tableBody = document.getElementById('exerciseTableBody');
    const newRow = document.createElement('tr');
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
    document.querySelectorAll("#foodTableBody tr").forEach(row => {
        const inputs = row.querySelectorAll("input");
        const rowData = { date: inputs[0].value, name: inputs[1].value, time: inputs[2].value };
        if (rowData.date || rowData.name || rowData.time) foodData.push(rowData);
    });

    const exerciseData = [];
    document.querySelectorAll("#exerciseTableBody tr").forEach(row => {
        const inputs = row.querySelectorAll("input");
        const rowData = { date: inputs[0].value, name: inputs[1].value, time: inputs[2].value };
        if (rowData.date || rowData.name || rowData.time) exerciseData.push(rowData);
    });

    const dataToSave = { patientId: patientId, food: foodData, exercise: exerciseData };
    console.log("ข้อมูลที่จะส่ง:", dataToSave);
    
    // (จำลองการส่งข้อมูล)
    alert("ทดสอบบันทึกข้อมูลสำเร็จ!");
}


// ******************************************************
// *** 3. ฟังก์ชันสำหรับหน้า "ความดันโลหิต" ***
// ******************************************************

function setupBloodPressurePage(patientId) {
    console.log("กำลังตั้งค่าหน้า ความดันโลหิต...");
    document.getElementById('addBpRowBtn').addEventListener('click', addBpRow);
    document.getElementById('saveDataBtn').addEventListener('click', () => {
        saveBpData(patientId);
    });
    loadBpData(patientId);
}

function loadBpData(patientId) {
    // (จำลองการโหลดข้อมูล)
    const testData = {
        latest: { sys: "125", dia: "82", pul: "70" },
        history: [
            { date: "2025-11-04", sys: "125", dia: "82", pul: "70", time: "09:30" },
            { date: "2025-11-03", sys: "122", dia: "80", pul: "72", time: "09:00" },
        ]
    };
    updateBpDisplay(testData.latest.sys, testData.latest.dia, testData.latest.pul);
    testData.history.forEach(item => addBpRow(item.date, item.sys, item.dia, item.pul, item.time));
    addBpRow(); // เพิ่มแถวว่าง
}

function updateBpDisplay(sys, dia, pul) {
    document.getElementById('currentSys').textContent = sys || '--';
    document.getElementById('currentDia').textContent = dia || '--';
    document.getElementById('currentPul').textContent = pul || '--';
}

function addBpRow(date = '', sys = '', dia = '', pul = '', time = '') {
    const tableBody = document.getElementById('bpTableBody');
    const newRow = document.createElement('tr');
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
    document.querySelectorAll("#bpTableBody tr").forEach(row => {
        const inputs = row.querySelectorAll("input");
        const rowData = { date: inputs[0].value, sys: inputs[1].value, dia: inputs[2].value, pul: inputs[3].value, time: inputs[4].value };
        if (rowData.date || rowData.sys || rowData.dia || rowData.pul || rowData.time) bpData.push(rowData);
    });

    const dataToSave = { patientId: patientId, history: bpData };
    console.log("ข้อมูลที่จะส่ง:", dataToSave);

    // (จำลองการส่งข้อมูล)
    alert("ทดสอบบันทึกข้อมูลสำเร็จ!");
    const lastRow = bpData[bpData.length - 1];
    if(lastRow) updateBpDisplay(lastRow.sys, lastRow.dia, lastRow.pul);
}


// ******************************************************
// *** 4. ฟังก์ชันสำหรับหน้า "ค่าน้ำตาลในเลือด" ***
// ******************************************************

function setupBloodSugarPage(patientId) {
    console.log("กำลังตั้งค่าหน้า ค่าน้ำตาล...");
    document.getElementById('addBsRowBtn').addEventListener('click', addBsRow);
    document.getElementById('saveDataBtn').addEventListener('click', () => {
        saveBsData(patientId);
    });
    loadBsData(patientId);
}

function loadBsData(patientId) {
    // (จำลองการโหลดข้อมูล)
    const testData = {
        latest: { sugar: "95" },
        history: [
            { date: "2025-11-04", sugar: "95", time: "08:30" },
            { date: "2025-11-03", sugar: "102", time: "08:00" },
        ]
    };
    updateBsDisplay(testData.latest.sugar);
    testData.history.forEach(item => addBsRow(item.date, item.sugar, item.time));
    addBsRow(); // เพิ่มแถวว่าง
}

function updateBsDisplay(sugar) {
    document.getElementById('currentSugar').textContent = sugar || '--';
}

function addBsRow(date = '', sugar = '', time = '') {
    const tableBody = document.getElementById('bsTableBody');
    const newRow = document.createElement('tr');
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
    document.querySelectorAll("#bsTableBody tr").forEach(row => {
        const inputs = row.querySelectorAll("input");
        const rowData = { date: inputs[0].value, sugar: inputs[1].value, time: inputs[2].value };
        if (rowData.date || rowData.sugar || rowData.time) bsData.push(rowData);
    });

    const dataToSave = { patientId: patientId, history: bsData };
    console.log("ข้อมูลที่จะส่ง:", dataToSave);

    // (จำลองการส่งข้อมูล)
    alert("ทดสอบบันทึกข้อมูลสำเร็จ!");
    const lastRow = bsData[bsData.length - 1];
    if(lastRow) updateBsDisplay(lastRow.sugar);
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
            wbc: "6.8", rbc: "4.7", hb: "14.5", fbs: "92",
            hba1c: "5.5", ldl: "110", hdl: "50", cholesterol: "180"
        }
    };
    populateLabForm(testData.results);
    document.getElementById('lastUpdate').textContent = `อัพเดทล่าสุด: ${testData.lastUpdate}`;
}

function populateLabForm(data) {
    document.getElementById('wbc').value = data.wbc || 'N/A';
    document.getElementById('rbc').value = data.rbc || 'N/A';
    document.getElementById('hb').value = data.hb || 'N/A';
    document.getElementById('fbs').value = data.fbs || 'N/A';
    document.getElementById('hba1c').value = data.hba1c || 'N/A';
    document.getElementById('ldl').value = data.ldl || 'N/A';
    document.getElementById('hdl').value = data.hdl || 'N/A';
    document.getElementById('cholesterol').value = data.cholesterol || 'N/A';
}


// ******************************************************
// *** 6. ฟังก์ชันสำหรับหน้า "การจ่ายยา" (Read-only) ***
// ******************************************************

function loadMedicineData(patientId) {
    console.log("กำลังโหลดข้อมูลการจ่ายยา...");
    
    // (จำลองการโหลดข้อมูล)
    const testData = {
        history: [
            { date: "2025-11-05", type: "ยาเม็ด", name: "Paracetamol 500mg", quantity: "10 เม็ด" },
            { date: "2025-11-05", type: "ยาน้ำ", name: "ยาแก้ไอ", quantity: "1 ขวด" },
            { date: "2025-10-12", type: "ยาเม็ด", name: "Amlodipine 5mg", quantity: "30 เม็ด" },
        ]
    };
    populateMedicineTable(testData.history);
}

function populateMedicineTable(historyData) {
    const tableBody = document.getElementById('medicationTableBody');
    tableBody.innerHTML = ''; // เคลียร์ข้อมูลเก่าทิ้ง

    if (historyData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">ยังไม่มีประวัติการจ่ายยา</td></tr>';
        return;
    }

    historyData.forEach(med => {
        const newRow = document.createElement('tr');
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
    
    // (จำลองการโหลดข้อมูล)
    const testData = {
        history: [
            { date: "5 พ.ย. 2568", diagnosis: "ไข้หวัดใหญ่ (Influenza)", doctor: "นพ. สมชาย ใจดี" },
            { date: "12 ต.ค. 2568", diagnosis: "ความดันโลหิตสูง (Hypertension) - ติดตามอาการ", doctor: "นพ. สมชาย ใจดี" },
            { date: "2 ก.ย. 2568", diagnosis: "อาหารเป็นพิษ (Food Poisoning)", doctor: "พญ. สุภาวดี มีสุข" },
        ]
    };
    populateHistoryTable(testData.history);
}

function populateHistoryTable(historyData) {
    const tableBody = document.getElementById('historyTableBody');
    tableBody.innerHTML = ''; // เคลียร์ข้อมูลเก่าทิ้ง

    if (historyData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3">ยังไม่มีประวัติการรักษา</td></tr>';
        return;
    }

    historyData.forEach(item => {
        const newRow = document.createElement('tr');
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
    
    // (จำลองการโหลดข้อมูล)
    const testData = {
        appointments: [
            { date: "15 พ.ย. 2568", time: "10:30 น.", doctor: "นพ. สมชาย ใจดี", status: "upcoming" },
            { date: "5 พ.ย. 2568", time: "09:00 น.", doctor: "นพ. สมชาย ใจดี", status: "completed" },
            { date: "2 ก.ย. 2568", time: "11:00 น.", doctor: "พญ. สุภาวดี มีสุข", status: "cancelled" },
        ]
    };
    populateAppointmentTable(testData.appointments);
}

function populateAppointmentTable(appointmentData) {
    const tableBody = document.getElementById('appointmentTableBody');
    tableBody.innerHTML = ''; // เคลียร์ข้อมูลเก่าทิ้ง

    if (appointmentData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">ยังไม่มีการนัดหมาย</td></tr>';
        return;
    }

    appointmentData.forEach(item => {
        const newRow = document.createElement('tr');
        
        // แปลง status (string) เป็น HTML (badge)
        let statusBadge = '';
        if (item.status === 'upcoming') {
            statusBadge = '<span class="status-badge upcoming">นัดหมายล่วงหน้า</span>';
        } else if (item.status === 'completed') {
            statusBadge = '<span class="status-badge completed">เสร็จสิ้น</span>';
        } else if (item.status === 'cancelled') {
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