import { Router } from "express";
import { createReport,getReportsByMedicalCase } from "../controllers/report.controller.js";
import verifyPatient from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/create",verifyPatient,createReport);
router.get("/case/:medicalCaseId",verifyPatient,getReportsByMedicalCase)

export default router

