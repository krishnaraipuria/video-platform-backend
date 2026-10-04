import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, registerUser, updateAccountUser, updateuserAvater, updateusercoverimage } from "../controllers/user.controllers.js";
import { loginUser } from "../controllers/user.controllers.js";

import { upload } from "../middlewares/multer.middleware.js";
import { logoutUser } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {refreshAccessToken} from "../controllers/user.controllers.js";
const router = Router()

router.route("/login").post(
    loginUser
)
router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxcount: 1
        },
        {
            name: "coverImage",
            maxcount:1
        }
    ]),
    registerUser
)

router.route("/logout").post(
    verifyJWT,
    logoutUser
)

router.route("/refresh-token").post(
    refreshAccessToken
)

router.route("/change-password").post(
    verifyJWT,changeCurrentPassword
)
router.route("/current-user").get(
    verifyJWT,getCurrentUser
)

router.route("/update-account").patch(
    verifyJWT,updateAccountUser
)

router.route("/update-avatar").patch(
    verifyJWT, upload.single("avatar"), updateuserAvater
)

router.route("/cover-image").patch(
    verifyJWT, upload.single("coverimage"), updateusercoverimage
)

//from params;
router.route("/c/:username").get(
    verifyJWT,getUserChannelProfile
)

router.route("/history").get(
    verifyJWT,getWatchHistory
)
export default router