// User model types for DynamoDB
export interface IUser {
  userId: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export { createUser, getUserByEmail, getUser } from "../utils/dynamodb";
