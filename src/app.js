import express from "express"
import healthRouter from "./routes/health.routes.js"

const app = express()

app.use("/",healthRouter)

export default app;