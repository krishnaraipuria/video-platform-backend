import { Router } from 'express';
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addcomment, deletecomment, getvideocomments, updatecomment } from '../controllers/comments.controllers.js';

const router = Router();

router.use(verifyJWT);  

router.route("/:videoId").get(getvideocomments).post(addcomment);
router.route("/c/:commentId").delete(deletecomment).patch(updatecomment);

export default router