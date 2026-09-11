import {Router} from "express"

import verifyPatient from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

import { uploadDeathCertificate,getDeathCertificate } from "../controllers/deathCertificate.controller.js";

const router = Router()

router.post("/upload",verifyPatient,upload.single("file"),uploadDeathCertificate)
router.get("/:patientId",verifyPatient,getDeathCertificate)

export default router