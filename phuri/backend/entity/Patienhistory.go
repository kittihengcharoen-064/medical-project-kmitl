package entity
import (

   "time"
   "gorm.io/gorm"
)
type Patienthistory struct {
   gorm.Model
   FirstName      string     `json:"firstname"`
   LastName       string     `json:"lastname"`
   Password       uint       `json:"password"`
   ID_card_no        uint       `json:"id_card_no"`
   Phone          uint       `json:"Phone"`
   Emergency_phone      uint       `json:"emergency_phone"`
   Birtdate          time.Time   `json:"birtdate"`
   Gender          string      `json:"gender"`
   Bloodgroup         string      `json:"bloodgroup"`
   Address          string      `json:"address"`

   PatientID uint    `json:"patientID"` // FK → ชี้ไปที่ Patient.ID
   Patient   *Patient `gorm:"foreignKey:PatientID;references:ID"`
}