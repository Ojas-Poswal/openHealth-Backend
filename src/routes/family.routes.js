import { Router } from "express";
import verifyPatient from "../middlewares/auth.middleware.js";
import {createFamilyGroup,getMyGroups} from "../controllers/family.controller.js";

const router = Router();

router.post("/create",verifyPatient,createFamilyGroup);
router.get("/my-groups",verifyPatient,getMyGroups);

export default router;