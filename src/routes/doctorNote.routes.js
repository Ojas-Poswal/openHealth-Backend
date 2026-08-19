import { Router } from "express";
import { createDoctorNote } from "../controllers/doctorNote.controller.js";
import verifyDoctor from "../middlewares/doctorAuth.middleware.js"

const router = Router()

router.post("/create",verifyDoctor,createDoctorNote)

export default router