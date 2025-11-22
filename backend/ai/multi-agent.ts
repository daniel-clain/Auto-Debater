/**
 * Multi-Agent AI System
 * Coordinates ChatGPT, DeepSeek, and Grok
 */

import axios from "axios";
import OpenAI from "openai";
import { ArgumentAnalysis } from "../../shared/types";
import { config } from "../services/config";

export class MultiAgentSystem {
  private openai: OpenAI | null = null;

  constructor() {
    if (config.openaiApiKey) {
      this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    }
  }

  async analyzeArgument(
    text: string,
    speaker: "user" | "opponent",
    sessionId: string
  ): Promise<ArgumentAnalysis> {
    // Run analysis with all agents in parallel
    const [chatgptResult, deepseekResult, grokResult] =
      await Promise.allSettled([
        this.analyzeWithChatGPT(text, speaker),
        this.analyzeWithDeepSeek(text, speaker),
        this.analyzeWithGrok(text, speaker),
      ]);

    // Build consensus from results
    return this.buildConsensus([chatgptResult, deepseekResult, grokResult]);
  }

  private async analyzeWithChatGPT(
    text: string,
    speaker: string
  ): Promise<ArgumentAnalysis> {
    if (!this.openai) {
      return this.getDefaultAnalysis();
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content:
              "Analyze this argument. Return JSON with: factCheckScore (0-1), toneScore (-1 to 1), logicalFallacies (array), emotion (string), keyPoints (array).",
          },
          { role: "user", content: `Speaker: ${speaker}\nArgument: ${text}` },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return {
        factCheckScore: result.factCheckScore || 0.5,
        toneScore: result.toneScore || 0,
        logicalFallacies: result.logicalFallacies || [],
        emotion: result.emotion || "neutral",
        consensusScore: 1.0,
        keyPoints: result.keyPoints || [],
      };
    } catch (error) {
      console.error("ChatGPT analysis error:", error);
      return this.getDefaultAnalysis();
    }
  }

  private async analyzeWithDeepSeek(
    text: string,
    speaker: string
  ): Promise<ArgumentAnalysis> {
    if (!config.deepseekApiKey) {
      return this.getDefaultAnalysis();
    }

    try {
      const response = await axios.post(
        "https://api.deepseek.com/v1/chat/completions",
        {
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "Analyze this argument. Return JSON with: factCheckScore (0-1), toneScore (-1 to 1), logicalFallacies (array), emotion (string), keyPoints (array).",
            },
            { role: "user", content: `Speaker: ${speaker}\nArgument: ${text}` },
          ],
        },
        {
          headers: { Authorization: `Bearer ${config.deepseekApiKey}` },
        }
      );

      const result = JSON.parse(
        response.data.choices[0].message.content || "{}"
      );
      return {
        factCheckScore: result.factCheckScore || 0.5,
        toneScore: result.toneScore || 0,
        logicalFallacies: result.logicalFallacies || [],
        emotion: result.emotion || "neutral",
        consensusScore: 1.0,
        keyPoints: result.keyPoints || [],
      };
    } catch (error) {
      console.error("DeepSeek analysis error:", error);
      return this.getDefaultAnalysis();
    }
  }

  private async analyzeWithGrok(
    text: string,
    speaker: string
  ): Promise<ArgumentAnalysis> {
    if (!config.grokApiKey) {
      return this.getDefaultAnalysis();
    }

    try {
      const response = await axios.post(
        "https://api.x.ai/v1/chat/completions",
        {
          model: "grok-beta",
          messages: [
            {
              role: "system",
              content:
                "Analyze this argument. Return JSON with: factCheckScore (0-1), toneScore (-1 to 1), logicalFallacies (array), emotion (string), keyPoints (array).",
            },
            { role: "user", content: `Speaker: ${speaker}\nArgument: ${text}` },
          ],
        },
        {
          headers: { Authorization: `Bearer ${config.grokApiKey}` },
        }
      );

      const result = JSON.parse(
        response.data.choices[0].message.content || "{}"
      );
      return {
        factCheckScore: result.factCheckScore || 0.5,
        toneScore: result.toneScore || 0,
        logicalFallacies: result.logicalFallacies || [],
        emotion: result.emotion || "neutral",
        consensusScore: 1.0,
        keyPoints: result.keyPoints || [],
      };
    } catch (error) {
      console.error("Grok analysis error:", error);
      return this.getDefaultAnalysis();
    }
  }

  private buildConsensus(
    results: PromiseSettledResult<ArgumentAnalysis>[]
  ): ArgumentAnalysis {
    const validResults = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<ArgumentAnalysis>).value);

    if (validResults.length === 0) {
      return this.getDefaultAnalysis();
    }

    // Average scores
    const factCheckScore =
      validResults.reduce((sum, r) => sum + r.factCheckScore, 0) /
      validResults.length;
    const toneScore =
      validResults.reduce((sum, r) => sum + r.toneScore, 0) /
      validResults.length;

    // Collect all fallacies
    const allFallacies = validResults.flatMap((r) => r.logicalFallacies);
    const uniqueFallacies = Array.from(new Set(allFallacies));

    // Most common emotion
    const emotions = validResults.map((r) => r.emotion);
    const emotion = emotions.sort((a, b) => {
      const countA = emotions.filter((e) => e === a).length;
      const countB = emotions.filter((e) => e === b).length;
      return countB - countA;
    })[0];

    return {
      factCheckScore,
      toneScore,
      logicalFallacies: uniqueFallacies,
      emotion,
      consensusScore: validResults.length / 3.0,
      keyPoints: validResults[0]?.keyPoints || [],
    };
  }

  private getDefaultAnalysis(): ArgumentAnalysis {
    return {
      factCheckScore: 0.5,
      toneScore: 0,
      logicalFallacies: [],
      emotion: "neutral",
      consensusScore: 0,
      keyPoints: [],
    };
  }
}
