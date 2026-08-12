import express from "express"
import healthRouter from "./routes/health.routes.js"
import patientRouter from "./routes/patient.routes.js"

const app = express()

app.use(express.json());

app.use("/",healthRouter)
app.use("/api/v1/patients",patientRouter)

export default app;