package entity
import (
   "time"

   "gorm.io/gorm"
)
type Blood struct {
   gorm.Model
   Date           time.Time    `json:"date"`
   WBC            float32      `json:"wbc"`
   RBC            float32       `json:"rbc"`
   Hb             float32       `json:"hb"`
   FBS            float32       `json:"fbs"`
   HbA1c          float32      `json:"Hba1c"`
   Total_Cholesterol float32       `json:"total_cholesterol"`
   LDL            float32       `json:"ldl"`
   HDL            float32     `json:"hdl"`
   
   PatientID uint    `json:"patientID"` // FK → ชี้ไปที่ Patient.ID
   Patient   *Patient `gorm:"foreignKey:PatientID;references:ID"`

  
}