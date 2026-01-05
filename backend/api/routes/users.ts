import { Router } from 'express';
import { supabaseAdmin } from '../_core/supabase';
import { handleError, AuthenticatedRequest } from '../_core/apiUtils';
import { requireAuth } from '../_core/auth';

const router = Router();

// Get current user profile
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    handleError(res, error, 'Error fetching user profile');
  }
});

// Get user wallets
router.get('/me/wallets', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { data: wallets, error } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) throw error;

    res.json({ success: true, wallets: wallets || [] });
  } catch (error) {
    handleError(res, error, 'Error fetching user wallets');
  }
});

export default router;
