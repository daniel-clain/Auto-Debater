/**
 * Tone Analyzer
 * Monitors conversation health and tone
 */

export class ToneAnalyzer {
  analyze(toneScore: number, text: string): { health: string; score: number } {
    return {
      health:
        toneScore > -0.5
          ? "good"
          : toneScore > -0.8
          ? "deteriorating"
          : "critical",
      score: toneScore,
    };
  }
}
