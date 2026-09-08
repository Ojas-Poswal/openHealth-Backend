import { Router } from "express";
import verifyPatient from "../middlewares/auth.middleware.js";
import {createFamilyGroup,getMyGroups,inviteMember,getMyInvites,acceptInvite} from "../controllers/family.controller.js";

const router = Router();

router.post("/create",verifyPatient,createFamilyGroup);
router.get("/my-groups",verifyPatient,getMyGroups);
router.post("/invite-member",verifyPatient,inviteMember);
router.get("/my-invites",verifyPatient,getMyInvites);
router.post("/accept-invite",verifyPatient,acceptInvite);

export default router;