import { Router } from 'express';
import { supabaseAdmin } from '../_core/supabase';
import { handleError, AuthenticatedRequest } from '../_core/apiUtils';
import { requireAuth } from '../_core/auth';

const router = Router();

// Get all drops
router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const { data: drops, error } = await supabaseAdmin
      .from('drops')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (error) throw error;

    res.json(drops || []);
  } catch (error) {
    handleError(res, error, 'Error fetching drops');
  }
});

export default router;
