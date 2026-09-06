import {Router} from "express"
import { registerPatient,loginPatient,getPatientProfile,updatePatientProfile,changePassword,forgotPassword,verifyOtp,resetPassword,getMyAuditLogs,revokeConsent} from "../controllers/patient.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"


const router = Router()

router.post("/register",registerPatient)
router.post("/login",loginPatient)
router.get("/profile",verifyJWT,getPatientProfile)
router.patch("/profile",verifyJWT,updatePatientProfile)
router.patch("/change-password",verifyJWT,changePassword)
router.post("/forgot-password",forgotPassword)
router.post( "/verify-otp",verifyOtp);
router.post("/reset-password",resetPassword);
router.get("/audit-logs",verifyJWT,getMyAuditLogs)
router.post("/revoke-consent",verifyJWT,revokeConsent)

export default router