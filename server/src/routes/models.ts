import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { BASELINE_MODEL_METADATA } from '../ml/inferenceEngine';

const router = Router();

/**
 * @route GET /api/models/metadata
 * @desc Returns metadata and metrics for the currently loaded ML intrusion detection model
 * @access Private
 */
router.get('/metadata', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({
      success: true,
      metadata: BASELINE_MODEL_METADATA,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch model metadata' });
  }
});

export default router;
