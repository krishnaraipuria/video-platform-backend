import { Router } from 'express';
import { getchannelstats,getchannelvideos } from '../controllers/dashboard.controllers.js';
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT);

router.route("/stats").get(getchannelstats);
router.route("/videos").get(getchannelvideos);

export default router