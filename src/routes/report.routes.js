import { Router } from "express";
import { createReport } from "../controllers/report.controller.js";
import verifyPatient from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/create",verifyPatient,createReport);

export default router

