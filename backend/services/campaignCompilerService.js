/**
 * CAMPAIGN COMPILER SERVICE
 * Deterministic, rule-based campaign generation.
 */

const CampaignGoals = {
    CONTENT: {
        drop: "Post your experience",
        moves: ["Try the product", "Record or photograph it", "Post and submit link"],
        proof: "Link",
        reward: 40,
        tier: "A3",
        outcome: {
            volume: "20–50 actions",
            reach: "1K–10K",
            conversionIntent: "Low–Medium"
        }
    },
    PURCHASE: {
        drop: "Complete your order",
        moves: ["Order the product", "Save receipt", "Upload proof"],
        proof: "OCR",
        reward: 70,
        tier: "A3",
        outcome: {
            volume: "5–20 actions",
            reach: "Low",
            conversionIntent: "High"
        }
    },
    REFERRAL: {
        drop: "Refer a friend",
        moves: ["Share referral link", "Friend signs up", "Submit referral proof"],
        proof: "Link",
        reward: 90,
        tier: "A3",
        outcome: {
            volume: "10–30 actions",
            reach: "Expanding",
            conversionIntent: "Medium–High"
        }
    },
    VISIT: {
        drop: "Visit the location",
        moves: ["Go to location", "Take photo", "Upload proof"],
        proof: "Upload",
        reward: 50,
        tier: "A3",
        outcome: {
            volume: "10–25 actions",
            reach: "Local",
            conversionIntent: "Medium"
        }
    }
};

/**
 * Generate a moment name based on input
 */
function generateMomentName(goal, businessName, context) {
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    
    if (context) {
        return `${capitalize(context)} – ${businessName}`;
    }

    switch (goal) {
        case "CONTENT": return `Share Your Experience – ${businessName}`;
        case "PURCHASE": return `Order Now – ${businessName}`;
        case "REFERRAL": return `Invite & Earn – ${businessName}`;
        case "VISIT": return `Visit & Snap – ${businessName}`;
        default: return `${businessName} Campaign`;
    }
}

/**
 * Compile a campaign from raw inputs
 */
function compile(goal, businessName, context) {
    const config = CampaignGoals[goal];
    if (!config) throw new Error(`Invalid goal: ${goal}`);

    const name = generateMomentName(goal, businessName, context);
    const description = `${config.drop}\n\nSteps:\n1. ${config.moves[0]}\n2. ${config.moves[1]}\n3. ${config.moves[2]}\n\nProof: ${config.proof}`;

    return {
        moment: {
            name,
            description,
            tier: config.tier
        },
        drop: config.drop,
        moves: config.moves,
        proof: config.proof,
        reward: {
            baseGems: config.reward
        },
        outcome: config.outcome,
        compiler_metadata: {
            goal,
            businessName,
            context,
            generatedAt: new Date().toISOString()
        }
    };
}

module.exports = {
    compile,
    CampaignGoals
};
