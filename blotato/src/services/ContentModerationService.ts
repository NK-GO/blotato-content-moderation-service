// src/services/ContentModerationService.ts
import { IModerationModule, ContentPayload, ModerationResult } from '@/types';

export class ContentModerationService {
  private modules: IModerationModule[];

  constructor(modules: IModerationModule[]) {
    this.modules = modules;
  }

  public async moderate(payload: ContentPayload): Promise<ModerationResult> {
    const modulePromises = this.modules.map(module => module.execute(payload));
    const results = await Promise.all(modulePromises);

    const finalResult: ModerationResult = {
      finalDecision: 'APPROVE',
      reasons: [],
    };

    for (const result of results) {
      if (result.decision === 'REJECT') {
        finalResult.finalDecision = 'REJECT';
        if (result.reason) finalResult.reasons.push(result.reason);
      }
    }

    if (finalResult.finalDecision === 'REJECT') {
      return finalResult;
    }

    for (const result of results) {
      if (result.decision === 'FLAG') {
        finalResult.finalDecision = 'FLAG';
        if (result.reason) finalResult.reasons.push(result.reason);
      }
    }

    return finalResult;
  }
}