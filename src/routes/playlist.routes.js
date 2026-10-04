import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT);
router.route("/").post(createPlaylist)
//?

export default router