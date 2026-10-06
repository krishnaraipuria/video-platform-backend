import {Router} from "express"
import { getallvideos } from "../controllers/video.controllers.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"


const router=Router()
router.use(verifyJWT);
router.route("/").get(
    getallvideos
)
export default router