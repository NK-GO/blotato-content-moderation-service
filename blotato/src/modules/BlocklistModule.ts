// src/modules/BlocklistModule.ts
import { IModerationModule, ContentPayload, ModuleResult } from '@/types';

export class BlocklistModule implements IModerationModule {
  public readonly name = 'BlocklistModule';
  
  private readonly blocklist: Set<string> = new Set([
    'buy followers',
    'crypto scam',
    'get rich quick',
    'multi-level marketing',
    'viagra', // Example of a common spam word
  ]);

  async execute(payload: ContentPayload): Promise<ModuleResult> {
    const lowerCaseText = payload.text.toLowerCase();

    for (const blockedPhrase of this.blocklist) {
      if (lowerCaseText.includes(blockedPhrase)) {
        return {
          moduleName: this.name,
          decision: 'REJECT',
          reason: `Content contains forbidden phrase: "${blockedPhrase}".`,
        };
      }
    }

    return {
      moduleName: this.name,
      decision: 'APPROVE',
    };
  }
}