package entity

import (
 "time"
 "gorm.io/gorm"
)

type Sugar struct {
 gorm.Model
 Date         time.Time  `json:"date"`
 Sugar_values float32     `json:"sugar_value"`
 
 PatientID    uint       `json:"patientID"` // FK → ชี้ไปที่ Patient.ID
 Patient      *Patient   `gorm:"foreignKey:PatientID;references:ID"`

 
}