// User model types for DynamoDB
export interface IUser {
  userId: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  createdAt: string;
}

export { createUser, getUserByEmail, getUser, createGoogleUser, updateUserGoogleId } from "../utils/dynamodb";
