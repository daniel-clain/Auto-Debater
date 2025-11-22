/**
 * Database Service
 * Handles data persistence
 */

import Database from "better-sqlite3";
import { RivalProfile } from "../../shared/types";
import { config } from "./config";

interface Argument {
  id: string;
  sessionId: string;
  speaker: string;
  text: string;
  timestamp: number;
  analysis: any;
}

export class Database {
  private db: Database.Database;

  constructor() {
    this.db = new Database(config.databasePath);
    this.initTables();
  }

  private initTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS arguments (
        id TEXT PRIMARY KEY,
        session_id TEXT,
        speaker TEXT,
        text TEXT,
        timestamp INTEGER,
        analysis TEXT
      );
      
      CREATE TABLE IF NOT EXISTS rebuttals (
        id TEXT PRIMARY KEY,
        argument_id TEXT,
        text TEXT,
        priority INTEGER,
        impact_score REAL,
        style TEXT
      );
      
      CREATE TABLE IF NOT EXISTS rival_profiles (
        id TEXT PRIMARY KEY,
        identifier TEXT UNIQUE,
        name TEXT,
        persona_type TEXT,
        aggression_score REAL,
        argument_count INTEGER DEFAULT 0,
        belief_patterns TEXT
      );
    `);
  }

  async saveArgument(argument: Argument): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO arguments (id, session_id, speaker, text, timestamp, analysis)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      argument.id,
      argument.sessionId,
      argument.speaker,
      argument.text,
      argument.timestamp,
      JSON.stringify(argument.analysis)
    );
  }

  async saveRivalProfile(profile: RivalProfile): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO rival_profiles (id, identifier, name, persona_type, aggression_score, argument_count, belief_patterns)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      profile.id,
      profile.identifier,
      profile.name,
      profile.personaType,
      profile.aggressionScore,
      profile.argumentCount,
      JSON.stringify(profile.beliefPatterns)
    );
  }

  async getRivalProfile(identifier: string): Promise<RivalProfile | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM rival_profiles WHERE identifier = ?
    `);

    const row = stmt.get(identifier) as any;
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      identifier: row.identifier,
      name: row.name,
      personaType: row.persona_type,
      aggressionScore: row.aggression_score || 0,
      argumentCount: row.argument_count || 0,
      beliefPatterns: JSON.parse(row.belief_patterns || "{}"),
    };
  }
}
