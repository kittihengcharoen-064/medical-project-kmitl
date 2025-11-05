package entity
import (

   "gorm.io/gorm"
)
type Doctorandnurse struct {
   gorm.Model
   
   AccountID uint    `json:"accountID"` // FK → ชี้ไปที่ Account.ID
 Account   *Account `gorm:"foreignKey:AccountID;references:ID"`

   PatientID uint    `json:"patientID"` // FK → ชี้ไปที่ Patient.ID
   Patient   *Patient `gorm:"foreignKey:PatientID;references:ID"` 


}