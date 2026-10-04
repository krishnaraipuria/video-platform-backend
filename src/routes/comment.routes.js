import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT);  

router.route("/:videoId").get(getvideocomments).post(addcomment);
router.route("/c/:commentId").delete(deleteComment).patch(updatecomment);

export default router