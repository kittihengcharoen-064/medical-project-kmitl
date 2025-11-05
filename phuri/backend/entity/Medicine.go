package entity
import (

   "gorm.io/gorm"
)
type Medicine struct {
   gorm.Model
   Number           uint      `json:"number"`
   Medicine_name    string    `json:"medicine_name"`
   Amont            uint      `json:"amont"`
  PatientID uint    `json:"patientID"` // FK → ชี้ไปที่ Patient.ID
  Patient   *Patient `gorm:"foreignKey:PatientID;references:ID"`
}