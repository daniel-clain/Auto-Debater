/**
 * API Key Verification Unit Tests
 * Tests that each AI service API key is valid and accessible
 */

import axios from "axios";
import OpenAI from "openai";
import { describe, expect, it } from "vitest";
import { config } from "../services/config";

describe("API Key Verification", () => {
  describe("OpenAI (ChatGPT)", () => {
    it("should have API key configured", () => {
      expect(config.openaiApiKey).toBeTruthy();
      expect(config.openaiApiKey.length).toBeGreaterThan(0);
    });

    it("should successfully authenticate and make API call", async () => {
      if (!config.openaiApiKey) {
        throw new Error("OPENAI_API_KEY not found in .env file");
      }

      const openai = new OpenAI({ apiKey: config.openaiApiKey });

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content:
              "Respond with only the word 'success' if you can read this.",
          },
        ],
        max_tokens: 5,
      });

      expect(response).toBeDefined();
      expect(response.choices).toBeDefined();
      expect(response.choices.length).toBeGreaterThan(0);
      expect(response.choices[0]?.message?.content).toBeDefined();
    }, 30000);
  });

  describe("DeepSeek", () => {
    it("should have API key configured", () => {
      expect(config.deepseekApiKey).toBeTruthy();
      expect(config.deepseekApiKey.length).toBeGreaterThan(0);
    });

    it("should successfully authenticate and make API call", async () => {
      if (!config.deepseekApiKey) {
        throw new Error("DEEPSEEK_API_KEY not found in .env file");
      }

      const response = await axios.post(
        "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content:
                "Respond with only the word 'success' if you can read this.",
            },
          ],
          max_tokens: 5,
        },
        {
          headers: { Authorization: `Bearer ${config.deepseekApiKey}` },
          timeout: 10000,
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.choices).toBeDefined();
      expect(response.data.choices.length).toBeGreaterThan(0);
      expect(response.data.choices[0]?.message?.content).toBeDefined();
    }, 30000);
  });

  describe("Grok (x.ai)", () => {
    it("should have API key configured", () => {
      expect(config.grokApiKey).toBeTruthy();
      expect(config.grokApiKey.length).toBeGreaterThan(0);
    });

    it("should successfully authenticate and make API call", async () => {
      if (!config.grokApiKey) {
        throw new Error("GROK_API_KEY not found in .env file");
      }

      const response = await axios.post(
        "https://api.x.ai/v1/chat/completions",
        {
          model: "grok-beta",
          messages: [
            {
              role: "user",
              content:
                "Respond with only the word 'success' if you can read this.",
            },
          ],
          max_tokens: 5,
        },
        {
          headers: { Authorization: `Bearer ${config.grokApiKey}` },
          timeout: 10000,
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.choices).toBeDefined();
      expect(response.data.choices.length).toBeGreaterThan(0);
      expect(response.data.choices[0]?.message?.content).toBeDefined();
    }, 30000);
  });
});
