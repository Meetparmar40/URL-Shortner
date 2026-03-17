import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

let docClient: DynamoDBDocumentClient;

export const getDocClient = (): DynamoDBDocumentClient => {
  if (!docClient) {
    throw new Error("DynamoDB not initialized. Call initializeDynamoDB() first.");
  }
  return docClient;
};

export const initializeDynamoDB = (): void => {
  const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
  docClient = DynamoDBDocumentClient.from(client);
  console.log("DynamoDB client initialized");
};

export const getUsersTable = (): string => {
  const table = process.env.USERS_TABLE;
  if (!table) throw new Error("USERS_TABLE env var is missing");
  return table;
};

export const getUrlsTable = (): string => {
  const table = process.env.URLs_TABLE;
  if (!table) throw new Error("URLs_TABLE env var is missing");
  return table;
};

export const getUser = async (userId: string) => {
  const command = new GetCommand({
    TableName: getUsersTable(),
    Key: { userId },
  });
  const result = await getDocClient().send(command);
  return result.Item;
};

export const getUserByEmail = async (email: string) => {
  const command = new QueryCommand({
    TableName: getUsersTable(),
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: { ":email": email.toLowerCase() },
  });
  const result = await getDocClient().send(command);
  return result.Items?.[0];
};

export const createUser = async (userId: string, email: string, passwordHash?: string) => {
  const command = new PutCommand({
    TableName: getUsersTable(),
    Item: {
      userId,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
    },
  });
  await getDocClient().send(command);
};

export const createGoogleUser = async (userId: string, email: string, googleId: string) => {
  const command = new PutCommand({
    TableName: getUsersTable(),
    Item: {
      userId,
      email: email.toLowerCase(),
      googleId,
      createdAt: new Date().toISOString(),
    },
  });
  await getDocClient().send(command);
};

export const updateUserGoogleId = async (userId: string, googleId: string) => {
  const command = new UpdateCommand({
    TableName: getUsersTable(),
    Key: { userId },
    UpdateExpression: "SET googleId = :googleId",
    ExpressionAttributeValues: { ":googleId": googleId },
  });
  await getDocClient().send(command);
};

export const getUrl = async (shortCode: string) => {
  const command = new GetCommand({
    TableName: getUrlsTable(),
    Key: { shortCode },
  });
  const result = await getDocClient().send(command);
  return result.Item;
};

export const createUrl = async (
  shortCode: string,
  userId: string,
  originalUrl: string
) => {
  const command = new PutCommand({
    TableName: getUrlsTable(),
    Item: {
      shortCode,
      userId,
      originalUrl,
      clickCount: 0,
      createdAt: new Date().toISOString(),
    },
  });
  await getDocClient().send(command);
};

export const getUserUrls = async (userId: string) => {
  const command = new QueryCommand({
    TableName: getUrlsTable(),
    IndexName: "userId-createdAt-index",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: { ":userId": userId },
    ScanIndexForward: false, // newest first
  });
  const result = await getDocClient().send(command);
  return result.Items || [];
};

export const incrementClickCount = async (shortCode: string) => {
  const command = new UpdateCommand({
    TableName: getUrlsTable(),
    Key: { shortCode },
    UpdateExpression: "SET clickCount = if_not_exists(clickCount, :zero) + :inc",
    ExpressionAttributeValues: { ":inc": 1, ":zero": 0 },
    ReturnValues: "ALL_NEW",
  });
  const result = await getDocClient().send(command);
  return result.Attributes;
};

export const checkShortCodeExists = async (shortCode: string): Promise<boolean> => {
  const result = await getUrl(shortCode);
  return !!result;
};
