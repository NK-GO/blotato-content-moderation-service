import type { NextApiRequest, NextApiResponse } from 'next';
import { ContentPayload, ModerationResult } from '@/types';
import { ContentModerationService } from '@/services/ContentModerationService';
import { BlocklistModule } from '@/modules/BlocklistModule';
import { PIIModule } from '@/modules/PIIModule';
import { AITextModerationModule } from '@/modules/AITextModerationModule';

const moderationService = new ContentModerationService([
  new BlocklistModule(),
  new PIIModule(),
  new AITextModerationModule(),
]);

type Data = ModerationResult | { error: string; reasons?: string[] };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const payload = req.body as ContentPayload;

    // Basic validation
    if (!payload.text || !payload.authorId) {
      return res.status(400).json({ error: 'Missing required fields: text and authorId' });
    }

    const result = await moderationService.moderate(payload);

    // If content is rejected or flagged, return a 400 Bad Request.
    if (result.finalDecision === 'REJECT' || result.finalDecision === 'FLAG') {
      return res.status(400).json({
        error: `Content was rejected with decision: ${result.finalDecision}`,
        reasons: result.reasons,
      });
    }

    // If approved, return a 200 OK.
    return res.status(200).json(result);

  } catch (error) {
    console.error('An unexpected error occurred in the moderation route:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}