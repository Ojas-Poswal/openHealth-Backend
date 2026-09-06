import { Router } from "express";
import { registerDoctor,loginDoctor ,getDoctorProfile,changePassword, updateProfile,searchPatientByOHID,getPatientTimeline,requestConsent} from "../controllers/doctor.controller.js";
import verifyDoctor from "../middlewares/doctorAuth.middleware.js";

const router = Router()

router.post("/register",registerDoctor)
router.post("/login",loginDoctor)
router.get("/profile",verifyDoctor,getDoctorProfile)
router.patch("/change-password",verifyDoctor,changePassword)
router.patch("/profile",verifyDoctor,updateProfile)
router.post("/request-consent",verifyDoctor,requestConsent)
router.get("/search/:ohid", verifyDoctor, searchPatientByOHID)
router.get("/patient/:patientId/timeline", verifyDoctor,getPatientTimeline)

export default router