import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
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
export default router