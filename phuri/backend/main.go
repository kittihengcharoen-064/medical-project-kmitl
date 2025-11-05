package main
import (
   "github.com/gin-gonic/gin"
   "example.com/PHURI/config"
   
   "github.com/gin-contrib/cors"
)
const PORT = "8000"
func main() {

 r := gin.Default()
 r.Use(cors.Default())

 config.ConnectionDB()
 config.SetupDatabase()

 
 

 r.Run(":8080")

}