/**
 * Argument Model
 * Maintains debate state and history
 */

import { ArgumentAnalysis, DebateSummary } from "../../shared/types";
import { Database } from "../services/database";

interface Argument {
  id: string;
  sessionId: string;
  speaker: "user" | "opponent";
  text: string;
  timestamp: number;
  analysis: ArgumentAnalysis;
}

export class ArgumentModel {
  private db: Database;
  private arguments: Map<string, Argument[]> = new Map(); // sessionId -> arguments

  constructor() {
    this.db = new Database();
  }

  async addArgument(
    text: string,
    speaker: "user" | "opponent",
    analysis: ArgumentAnalysis,
    sessionId: string
  ): Promise<void> {
    if (!this.arguments.has(sessionId)) {
      this.arguments.set(sessionId, []);
    }

    const argument: Argument = {
      id: `${sessionId}-${Date.now()}`,
      sessionId,
      speaker,
      text,
      timestamp: Date.now(),
      analysis,
    };

    this.arguments.get(sessionId)!.push(argument);
    await this.db.saveArgument(argument);
  }

  async getSummary(sessionId: string): Promise<DebateSummary> {
    const args = this.arguments.get(sessionId) || [];
    const userArgs = args.filter((a) => a.speaker === "user");
    const opponentArgs = args.filter((a) => a.speaker === "opponent");

    const opponentToneScores = opponentArgs
      .map((a) => a.analysis.toneScore)
      .filter((s) => s !== null && s !== undefined);
    const userToneScores = userArgs
      .map((a) => a.analysis.toneScore)
      .filter((s) => s !== null && s !== undefined);

    const avgOpponentTone =
      opponentToneScores.length > 0
        ? opponentToneScores.reduce((a, b) => a + b, 0) /
          opponentToneScores.length
        : 0;
    const avgUserTone =
      userToneScores.length > 0
        ? userToneScores.reduce((a, b) => a + b, 0) / userToneScores.length
        : 0;

    const boundaryViolations = opponentArgs.filter(
      (a) => a.analysis.toneScore < -0.7
    ).length;

    return {
      totalArguments: args.length,
      userArguments: userArgs.length,
      opponentArguments: opponentArgs.length,
      opponentToneScore: avgOpponentTone,
      userToneScore: avgUserTone,
      debateHealth:
        avgOpponentTone > -0.5
          ? "good"
          : avgOpponentTone > -0.8
          ? "deteriorating"
          : "critical",
      boundaryViolations,
    };
  }
}
