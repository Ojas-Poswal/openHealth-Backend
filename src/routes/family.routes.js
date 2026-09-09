import { Router } from "express";
import verifyPatient from "../middlewares/auth.middleware.js";
import {createFamilyGroup,getMyGroups,inviteMember,getMyInvites,acceptInvite,rejectInvite,leaveGroup,promoteToAdmin,demoteAdmin,removeMember,deleteGroup} from "../controllers/family.controller.js";

const router = Router();

router.post("/create",verifyPatient,createFamilyGroup);
router.get("/my-groups",verifyPatient,getMyGroups);
router.post("/invite-member",verifyPatient,inviteMember);
router.get("/my-invites",verifyPatient,getMyInvites);
router.post("/accept-invite",verifyPatient,acceptInvite);
router.post("/reject-invite",verifyPatient,rejectInvite);
router.post("/leave-group",verifyPatient,leaveGroup);
router.post("/promote-admin",verifyPatient,promoteToAdmin);
router.post("/demote-admin",verifyPatient,demoteAdmin);
router.post("/remove-member",verifyPatient,removeMember);
router.delete("/delete-group",verifyPatient,deleteGroup)

export default router;