import { Router } from "express";
import {
  getUserUrls,
  redirectByShortCode,
  shortenUrl,
} from "../controllers/urlController";
import { requireAuth } from "../middleware/authMiddleware";

const urlRouter = Router();

urlRouter.post("/shorten", requireAuth, shortenUrl);
urlRouter.get("/user", requireAuth, getUserUrls);
urlRouter.get("/s/:shortCode", redirectByShortCode);

export default urlRouter;
