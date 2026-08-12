import app from "./app.js"
import dotenv from "dotenv"
import connectDB from "./db/index.js"


dotenv.config();

connectDB()

const PORT = 8000

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})
