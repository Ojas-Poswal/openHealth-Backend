import express from "express"
import healthRouter from "./routes/health.routes.js"

const app = express()

app.get("/",healthRouter)

export default app;