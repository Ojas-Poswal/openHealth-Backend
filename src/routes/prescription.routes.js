import {Router} from 'express';

import {createPrescription} from '../controllers/prescription.controller.js';

import verifyDoctor from "../middlewares/doctorAuth.middleware.js";

const router = Router();

router.post("/create",verifyDoctor,createPrescription);

export default router;