import { Router } from "express";
import { registerDoctor } from "../controllers/doctor.controller.js";

const router = Router()

router.post("/register",registerDoctor)

export default router