/**
 * Priority Ranker
 * Orders arguments by impact
 */

import { Rebuttal } from "../../shared/types";

export class PriorityRanker {
  rank(rebuttals: Rebuttal[]): Rebuttal[] {
    return rebuttals.sort((a, b) => {
      // Sort by priority first, then impact score
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.impactScore - a.impactScore;
    });
  }
}
