import {Router} from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {toogleVideoLike,toggleCommentLike,toggleTweetLike,LikedVideos} from "../controllers/like.controllers.js"
const router=Router()
router.use(verifyJWT)

router.route("/toggle/v/:videoId").post(toogleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(LikedVideos);
export default router