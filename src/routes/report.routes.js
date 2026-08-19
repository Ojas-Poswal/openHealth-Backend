import { Router } from "express";
import { createReport,getReportsByMedicalCase,getReportById } from "../controllers/report.controller.js";
import verifyPatient from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/create",verifyPatient,createReport);
router.get("/case/:medicalCaseId",verifyPatient,getReportsByMedicalCase)
router.get("/:reportId",verifyPatient,getReportById)

export default router

