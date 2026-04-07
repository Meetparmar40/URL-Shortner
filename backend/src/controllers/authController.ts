import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { OAuth2Client } from "google-auth-library";
import {
  createUser,
  getUserByEmail,
  getUser,
  createGoogleUser,
  updateUserGoogleId,
} from "../models/User";
import {
  comparePassword,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "../utils/auth";
import {
  isStrongEnoughPassword,
  isValidEmail,
} from "../utils/validators";
// Removed googleClient instantiation
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    if (!isStrongEnoughPassword(password)) {
      res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
      return;
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const userId = randomUUID();
    const hashedPassword = await hashPassword(password);
    await createUser(userId, email, hashedPassword);

    res.status(201).json({
      message: "User created successfully",
      user: { id: userId, email: email.toLowerCase() },
    });
  } catch (error) {
    next(error);
  }
};

export const oauthToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { grant_type } = req.body;

    if (grant_type === "password") {
      const { email, password } = req.body as {
        email?: string;
        password?: string;
      };

      if (!email || !password) {
        res.status(400).json({ error: "invalid_request", error_description: "Email and password are required" });
        return;
      }

      const user = await getUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: "invalid_client", error_description: "Invalid credentials" });
        return;
      }

      if (!user.passwordHash) {
        res.status(401).json({ error: "invalid_client", error_description: "Please log in with your provider or reset password" });
        return;
      }

      const isPasswordMatch = await comparePassword(password, user.passwordHash);
      if (!isPasswordMatch) {
        res.status(401).json({ error: "invalid_client", error_description: "Invalid credentials" });
        return;
      }

      const access_token = signAccessToken({ userId: user.userId, email: user.email });
      const refresh_token = signRefreshToken({ userId: user.userId });

      res.status(200).json({
        access_token,
        refresh_token,
        token_type: "Bearer",
        expires_in: 900, // 15 minutes
        user: { id: user.userId, email: user.email },
      });
      return;

    } else if (grant_type === "refresh_token") {
      const { refresh_token } = req.body as { refresh_token?: string };

      if (!refresh_token) {
        res.status(400).json({ error: "invalid_request", error_description: "Refresh token is required" });
        return;
      }

      try {
        const decoded = verifyToken(refresh_token);
        const user = await getUser(decoded.userId);

        if (!user) {
          res.status(401).json({ error: "invalid_grant", error_description: "Invalid user" });
          return;
        }

        const access_token = signAccessToken({ userId: user.userId, email: user.email });
        const new_refresh_token = signRefreshToken({ userId: user.userId });

        res.status(200).json({
          access_token,
          refresh_token: new_refresh_token,
          token_type: "Bearer",
          expires_in: 900,
        });
        return;
      } catch (err) {
        res.status(401).json({ error: "invalid_grant", error_description: "Invalid or expired refresh token" });
        return;
      }
    } else {
      res.status(400).json({ error: "unsupported_grant_type", error_description: "Unsupported grant type" });
      return;
    }
  } catch (error) {
    next(error);
  }
};
