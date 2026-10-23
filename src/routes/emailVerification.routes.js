import { Router } from 'express';
import {sendEmailVerification,emailVerification} from "../controllers/emailVerification.controllers.js"
const router = Router();

router.route('/emailsend').post(sendEmailVerification);
router.route('/emailverify').post(emailVerification);
export default router