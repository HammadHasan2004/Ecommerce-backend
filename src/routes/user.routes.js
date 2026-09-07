import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controller/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router();

router.route("/register").post(registerUser)


router.route("/login").post(loginUser)

//secured routes

router.route("/logout").post(verifyJWT, logoutUser) 

export default router