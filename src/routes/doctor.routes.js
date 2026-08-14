import { Router } from "express";
import { registerDoctor,loginDoctor } from "../controllers/doctor.controller.js";

const router = Router()

router.post("/register",registerDoctor)
router.post("/login",loginDoctor)

export default router