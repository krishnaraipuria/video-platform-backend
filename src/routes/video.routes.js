import {Router} from "express"
import { getallvideos, publishvideo,getvideoById,deletevideo,updatevideo,publishstatus } from "../controllers/video.controllers.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js";

const router=Router()
router.use(verifyJWT);
router.route("/").get(
    getallvideos
).post(
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        },
    ]),
    publishvideo
)

router.route("/:videoId")
    .get(getvideoById)
    .delete(deletevideo)
    .patch(upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        },
    ]), updatevideo)

router.route("/toggle/publish/:videoId").patch(publishstatus)
export default router