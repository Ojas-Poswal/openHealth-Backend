import { Router } from "express";
import { registerDoctor,loginDoctor ,getDoctorProfile,changePassword, updateProfile} from "../controllers/doctor.controller.js";
import verifyDoctor from "../middlewares/doctorAuth.middleware.js";

const router = Router()

router.post("/register",registerDoctor)
router.post("/login",loginDoctor)
router.get("/profile",verifyDoctor,getDoctorProfile)
router.patch("/change-password",verifyDoctor,changePassword)
router.patch("/profile",verifyDoctor,updateProfile)

export default router