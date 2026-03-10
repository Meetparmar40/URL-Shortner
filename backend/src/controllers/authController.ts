import type { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";
import { createUser, getUserByEmail } from "../models/User";
import {
  comparePassword,
  hashPassword,
  signToken,
} from "../utils/auth";
import {
  isStrongEnoughPassword,
  isValidEmail,
} from "../utils/validators";

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

    const userId = nanoid();
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

export const login = async (
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

    const user = await getUserByEmail(email);
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordMatch = await comparePassword(password, user.passwordHash);
    if (!isPasswordMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = signToken({ userId: user.userId, email: user.email });

    res.status(200).json({
      token,
      user: { id: user.userId, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};
