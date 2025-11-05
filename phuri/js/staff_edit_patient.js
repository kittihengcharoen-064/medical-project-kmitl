// ====================================================================
// js/staff_edit_patient.js - (ไฟล์ควบคุมหน้าแก้ไขข้อมูลคนไข้แบบรวม)
// ====================================================================

document.addEventListener("DOMContentLoaded", () => {
    
    // --- (ส่วนที่ 1: ดึง ID คนไข้ และ ID บุคลากร) ---
    
    // (สมมติว่า Staff ID ถูกเก็บไว้ตอน Login)
    // const staffId = localStorage.getItem('staffId');
    const staffId = 'S-998877'; // (ทดสอบ)

    // (ดึง ID คนไข้ จาก URL ?id=P-123456)
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('id');

    if (!staffId || !patientId) {
        alert("ข้อมูลไม่ถูกต้อง กรุณากลับไปหน้ารายชื่อ");
        window.location.href = 'staff_patient.html';
        return;
    }

    // --- (ส่วนที่ 2: โหลดข้อมูลทั้งหมด) ---
    loadStaffGlobalData(staffId);
    loadAllPatientData(patientId);

    // --- (ส่วนที่ 3: ผูก Event ปุ่ม) ---
    
    // (ฟอร์มประวัติ)
    document.getElementById('profileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfileData(patientId);
    });

    // (ฟอร์ม Lab)
    document.getElementById('labForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveLabData(patientId);
    });

    // (ฟอร์มอาหาร/ออกกำลังกาย)
    document.getElementById('addFoodRowBtn').addEventListener('click', addFoodRow);
    document.getElementById('addExerciseRowBtn').addEventListener('click', addExerciseRow);
    document.getElementById('dietForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveDietData(patientId);
    });
    
    // (คุณสามารถเพิ่ม Event Listener สำหรับฟอร์มอื่นๆ ที่นี่)

});

// ------------------------------------
// ฟังก์ชันโหลดข้อมูล
// ------------------------------------

function loadStaffGlobalData(staffId) {
    // (เหมือนไฟล์ staff_app.js)
    const testData = { firstname: "สมศักดิ์", staffId: "S-998877" };
    if (document.getElementById('staffUsername')) {
        document.getElementById('staffUsername').textContent = `นพ. ${testData.firstname}`;
    }
    if (document.getElementById('staffUserId')) {
        document.getElementById('staffUserId').textContent = testData.staffId;
    }
}

/**
 * ฟังก์ชัน: โหลดข้อมูล "ทั้งหมด" ของคนไข้ (จำลอง)
 */
function loadAllPatientData(patientId) {
    console.log(`กำลังโหลดข้อมูลทั้งหมดของ ID: ${patientId}`);
    
    // --- (จำลองการยิง API ดึงข้อมูลทั้งหมด) ---
    /*
    fetch(`https://your-backend-api.com/patient/${patientId}/all`)
        .then(response => response.json())
        .then(data => {
            // 1. เติม Header
            document.getElementById('patientName').textContent = `${data.profile.firstname} ${data.profile.lastname}`;
            document.getElementById('patientId').textContent = `ID: ${patientId}`;
            
            // 2. เติมฟอร์มประวัติ
            populateProfileForm(data.profile);
            
            // 3. เติมฟอร์ม Lab
            populateLabForm(data.lab.results);
            
            // 4. เติมตารางอาหาร/ออกกำลังกาย
            data.diet.food.forEach(item => addFoodRow(item.date, item.name, item.time));
            data.diet.exercise.forEach(item => addExerciseRow(item.date, item.name, item.time));
            
            // (เติมข้อมูลส่วนอื่นๆ)
        })
        .catch(error => console.error("Error loading all patient data:", error));
    */

    // --- (สำหรับทดสอบชั่วคราว) ---
    const testData = {
        profile: {
            firstname: "สมหมาย", lastname: "รักสุขภาพ", birthdate: "10/05/1980",
            idcard: "1234567890123", bloodtype: "O", gender: "ชาย",
            weight: "75", height: "170", phone: "081-234-5678",
            emergencyPhone: "089-876-5432", 
            address: "123 ถ.สุขุมวิท กทม."
        },
        lab: {
            results: { wbc: "6.8", rbc: "4.7", hb: "14.5", fbs: "92", hba1c: "5.5", ldl: "110", hdl: "50", cholesterol: "180" }
        },
        diet: {
            food: [ {date: "2025-11-05", name: "ข้าวผัด", time: "12:00"} ],
            exercise: [ {date: "2025-11-04", name: "วิ่ง", time: "18:00"} ]
        }
    };
    
    // 1. เติม Header
    document.getElementById('patientName').textContent = `${testData.profile.firstname} ${testData.profile.lastname}`;
    document.getElementById('patientId').textContent = `ID: ${patientId}`;
    // 2. เติมฟอร์มประวัติ
    populateProfileForm(testData.profile);
    // 3. เติมฟอร์ม Lab
    populateLabForm(testData.lab.results);
    // 4. เติมตารางอาหาร/ออกกำลังกาย
    testData.diet.food.forEach(item => addFoodRow(item.date, item.name, item.time));
    testData.diet.exercise.forEach(item => addExerciseRow(item.date, item.name, item.time));
    addFoodRow(); // เพิ่มแถวว่าง
    addExerciseRow(); // เพิ่มแถวว่าง
    // --- (จบส่วนทดสอบ) ---
}

// ------------------------------------
// ฟังก์ชันเติมข้อมูล (Populate)
// ------------------------------------

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

function populateLabForm(data) {
    document.getElementById('wbc').value = data.wbc || '';
    document.getElementById('rbc').value = data.rbc || '';
    document.getElementById('hb').value = data.hb || '';
    document.getElementById('fbs').value = data.fbs || '';
    document.getElementById('hba1c').value = data.hba1c || '';
    document.getElementById('ldl').value = data.ldl || '';
    document.getElementById('hdl').value = data.hdl || '';
    document.getElementById('cholesterol').value = data.cholesterol || '';
}

// (ฟังก์ชันเพิ่มแถวของ อาหาร/ออกกำลังกาย)
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

// ------------------------------------
// ฟังก์ชันบันทึกข้อมูล (Save)
// ------------------------------------

function saveProfileData(patientId) {
    // (รวบรวมข้อมูลจากฟอร์ม 'profileForm')
    const dataToSave = {
        patientId: patientId,
        firstname: document.getElementById('firstname').value,
        lastname: document.getElementById('lastname').value,
        birthdate: document.getElementById('birthdate').value,
        idcard: document.getElementById('idcard').value,
        bloodtype: document.getElementById('bloodtype').value,
        gender: document.getElementById('gender').value,
        weight: document.getElementById('weight').value,
        height: document.getElementById('height').value,
        phone: document.getElementById('phone').value,
        emergencyPhone: document.getElementById('emergencyPhone').value,
        address: document.getElementById('address').value
    };
    console.log("Staff กำลังบันทึก (ประวัติ):", dataToSave);
    alert("ทดสอบบันทึกข้อมูลประวัติสำเร็จ!");
    
    // (ยิง API... fetch(...))
}

function saveLabData(patientId) {
    // (รวบรวมข้อมูลจากฟอร์ม 'labForm')
    const dataToSave = {
        patientId: patientId,
        wbc: document.getElementById('wbc').value,
        rbc: document.getElementById('rbc').value,
        hb: document.getElementById('hb').value,
        fbs: document.getElementById('fbs').value,
        hba1c: document.getElementById('hba1c').value,
        ldl: document.getElementById('ldl').value,
        hdl: document.getElementById('hdl').value,
        cholesterol: document.getElementById('cholesterol').value,
    };
    console.log("Staff กำลังบันทึก (ผล Lab):", dataToSave);
    alert("ทดสอบบันทึกผล Lab สำเร็จ!");
    
    // (ยิง API... fetch(...))
}

function saveDietData(patientId) {
    // (รวบรวมข้อมูลจากฟอร์ม 'dietForm')
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
    
    const dataToSave = { 
        patientId: patientId, 
        food: foodData, 
        exercise: exerciseData 
    };
    console.log("Staff กำลังบันทึก (อาหาร/ออกกำลังกาย):", dataToSave);
    alert("ทดสอบบันทึกข้อมูลอาหาร/ออกกำลังกายสำเร็จ!");
    
    // (ยิง API... fetch(...))
}