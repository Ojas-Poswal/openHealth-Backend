import { Router } from "express";
import { createMedicalCase,getMyMedicalCases } from "../controllers/medicalCase.controller.js";
import verifyPatient from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create",verifyPatient,createMedicalCase)
router.get("/my-cases",verifyPatient,getMyMedicalCases)


export default router