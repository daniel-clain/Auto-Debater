/**
 * Rival Profiler
 * Builds and maintains opponent personas
 */

import { RivalProfile } from "../../shared/types";
import { Database } from "../services/database";

interface Argument {
  id: string;
  sessionId: string;
  speaker: "user" | "opponent";
  text: string;
  timestamp: number;
  analysis: {
    toneScore: number;
    keyPoints: string[];
  };
}

export class RivalProfiler {
  private db: Database;
  private profiles: Map<string, RivalProfile> = new Map(); // identifier -> profile

  constructor() {
    this.db = new Database();
  }

  async identifyOrCreateRival(identifier: string): Promise<RivalProfile> {
    // Check if profile exists
    if (this.profiles.has(identifier)) {
      const profile = this.profiles.get(identifier)!;
      profile.argumentCount++;
      return profile;
    }

    // Load from database or create new
    const existing = await this.db.getRivalProfile(identifier);
    if (existing) {
      this.profiles.set(identifier, existing);
      return existing;
    }

    // Create new profile
    const newProfile: RivalProfile = {
      id: `rival-${Date.now()}`,
      identifier,
      name: `Rival_${identifier.substring(0, 8)}`,
      personaType: "unknown",
      beliefPatterns: {},
      aggressionScore: 0,
      argumentCount: 0,
    };

    this.profiles.set(identifier, newProfile);
    await this.db.saveRivalProfile(newProfile);
    return newProfile;
  }

  async updateRivalProfile(
    identifier: string,
    argument: Argument
  ): Promise<void> {
    const profile = await this.identifyOrCreateRival(identifier);

    // Update aggression score (exponential moving average)
    const toneScore = argument.analysis.toneScore;
    const aggressionValue = Math.abs(Math.min(0, toneScore));
    const alpha = 0.3;
    profile.aggressionScore =
      alpha * aggressionValue + (1 - alpha) * profile.aggressionScore;

    // Update belief patterns
    const keywords = this.extractKeywords(argument.text);
    for (const keyword of keywords) {
      profile.beliefPatterns[keyword] =
        (profile.beliefPatterns[keyword] || 0) + 1;
    }

    // Update persona type
    profile.personaType = this.calculatePersona(profile);

    // Save to database
    await this.db.saveRivalProfile(profile);
  }

  private extractKeywords(text: string): string[] {
    // Simplified keyword extraction
    // In production, use NLP library
    const commonTopics = [
      "politics",
      "science",
      "religion",
      "economy",
      "health",
      "education",
    ];
    const textLower = text.toLowerCase();
    const found = commonTopics.filter((topic) => textLower.includes(topic));
    return found.slice(0, 5); // Top 5
  }

  private calculatePersona(profile: RivalProfile): string {
    if (profile.aggressionScore > 0.7) {
      return "hostile_aggressive";
    } else if (profile.aggressionScore > 0.4) {
      return "defensive";
    } else if (profile.aggressionScore < 0.2) {
      return "civil_respectful";
    } else {
      return "neutral";
    }
  }

  async getRivalProfile(identifier: string): Promise<RivalProfile | null> {
    return await this.identifyOrCreateRival(identifier);
  }
}
