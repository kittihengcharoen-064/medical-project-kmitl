// รอให้หน้าเว็บโหลดเสร็จก่อน
document.addEventListener("DOMContentLoaded", () => {
  // 1. ค้นหาฟอร์มและปุ่มใน HTML
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  // 2. ตั้งค่าให้รอ "Event" เมื่อมีการกดปุ่ม "Submit"
  loginForm.addEventListener("submit", (event) => {
    // ป้องกันไม่ให้หน้าเว็บ "รีเฟรช" เอง (ซึ่งเป็นพฤติกรรมปกติของฟอร์ม)
    event.preventDefault();

    // 3. ดึงค่าจากช่องกรอก
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // 4. ตรวจสอบข้อมูลเบื้องต้น
    if (username === "" || password === "") {
      showError("กรุณากรอก Username และ Password");
      return;
    }

    // 5. ติดต่อ Backend (ฐานข้อมูล) ของคุณ
    // นี่คือส่วนที่คุณต้อง "แก้ไข" ให้ตรงกับ API ของคุณ
    // ผมจะใช้ fetch() เป็นตัวอย่างนะครับ

    fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        const data = result.data;
        if (!data.error) {
          // สมมติว่า Backend ส่ง 'success: true' กลับมา

          // (ทางเลือก) เก็บ Token หรือ User ID ไว้ใน Local Storage
          // localStorage.setItem('token', data.token);
          console.log(data);
          localStorage.setItem("userId", data.accountId);

          // ส่งต่อไปยังหน้าที่เหมาะสม
          if (data.role === "patient") {
            window.location.href = "profile_patient.html"; // ไปหน้าโปรไฟล์คนไข้
            localStorage.removeItem("staffId");
            localStorage.setItem("patientId", data.pid);
          } else if (data.role === "staff") {
            localStorage.removeItem("patientId");
            localStorage.setItem("staffId", data.sid);
            window.location.href = "profile_staff.html"; // ไปหน้าโปรไฟล์บุคลากร
          }
        } else {
          // ถ้า Backend บอกว่า Login ไม่ผ่าน
          showError(data.message || "Username หรือ Password ไม่ถูกต้อง");
        }
      })
      .catch((error) => {
        // ถ้าเชื่อมต่อ Backend ไม่ได้เลย
        console.error("Login Error:", error);
        showError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      });

    // --- (สำหรับทดสอบชั่วคราว) ---
    // (ลบส่วนนี้ออก เมื่อคุณเชื่อมต่อ Backend จริง)
    // console.log("กำลังทดสอบ Login ด้วย:", username, password);
    // if (username === "patient" && password === "1234") {
    //     alert("ทดสอบ Login (คนไข้) สำเร็จ!");
    //     window.location.href = 'profile_patient.html';
    // } else if (username === "staff" && password === "1234") {
    //     alert("ทดสอบ Login (บุคลากร) สำเร็จ!");
    //     window.location.href = 'profile_staff.html';
    // } else {
    //     showError("Username หรือ Password ไม่ถูกต้อง (ทดสอบ)");
    // }
    // --- (จบส่วนทดสอบ) ---
  });

  // ฟังก์ชันสำหรับแสดงข้อความ Error
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
  }
});
