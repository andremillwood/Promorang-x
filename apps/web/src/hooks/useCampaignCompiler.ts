import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import type { DemandPlan } from "@promorang/shared";

// --- CORE INTERFACES ---
export type CampaignType = "CONTENT" | "PURCHASE" | "REFERRAL" | "VISIT";
export type ProofType = "LINK" | "OCR" | "UPLOAD";

export interface NormalizedIntent {
  primaryAction: CampaignType;
  cleanedInput: string;
}

export interface Outcome {
  volume: string;
  reach: string;
  conversionIntent: string;
}

export interface CompiledCampaign {
  moment: {
    name: string;
    description: string;
    tier: string;
  };
  drop: string;
  moves: string[];
  proof: ProofType;
  verificationType: ProofType;
  reward: {
    baseGems: number;
    bonus?: string; // V1 constraints omit dynamic bonuses, kept for schema compliance
  };
  outcome: Outcome;
}

export interface CompilerMetadata {
  type: CampaignType;
  normalizedIntent: NormalizedIntent;
  generatedAt: string;
  demandPlan?: DemandPlan;
}

export function useCampaignCompiler() {
  const [isCompiling, setIsCompiling] = useState(false);

  // 1. INPUT NORMALIZATION LAYER
  function normalizeIntent(input: string): NormalizedIntent {
    const i = input.toLowerCase();
    let primaryAction: CampaignType = "CONTENT"; // Default fallback
    
    // Priority: CONTENT > PURCHASE > REFERRAL > VISIT
    if (i.includes("post") || i.includes("share") || i.includes("video") || i.includes("reaction")) {
      primaryAction = "CONTENT";
    } else if (i.includes("buy") || i.includes("order") || i.includes("purchase")) {
      primaryAction = "PURCHASE";
    } else if (i.includes("invite") || i.includes("refer")) {
      primaryAction = "REFERRAL";
    } else if (i.includes("come") || i.includes("attend") || i.includes("visit")) {
      primaryAction = "VISIT";
    }

    return {
      primaryAction,
      cleanedInput: input.trim()
    };
  }

  // 2. CLASSIFICATION LAYER
  function classifyIntent(intent: NormalizedIntent): CampaignType {
    return intent.primaryAction;
  }

  // 3. COMPILATION LAYER
  function compileInitialDraft(intent: NormalizedIntent, type: CampaignType): CompiledCampaign {
    // Generates the raw unchecked structure
    let momentName = "Action";
    let dropTask = "Complete task";
    let rawMoves: string[] = ["Execute action", "Submit proof"];
    
    switch (type) {
      case "CONTENT":
        momentName = "Content Post";
        dropTask = "Post a video or photo and share it";
        rawMoves = ["Experience the product", "Record the experience", "Share on social media", "Submit link"];
        break;
      case "PURCHASE":
        momentName = "Purchase Verification";
        dropTask = "Buy the item and verify receipt";
        rawMoves = ["Go to store", "Make purchase", "Upload receipt", "Wait for approval"];
        break;
      case "REFERRAL":
        momentName = "Invite Friends";
        dropTask = "Get a friend to join";
        rawMoves = ["Copy invite link", "Send to friend", "Friend signs up"];
        break;
      case "VISIT":
        momentName = "Store Visit";
        dropTask = "Check in physically at location";
        rawMoves = ["Travel to location", "Check in physically"];
        break;
    }

    return {
      moment: {
        name: momentName,
        description: `Drive ${type.toLowerCase()} behavior.`,
        tier: "A3" // Default before enforcement
      },
      drop: dropTask,
      moves: rawMoves,
      proof: "LINK", // Placeholder
      verificationType: "LINK",
      reward: { baseGems: 10 }, // Placeholder
      outcome: { volume: "", reach: "", conversionIntent: "" }
    };
  }

  // 4. ENFORCEMENT LAYER (CRITICAL)
  function enforceConstraints(campaign: CompiledCampaign, type: CampaignType, intent: NormalizedIntent): CompiledCampaign {
    const enforced = { ...campaign };
    
    // A. Drop Constraint: Must be 1 executable task
    if (type === "CONTENT") enforced.drop = "Record and post your experience";
    if (type === "PURCHASE") enforced.drop = "Purchase item and verify receipt";
    if (type === "REFERRAL") enforced.drop = "Refer exactly one active user";
    if (type === "VISIT") enforced.drop = "Check-in at the physical location";

    // B. Moves Constraint: Max 3 steps, <= 8 words each
    enforced.moves = enforced.moves.slice(0, 3).map(move => {
      const words = move.split(" ");
      return words.length > 8 ? words.slice(0, 8).join(" ") : move;
    });

    // C. Proof Mapping (FORCED)
    const proofMap: Record<CampaignType, ProofType> = {
      CONTENT: "LINK",
      PURCHASE: "OCR",
      VISIT: "UPLOAD",
      REFERRAL: "LINK"
    };
    enforced.proof = proofMap[type];
    enforced.verificationType = proofMap[type]; // Directly maps to aiVerificationService.js

    // D. Reward Normalization
    const rewardMap: Record<CampaignType, number> = {
      CONTENT: 40,
      PURCHASE: 70,
      REFERRAL: 90,
      VISIT: 50
    };
    enforced.reward = { baseGems: rewardMap[type] }; // No dynamic bonuses in V1

    // E. Naming Constraint ([Action Phrase] + [Business Context])
    // Synthesize simple context from input or use default fallback
    const extractContext = () => {
      const input = intent.cleanedInput;
      if (input.includes("wings")) return "Wings";
      if (input.includes("coffee")) return "Coffee";
      return "Store Selection";
    };
    
    const context = extractContext();
    const actionPhraseMap: Record<CampaignType, string> = {
      CONTENT: "Social Reaction",
      PURCHASE: "Verified Buy",
      REFERRAL: "Community Referral",
      VISIT: "Location Visit"
    };
    
    enforced.moment.name = `${actionPhraseMap[type]} – ${context}`;
    
    return enforced;
  }

  // 5. OUTCOME ESTIMATION LAYER
  function estimateOutcome(type: CampaignType): Outcome {
    switch (type) {
      case "CONTENT":
        return { volume: "20–50 actions", reach: "1K–10K", conversionIntent: "Low–Medium" };
      case "PURCHASE":
        return { volume: "5–20 actions", reach: "Low", conversionIntent: "High" };
      case "REFERRAL":
        return { volume: "10–30 actions", reach: "Expanding", conversionIntent: "Medium–High" };
      case "VISIT":
        return { volume: "10–25 actions", reach: "Local", conversionIntent: "Medium" };
    }
  }

  // 6. PIPELINE ORCHESTRATOR
  const compile = async (
    prompt: string
  ): Promise<{ campaign: CompiledCampaign; metadata: CompilerMetadata }> => {
    setIsCompiling(true);

    try {
      const response = await fetch(`${API_BASE_URL}/demand-plans/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statement: prompt }),
      });

      if (response.ok) {
        const payload = await response.json() as { plan: DemandPlan };
        const demandPlan = payload.plan;
        const requiredAction = demandPlan.experience.actions.find((action) => action.required) || demandPlan.experience.actions[0];
        const proofMap: Record<string, ProofType> = { link: "LINK", api: "LINK", receipt: "OCR", photo: "UPLOAD", qr: "UPLOAD", check_in: "UPLOAD", human_review: "UPLOAD" };
        const typeMap: Record<string, CampaignType> = { create_content: "CONTENT", drive_sales: "PURCHASE", grow_referrals: "REFERRAL", bring_people: "VISIT", build_loyalty: "VISIT", mobilize_community: "VISIT" };
        const type = typeMap[demandPlan.intent.goal] || "VISIT";
        const proof = proofMap[requiredAction?.proof || "link"] || "LINK";
        const gemValue = demandPlan.sharedValue.find((value) => value.type === "gems")?.amount || 0;

        return {
          campaign: {
            moment: { name: demandPlan.title, description: demandPlan.promise, tier: "A3" },
            drop: requiredAction?.label || demandPlan.experience.invitation,
            moves: demandPlan.experience.actions.filter((action) => action.type !== "discover").slice(0, 3).map((action) => action.label),
            proof,
            verificationType: proof,
            reward: { baseGems: gemValue },
            outcome: {
              volume: demandPlan.measurement.forecast.expected ? `${demandPlan.measurement.forecast.low}–${demandPlan.measurement.forecast.high} ${demandPlan.measurement.forecast.unit}` : "Set a target to forecast",
              reach: "Planned across Pulse and selected channels",
              conversionIntent: demandPlan.measurement.primaryOutcome,
            },
          },
          metadata: { type, normalizedIntent: { primaryAction: type, cleanedInput: prompt.trim() }, generatedAt: demandPlan.generatedAt, demandPlan },
        };
      }
    } catch {
      // Continue with the deterministic local compiler when the API is unavailable.
    }

    // Offline-safe deterministic fallback.
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Pipeline Execution
    const normalizedIntent = normalizeIntent(prompt);
    const classification = classifyIntent(normalizedIntent);
    const draft = compileInitialDraft(normalizedIntent, classification);
    const enforcedCampaign = enforceConstraints(draft, classification, normalizedIntent);
    enforcedCampaign.outcome = estimateOutcome(classification);

    const compilerMetadata: CompilerMetadata = {
      type: classification,
      normalizedIntent: normalizedIntent,
      generatedAt: new Date().toISOString(),
    };

    return { campaign: enforcedCampaign, metadata: compilerMetadata };
  };

  const compileWithState = async (prompt: string) => {
    setIsCompiling(true);
    try {
      return await compile(prompt);
    } finally {
      setIsCompiling(false);
    }
  };

  return { compile: compileWithState, isCompiling };
}
