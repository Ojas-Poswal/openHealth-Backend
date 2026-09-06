import dotenv from "dotenv"
dotenv.config();
import app from "./app.js"
import connectDB from "./db/index.js"




connectDB()

const PORT = 8000

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})
