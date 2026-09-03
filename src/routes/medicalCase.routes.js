import { Router } from "express";
import { createMedicalCase,getMyMedicalCases,getMedicalCaseByID,updateCaseStatus,getMyTimeline,getActiveCases} from "../controllers/medicalCase.controller.js";
import verifyPatient from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create",verifyPatient,createMedicalCase)
router.get("/my-cases",verifyPatient,getMyMedicalCases)
router.get("/timeline", verifyPatient, getMyTimeline)
router.get("/active-cases",verifyPatient,getActiveCases)
router.get("/:caseId",verifyPatient,getMedicalCaseByID)
router.patch("/:caseId/status",verifyPatient,updateCaseStatus)



export default router