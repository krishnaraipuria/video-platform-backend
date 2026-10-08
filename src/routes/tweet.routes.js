import {Router} from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {createtweet,getUserTweets,updateTweet,deleteTweet} from "../controllers/tweet.controllers.js"
const router=Router()
router.use(verifyJWT);

router.route("/").post(createtweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);


export default router