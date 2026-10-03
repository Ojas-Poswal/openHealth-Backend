import {Router} from "express"
import verifyPatient from "../middlewares/auth.middleware.js"
import {createDigitalWill,getMyDigitalWill,updateSection,deleteDigitalWill,getFamilyMemberDigitalWill,approveDeathCertificate} from "../controllers/digitalWill.controller.js"

const router = Router();

router.post("/create",verifyPatient,createDigitalWill);
router.get("/me",verifyPatient,getMyDigitalWill);
router.patch("/update-section",verifyPatient,updateSection);
router.delete("/delete",verifyPatient,deleteDigitalWill);
router.get("/family/:patientId",verifyPatient,getFamilyMemberDigitalWill);
router.post("/approve-death-certificate",verifyPatient,approveDeathCertificate)

export default router;