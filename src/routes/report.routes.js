import { Router } from "express";
import { createReport,getReportsByMedicalCase,getReportById,deleteReport, updateReport } from "../controllers/report.controller.js";
import verifyPatient from "../middlewares/auth.middleware.js"
import upload from "../middlewares/upload.middleware.js";

const router = Router()

router.post("/create",verifyPatient,upload.single("file"),createReport);
router.get("/case/:medicalCaseId",verifyPatient,getReportsByMedicalCase)
router.get("/:reportId",verifyPatient,getReportById)
router.delete("/:reportId",verifyPatient,deleteReport)
router.patch("/:reportId",verifyPatient,updateReport)

export default router

