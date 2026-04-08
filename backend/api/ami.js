const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// GET /api/ami - List all activation mechanics
// Supports filtering by category, outcome, difficulty
router.get('/', async (req, res) => {
    try {
        const { category, outcome, difficulty, sort } = req.query;

        let query = supabase
            .from('view_ami_v2_ranked')
            .select('*');

        if (category) {
            query = query.eq('category', category);
        }

        if (outcome) {
            query = query.eq('primary_outcome', outcome);
        }

        if (difficulty) {
            query = query.eq('difficulty', difficulty);
        }

        // Default sort by reliability_score descending
        if (sort === 'cost_efficiency') {
            query = query.order('avg_cost_per_action', { ascending: true });
        } else if (sort === 'traffic') {
            // approximate "Traffic" via total_participants for now, 
            // though strictly primary_outcome filter would be better combined with this.
            query = query.order('total_participants', { ascending: false });
        } else {
            query = query.order('reliability_score', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        res.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Error fetching AMI data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch activation mechanics'
        });
    }
});

// GET /api/ami/:id - Get specific mechanic details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('view_ami_v2_ranked')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                error: 'Mechanic not found'
            });
        }

        res.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Error fetching mechanic details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch mechanic details'
        });
    }
});

module.exports = router;
