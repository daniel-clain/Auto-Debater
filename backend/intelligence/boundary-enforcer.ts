/**
 * Boundary Enforcer
 * Manages respect and boundaries
 */

export class BoundaryEnforcer {
  private threshold = -0.7;

  async check(
    toneScore: number,
    text: string,
    sessionId: string
  ): Promise<{
    violated: boolean;
    severity?: "warning" | "critical";
    message?: string;
  }> {
    if (toneScore >= this.threshold) {
      return { violated: false };
    }

    const severity = toneScore < -0.9 ? "critical" : "warning";
    const message =
      severity === "critical"
        ? "I've set clear boundaries about respectful discourse. If this continues, I'll need to end our conversation."
        : "I'd like to keep our conversation respectful. Can we continue discussing this in a civil manner?";

    return {
      violated: true,
      severity,
      message,
    };
  }
}
