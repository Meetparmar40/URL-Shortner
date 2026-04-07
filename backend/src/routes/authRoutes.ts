import { Router } from "express";
import { signup, oauthToken } from "../controllers/authController";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/token", oauthToken);

export default authRouter;
