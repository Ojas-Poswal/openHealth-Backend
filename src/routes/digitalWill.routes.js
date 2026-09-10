import {Router} from "express"
import verifyPatient from "../middlewares/auth.middleware.js"
import {createDigitalWill,getMyDigitalWill,updateSection,deleteDigitalWill} from "../controllers/digitalWill.controller.js"

const router = Router();

router.post("/create",verifyPatient,createDigitalWill);
router.get("/me",verifyPatient,getMyDigitalWill);
router.patch("/update-section",verifyPatient,updateSection);
router.delete("/delete",verifyPatient,deleteDigitalWill);

export default router;