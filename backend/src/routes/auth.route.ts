import { Router } from "express";
import { login, logout, refreshtoken, register } from "../controller/auth.controller";
import { isloggedin } from "../middleware/auth.middleware";


const router = Router()

router.post('/register',register)
router.post('/login',login)
router.post('/logout',isloggedin,logout)
router.post('/refresh-token',refreshtoken)

export default router