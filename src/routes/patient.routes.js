import {Router} from "express"
import { registerPatient,loginPatient } from "../controllers/patient.controller.js"


const router = Router()

router.post("/register",registerPatient)
router.post("/login",loginPatient)

export default router