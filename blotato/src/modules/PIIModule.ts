import { IModerationModule, ContentPayload, ModuleResult } from '@/types';

/**
 * Detects Personally Identifiable Information (PII) using regular expressions.
 * Posting PII is often against platform terms of service.
 */
export class PIIModule implements IModerationModule {
  public readonly name = 'PIIModule';

  private readonly piiPatterns = [
    { name: 'Email', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi },
    { name: 'Phone Number', regex: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g },
    // A simple regex for credit card like numbers. Real validation is more complex.
    { name: 'Credit Card', regex: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g },
  ];

  async execute(payload: ContentPayload): Promise<ModuleResult> {
    for (const pattern of this.piiPatterns) {
      if (pattern.regex.test(payload.text)) {
        return {
          moduleName: this.name,
          decision: 'FLAG', // Flagging is more appropriate than outright rejection
          reason: `Potential ${pattern.name} detected in content.`,
        };
      }
    }

    return {
      moduleName: this.name,
      decision: 'APPROVE',
    };
  }
}

