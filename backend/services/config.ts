/**
 * Configuration Service
 */

import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "8000", 10),
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || "",
  grokApiKey: process.env.GROK_API_KEY || "",
  databasePath: process.env.DATABASE_PATH || "./auto_debater.db",
};
