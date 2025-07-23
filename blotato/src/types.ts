import type { NextApiRequest, NextApiResponse } from "next";

export type ModerationDecision = 'REJECT' | 'FLAG' | 'APPROVE';

/**
 * The payload received by the moderation service API.
 */
export interface ContentPayload {
  text: string;
  authorId: string;
  imageUrl?: string;
}

/**
 * The result from a single moderation module.
 */
export interface ModuleResult {
  moduleName: string;
  decision: ModerationDecision;
  reason?: string;
}

/**
 * The final, aggregated response from the moderation service.
 */
export interface ModerationResult {
  finalDecision: ModerationDecision;
  reasons: string[];
}

/**
 * Interface for all moderation modules to implement.
 * This ensures consistency and allows for a plug-and-play architecture.
 */
export interface IModerationModule {
  readonly name: string;
  execute(payload: ContentPayload): Promise<ModuleResult>;
}