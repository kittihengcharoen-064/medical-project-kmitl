package entity
import (

   "gorm.io/gorm"
)
type Patient struct {
   gorm.Model
   

   AccountID uint    `json:"accountID"` // FK → ชี้ไปที่ Account.ID
 Account   *Account `gorm:"foreignKey:AccountID;references:ID"`

   Doctorandnurse *Doctorandnurse `gorm:"foreignKey:PatientID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

   Patienthistory *Patienthistory `gorm:"foreignKey:PatientID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
   
   Foodandexercise  []Foodandexercise `gorm:"foreignKey:PatientID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
   
   Pressure  []Pressure `gorm:"foreignKey:PatientID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

   Sugar  []Sugar `gorm:"foreignKey:PatientID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

   Blood  []Blood `gorm:"foreignKey:PatientID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

   Appointment  []Appointment `gorm:"foreignKey:PatientID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

   Medicalhistory  []Medicalhistory `gorm:"foreignKey:PatientID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

   Medicine  []Medicine `gorm:"foreignKey:PatientID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}