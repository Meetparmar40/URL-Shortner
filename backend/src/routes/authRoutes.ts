import { Router } from "express";
import { login, signup, googleLogin } from "../controllers/authController";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/google", googleLogin);

export default authRouter;
