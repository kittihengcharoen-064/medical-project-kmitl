// รอให้หน้าเว็บโหลดเสร็จก่อน
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. ค้นหาฟอร์ม
    const registerForm = document.getElementById("registerForm");
    const errorMessage = document.getElementById("errorMessage");

    // 2. ตั้งค่าให้รอ "Event" เมื่อมีการกดปุ่ม "Submit"
    registerForm.addEventListener("submit", (event) => {
        event.preventDefault(); // ป้องกันหน้า "รีเฟรช"

        // 3. ดึงค่าจากช่องกรอกทั้งหมด
        const firstname = document.getElementById("firstname").value;
        const lastname = document.getElementById("lastname").value;
        const username = document.getElementById("username").value;
        const phone = document.getElementById("phone").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // 4. ตรวจสอบข้อมูลเบื้องต้น (เช่น รหัสผ่านตรงกัน)
        if (password !== confirmPassword) {
            showError("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
            return;
        }

        if (password.length < 6) {
            showError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
            return;
        }

        // 5. สร้าง Object ข้อมูลที่จะส่งไปหา Backend
        const userData = {
            firstname: firstname,
            lastname: lastname,
            username: username,
            phone: phone,
            password: password,
            role: 'patient' // สมมติว่าหน้านี้สำหรับคนไข้เท่านั้น
        };

        // 6. ติดต่อ Backend (ฐานข้อมูล) ของคุณ
        // นี่คือส่วนที่คุณต้อง "แก้ไข" ให้ตรงกับ API ของคุณ
        
        /*
        fetch('https://your-backend-api.com/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) { // สมมติว่า Backend ส่ง 'success: true' กลับมา
                alert("ลงทะเบียนสำเร็จ! กรุณา Log in เพื่อเข้าสู่ระบบ");
                window.location.href = 'index.html'; // กลับไปหน้า Log in
            } else {
                // ถ้า Backend บอกว่าลงทะเบียนไม่ผ่าน (เช่น username ซ้ำ)
                showError(data.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
            }
        })
        .catch(error => {
            // ถ้าเชื่อมต่อ Backend ไม่ได้เลย
            console.error("Register Error:", error);
            showError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        });
        */
        
        // --- (สำหรับทดสอบชั่วคราว) ---
        // (ลบส่วนนี้ออก เมื่อคุณเชื่อมต่อ Backend จริง)
        console.log("กำลังทดสอบ Register ด้วย:", userData);
        alert("ทดสอบลงทะเบียนสำเร็จ! กรุณา Log in เพื่อเข้าสู่ระบบ");
        window.location.href = 'index.html';
        // --- (จบส่วนทดสอบ) ---
    });

    // ฟังก์ชันสำหรับแสดงข้อความ Error
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }
});