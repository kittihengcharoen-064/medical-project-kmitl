package config
import(
 "fmt"
 "example.com/PHURI/entity"
   "gorm.io/driver/sqlite"
   "gorm.io/gorm"
)
var db *gorm.DB
func DB() *gorm.DB {
   return db
}
func ConnectionDB() {
   database, err := gorm.Open(sqlite.Open("sa.db?cache=shared"), &gorm.Config{})
   if err != nil {
    panic("failed to connect database")
   }
   fmt.Println("connected database")
   db = database
}
func SetupDatabase() {
   db.AutoMigrate(
        &entity.Account{},
  &entity.Appointment{},
  &entity.Blood{},
  &entity.Doctorandnurse{},
  &entity.Foodandexercise{},
  &entity.Patient{},
  &entity.Patienthistory{},
  &entity.Medicalhistory{},
  &entity.Medicine{},
        &entity.Pressure{},
  &entity.Sugar{},
      

      
   )
}