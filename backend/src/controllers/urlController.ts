import type { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";
import {
  createUrl,
  getUrl,
  getUserUrls as fetchUserUrls,
  incrementClickCount,
  checkShortCodeExists,
} from "../models/Url";
import { isValidHttpUrl } from "../utils/validators";

const SHORT_CODE_LENGTH = 7;

export const shortenUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { originalUrl } = req.body as { originalUrl?: string };
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!originalUrl) {
      res.status(400).json({ message: "originalUrl is required" });
      return;
    }

    if (!isValidHttpUrl(originalUrl)) {
      res.status(400).json({ message: "Invalid URL. Use http/https" });
      return;
    }

    let shortCode = nanoid(SHORT_CODE_LENGTH);

    // Keep generating if collision occurs.
    while (await checkShortCodeExists(shortCode)) {
      shortCode = nanoid(SHORT_CODE_LENGTH);
    }

    await createUrl(shortCode, userId, originalUrl);

    const baseUrl = process.env.BASE_URL ?? `${req.protocol}://${req.get("host")}`;

    res.status(201).json({
      id: shortCode,
      originalUrl,
      shortCode,
      shortUrl: `${baseUrl}/s/${shortCode}`,
      clickCount: 0,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserUrls = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const urls = await fetchUserUrls(userId);
    const baseUrl = process.env.BASE_URL ?? `${req.protocol}://${req.get("host")}`;

    const data = urls.map((entry: any) => ({
      id: entry.shortCode,
      originalUrl: entry.originalUrl,
      shortCode: entry.shortCode,
      shortUrl: `${baseUrl}/s/${entry.shortCode}`,
      clickCount: entry.clickCount,
      createdAt: entry.createdAt,
    }));

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const redirectByShortCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shortCode } = req.params;

    const url = await getUrl(shortCode);
    if (!url) {
      res.status(404).json({ message: "Short URL not found" });
      return;
    }

    await incrementClickCount(shortCode);
    res.redirect(url.originalUrl);
  } catch (error) {
    next(error);
  }
};
