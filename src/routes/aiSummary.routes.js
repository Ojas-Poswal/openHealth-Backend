import {Router} from express
import verifyPatient from "../middlewares/auth.middleware.js"

import {generateAISummary,getAISummary} from "../controllers/aiSummary.controller.js"

const router = Router()

router.post("/generate/:patientId",verifyPatient,generateAISummary)

router.get("/:patientId",verifyPatient,getAISummary)

export default router