import { Router } from 'express';
import { supabaseAdmin } from '../_core/supabase';
import { handleError, AuthenticatedRequest } from '../_core/apiUtils';
import { requireAuth } from '../_core/auth';

const router = Router();

// Get all content
router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: content, error } = await supabaseAdmin
      .from('content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, content: content || [] });
  } catch (error) {
    handleError(res, error, 'Error fetching content');
  }
});

// Get sponsored content
router.get('/sponsored', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: sponsoredContent, error } = await supabaseAdmin
      .from('content')
      .select('*')
      .eq('is_sponsored', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, content: sponsoredContent || [] });
  } catch (error) {
    handleError(res, error, 'Error fetching sponsored content');
  }
});

export default router;
