import { Router } from "express";

import { testAI } from "../controllers/testAI.controller.js";

const router = Router();

router.get("/", testAI);

export default router;