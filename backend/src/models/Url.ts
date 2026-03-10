// URL model types for DynamoDB
export interface IUrl {
  shortCode: string;
  userId: string;
  originalUrl: string;
  clickCount: number;
  createdAt: string;
}

export {
  createUrl,
  getUrl,
  getUserUrls,
  incrementClickCount,
  checkShortCodeExists,
} from "../utils/dynamodb";
