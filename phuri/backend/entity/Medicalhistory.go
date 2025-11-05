package entity
import (
   "time"

   "gorm.io/gorm"
)
type Medicalhistory struct {
   gorm.Model
   Date             time.Time      `json:"date"`
   Diagnisis_results    string        `json:"diagnisis_results"`

   PatientID uint    `json:"patientID"` // FK → ชี้ไปที่ Patient.ID
   Patient   *Patient `gorm:"foreignKey:PatientID;references:ID"`

   
  
}