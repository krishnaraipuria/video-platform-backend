import {Router} from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {toggleSubcription,getUserChannelSubcribers,getSubcribedChannels} from "../controllers/subscription.controllers.js"

const router=Router()
router.use(verifyJWT);

router
    .route("/c/:channelId")
    .get(getSubcribedChannels)
    .post(toggleSubcription);

router.route("/u/:subscriberId").get(getUserChannelSubcribers);

export default router