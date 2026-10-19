import { Router } from "express";
import { sendDoctorRegistrationOtp,verifyDoctorRegistrationOtp,registerDoctor,loginDoctor,googleLogin,getDoctorProfile,changePassword, updateProfile,searchPatientByOHID,getPatientTimeline,requestConsent,verifyConsent,endSession,getActiveSessions,forgotPassword,verifyOtp,resetPassword,getAccessedPatients,getDoctorAuditLogs} from "../controllers/doctor.controller.js";
import verifyDoctor, { requireCompleteProfile } from "../middlewares/doctorAuth.middleware.js";

const router = Router()

router.post("/register/send-otp",sendDoctorRegistrationOtp)
router.post("/register/verify-otp",verifyDoctorRegistrationOtp)
router.post("/register",registerDoctor)
router.post("/login",loginDoctor)
router.post("/google",googleLogin)
router.post("/forgot-password",forgotPassword)
router.post("/verify-otp",verifyOtp)
router.post("/reset-password",resetPassword)
router.get("/profile",verifyDoctor,getDoctorProfile)
router.patch("/change-password",verifyDoctor,changePassword)
router.patch("/profile",verifyDoctor,updateProfile)

// Everything below reaches a patient's records, so it sits behind the
// completeness gate as well as the identity check.
router.post("/request-consent",verifyDoctor,requireCompleteProfile,requestConsent)
router.get("/search/:ohid", verifyDoctor,requireCompleteProfile, searchPatientByOHID)
router.get("/patient/:patientId/timeline", verifyDoctor,requireCompleteProfile,getPatientTimeline)
router.post("/verify-consent",verifyDoctor,requireCompleteProfile,verifyConsent)
router.post("/end-session",verifyDoctor,requireCompleteProfile,endSession)
router.get("/active-sessions",verifyDoctor,requireCompleteProfile,getActiveSessions)
router.get("/accessed-patients",verifyDoctor,requireCompleteProfile,getAccessedPatients)
router.get("/audit-logs",verifyDoctor,requireCompleteProfile,getDoctorAuditLogs)

export default router