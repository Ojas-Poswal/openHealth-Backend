import { Router } from "express";
import { sendDoctorRegistrationOtp,verifyDoctorRegistrationOtp,registerDoctor,loginDoctor ,getDoctorProfile,changePassword, updateProfile,searchPatientByOHID,getPatientTimeline,requestConsent,verifyConsent,endSession,getActiveSessions,forgotPassword,verifyOtp,resetPassword,getAccessedPatients,getDoctorAuditLogs} from "../controllers/doctor.controller.js";
import verifyDoctor from "../middlewares/doctorAuth.middleware.js";

const router = Router()

router.post("/register/send-otp",sendDoctorRegistrationOtp)
router.post("/register/verify-otp",verifyDoctorRegistrationOtp)
router.post("/register",registerDoctor)
router.post("/login",loginDoctor)
router.post("/forgot-password",forgotPassword)
router.post("/verify-otp",verifyOtp)
router.post("/reset-password",resetPassword)
router.get("/profile",verifyDoctor,getDoctorProfile)
router.patch("/change-password",verifyDoctor,changePassword)
router.patch("/profile",verifyDoctor,updateProfile)
router.post("/request-consent",verifyDoctor,requestConsent)
router.get("/search/:ohid", verifyDoctor, searchPatientByOHID)
router.get("/patient/:patientId/timeline", verifyDoctor,getPatientTimeline)
router.post("/verify-consent",verifyDoctor,verifyConsent)
router.post("/end-session",verifyDoctor,endSession)
router.get("/active-sessions",verifyDoctor,getActiveSessions)
router.get("/accessed-patients",verifyDoctor,getAccessedPatients)
router.get("/audit-logs",verifyDoctor,getDoctorAuditLogs)

export default router