import OpenAI from 'openai';
import { IModerationModule, ContentPayload, ModuleResult } from '@/types';

export class AITextModerationModule implements IModerationModule {
  public readonly name = 'AITextModerationModule';
  
  private readonly openai = new OpenAI(); 

  async execute(payload: ContentPayload): Promise<ModuleResult> {
    const systemPrompt = `
      You are a content moderator for a professional social network similar to LinkedIn.
      Your task is to analyze the following text and determine if it violates our policies.
      Policies include: hate speech, harassment, spam, scams, unprofessional language, and promotion of violence or self-harm, LGBT content.

      Respond with ONLY a JSON object with the following structure:
      { "decision": "APPROVE" | "FLAG" | "REJECT", "reason": "A brief explanation for your decision." }

      - Use "REJECT" for clear, severe violations (e.g., hate speech, direct threats).
      - Use "FLAG" for borderline cases, spammy but not malicious content, or unprofessionalism.
      - Use "APPROVE" if the content is professional and adheres to policies.
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106", // A model that supports JSON mode
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Text to analyze: "${payload.text}"` }
        ],
        response_format: { type: "json_object" },
      });

      const aiResponseText = completion.choices[0]?.message?.content;

      if (aiResponseText) {
        const aiResponse = JSON.parse(aiResponseText);
        
        if (aiResponse.decision && aiResponse.decision !== 'APPROVE') {
            return {
                moduleName: this.name,
                decision: aiResponse.decision,
                reason: `AI analysis: ${aiResponse.reason}`,
            };
        }
      }

      return { moduleName: this.name, decision: 'APPROVE' };

    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return {
        moduleName: this.name,
        decision: 'FLAG',
        reason: 'AI text analysis service failed. Content flagged for manual review.',
      };
    }
  }
}