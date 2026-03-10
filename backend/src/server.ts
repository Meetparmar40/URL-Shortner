import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDynamoDB } from "./utils/dynamodb";
import authRouter from "./routes/authRoutes";
import urlRouter from "./routes/urlRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { redirectByShortCode } from "./controllers/urlController";

dotenv.config();
initializeDynamoDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/url", urlRouter);

app.get("/s/:shortCode", redirectByShortCode);

const frontendBuildPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendBuildPath));

app.get("*", (req, res) => {
  if (req.path.startsWith("/auth") || req.path.startsWith("/url")) {
    res.status(404).json({ message: "Route not found" });
    return;
  }

  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

app.use(errorHandler);

const PORT = Number(process.env.PORT || 5000);

const startServer = async (): Promise<void> => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Connected to DynamoDB");
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
