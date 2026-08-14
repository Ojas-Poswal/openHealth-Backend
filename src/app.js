import express from "express"
import healthRouter from "./routes/health.routes.js"
import patientRouter from "./routes/patient.routes.js"
import doctorRouter from "./routes/doctor.routes.js"

const app = express()

app.use(express.json());

app.use("/",healthRouter)
app.use("/api/v1/patients",patientRouter)
app.use("/api/v1/doctors",doctorRouter)

export default app;