/**
 * Intelligence Coordinator
 * Main orchestrator for argument modeling, rebuttal generation, and updates
 */

import {
  ArgumentAnalysis,
  ArgumentStyle,
  DebateSummary,
  MicroUpdateMessage,
  Rebuttal,
} from "../../shared/types";
import { RivalProfiler } from "../profile/rival-profiler";
import { PriorityRanker } from "../response/priority-ranker";
import { ArgumentModel } from "./argument-model";
import { BoundaryEnforcer } from "./boundary-enforcer";
import { RebuttalGenerator } from "./rebuttal-generator";
import { ToneAnalyzer } from "./tone-analyzer";

export interface IntelligenceUpdates {
  microUpdate?: MicroUpdateMessage["payload"];
  rebuttals?: Rebuttal[];
  summary?: DebateSummary;
  boundaryWarning?: {
    message: string;
    severity: "warning" | "critical";
    toneScore: number;
  };
  style?: ArgumentStyle;
}

export class IntelligenceCoordinator {
  private argumentModel: ArgumentModel;
  private rebuttalGenerator: RebuttalGenerator;
  private toneAnalyzer: ToneAnalyzer;
  private boundaryEnforcer: BoundaryEnforcer;
  private priorityRanker: PriorityRanker;
  private rivalProfiler: RivalProfiler;

  constructor() {
    this.argumentModel = new ArgumentModel();
    this.rebuttalGenerator = new RebuttalGenerator();
    this.toneAnalyzer = new ToneAnalyzer();
    this.boundaryEnforcer = new BoundaryEnforcer();
    this.priorityRanker = new PriorityRanker();
    this.rivalProfiler = new RivalProfiler();
  }

  async processArgument(
    text: string,
    speaker: "user" | "opponent",
    analysis: ArgumentAnalysis,
    sessionId: string
  ): Promise<IntelligenceUpdates> {
    // Update argument model
    await this.argumentModel.addArgument(text, speaker, analysis, sessionId);

    // Update rival profile if opponent
    if (speaker === "opponent") {
      const identifier = `session-${sessionId}`; // In production, use voice fingerprint
      await this.rivalProfiler.updateRivalProfile(identifier, {
        id: `${sessionId}-${Date.now()}`,
        sessionId,
        speaker,
        text,
        timestamp: Date.now(),
        analysis,
      });
    }

    // Check tone and boundaries
    const toneCheck = this.toneAnalyzer.analyze(analysis.toneScore, text);
    const boundaryCheck = await this.boundaryEnforcer.check(
      analysis.toneScore,
      text,
      sessionId
    );

    // Generate rebuttals if opponent
    let rebuttals: Rebuttal[] = [];
    let style: ArgumentStyle = "kind";

    if (speaker === "opponent") {
      style = this.determineStyle(boundaryCheck);
      rebuttals = await this.rebuttalGenerator.generate(
        text,
        analysis,
        sessionId,
        style
      );
      rebuttals = this.priorityRanker.rank(rebuttals);
    }

    // Get debate summary
    const summary = await this.argumentModel.getSummary(sessionId);

    // Create micro-update with top rebuttal
    const topRebuttal = rebuttals[0];

    return {
      microUpdate: topRebuttal
        ? {
            topRebuttal,
            summary,
            priority: topRebuttal.priority,
          }
        : undefined,
      rebuttals: rebuttals.slice(0, 6), // Top 6
      summary,
      boundaryWarning: boundaryCheck.violated
        ? {
            message: boundaryCheck.message || "",
            severity: boundaryCheck.severity || "warning",
            toneScore: analysis.toneScore,
          }
        : undefined,
      style,
    };
  }

  private determineStyle(boundaryCheck: any): ArgumentStyle {
    if (boundaryCheck.violated && boundaryCheck.severity === "critical") {
      return "stern";
    }
    return "kind"; // Default
  }
}
