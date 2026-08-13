import {Router} from "express"
import { registerPatient,loginPatient,getPatientProfile,updatePatientProfile,changePassword} from "../controllers/patient.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"


const router = Router()

router.post("/register",registerPatient)
router.post("/login",loginPatient)
router.get("/profile",verifyJWT,getPatientProfile)
router.patch("/profile",verifyJWT,updatePatientProfile)
router.patch("/change-password",verifyJWT,changePassword)

export default router