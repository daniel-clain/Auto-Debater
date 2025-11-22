/**
 * Argument Analyzer
 * Analyzes arguments using multi-agent AI system
 */

import { ArgumentAnalysis } from "../../shared/types";
import { MultiAgentSystem } from "./multi-agent";

export class ArgumentAnalyzer {
  private multiAgent: MultiAgentSystem;

  constructor() {
    this.multiAgent = new MultiAgentSystem();
  }

  async analyze(
    text: string,
    speaker: "user" | "opponent",
    sessionId: string
  ): Promise<ArgumentAnalysis> {
    // Use multi-agent system to analyze
    return await this.multiAgent.analyzeArgument(text, speaker, sessionId);
  }
}
