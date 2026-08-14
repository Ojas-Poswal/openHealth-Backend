import { Router } from "express";
import { registerDoctor,loginDoctor ,getDoctorProfile} from "../controllers/doctor.controller.js";
import verifyDoctor from "../middlewares/doctorAuth.middleware.js";

const router = Router()

router.post("/register",registerDoctor)
router.post("/login",loginDoctor)
router.get("/profile",verifyDoctor,getDoctorProfile)

export default router