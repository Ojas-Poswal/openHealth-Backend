import {Router} from "express"
import { registerPatient } from "../controllers/patient.controller.js"


const router = Router()

router.post("/register",registerPatient)

export default router