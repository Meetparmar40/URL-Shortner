import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface UserPayload extends JwtPayload {
      userId: string;
      email: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
