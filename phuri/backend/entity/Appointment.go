package entity
import (
 "time"

 "gorm.io/gorm"
)
type Appointment struct {
   gorm.Model
   Applointment_day          time.Time    `json:"applointment_day"`
   Applointment_time         time.Time   `json:"applointment_time"`
   Reason_for_applointment   string    `json:"reason_for_applointment"`

   PatientID uint    `json:"patientID"` // FK → ชี้ไปที่ Patient.ID
   Patient   *Patient `gorm:"foreignKey:PatientID;references:ID"`

}