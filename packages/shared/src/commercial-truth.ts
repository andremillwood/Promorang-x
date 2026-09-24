export const ACTIVATION_RESOURCE_TYPES = [
  "money",
  "inventory",
  "distribution",
  "media",
  "service",
  "access",
  "audience",
  "reward",
] as const;

export type ActivationResourceType = (typeof ACTIVATION_RESOURCE_TYPES)[number];

export const INVENTORY_ALLOCATION_TYPES = [
  "sellable",
  "free",
  "discount",
  "bogo",
  "bundle",
  "perk",
  "distributor",
  "brand",
  "reward",
  "access",
] as const;

export type InventoryAllocationType = (typeof INVENTORY_ALLOCATION_TYPES)[number];

export type InventoryAllocation = {
  id: string;
  ownerId: string;
  type: InventoryAllocationType;
  quantity: number | null;
  reservedQuantity: number;
  fulfilledQuantity: number;
  unlimited?: boolean;
  referenceAmount?: number | null;
  currency?: string | null;
};

export type InventoryAvailability = {
  availableQuantity: number | null;
  reservedQuantity: number;
  fulfilledQuantity: number;
  isUnlimited: boolean;
};

function nonNegative(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`${field} cannot be negative`);
}

export function inventoryAvailability(allocation: InventoryAllocation): InventoryAvailability {
  nonNegative(allocation.reservedQuantity, "Reserved quantity");
  nonNegative(allocation.fulfilledQuantity, "Fulfilled quantity");

  if (allocation.unlimited) {
    return {
      availableQuantity: null,
      reservedQuantity: allocation.reservedQuantity,
      fulfilledQuantity: allocation.fulfilledQuantity,
      isUnlimited: true,
    };
  }

  if (allocation.quantity == null) throw new Error("Finite inventory needs a quantity");
  nonNegative(allocation.quantity, "Quantity");
  const committed = allocation.reservedQuantity + allocation.fulfilledQuantity;
  if (committed > allocation.quantity) throw new Error("Inventory cannot be over-allocated");

  return {
    availableQuantity: allocation.quantity - committed,
    reservedQuantity: allocation.reservedQuantity,
    fulfilledQuantity: allocation.fulfilledQuantity,
    isUnlimited: false,
  };
}

export type CommercialAmount = { amount: number; currency: string };

export type ActivationEconomics = {
  moneyIn: CommercialAmount;
  platformRevenue: CommercialAmount;
  participantValue: CommercialAmount;
  distributionCost: CommercialAmount;
  serviceProviderCost: CommercialAmount;
  operatorProceeds: CommercialAmount;
  reservedAmount: CommercialAmount;
  earnedAmount: CommercialAmount;
  paidAmount: CommercialAmount;
  refundedAmount: CommercialAmount;
};

export function validateActivationEconomics(economics: ActivationEconomics) {
  const amounts = Object.values(economics);
  const currencies = new Set(amounts.map((item) => item.currency.toUpperCase()));
  if (currencies.size !== 1) throw new Error("Economics must be reconciled one currency at a time");
  for (const item of amounts) nonNegative(item.amount, "Commercial amount");
  if (economics.paidAmount.amount > economics.earnedAmount.amount) {
    throw new Error("Paid amount cannot exceed earned amount");
  }
  if (economics.earnedAmount.amount > economics.reservedAmount.amount) {
    throw new Error("Earned amount cannot exceed reserved amount");
  }
  if (economics.refundedAmount.amount + economics.paidAmount.amount > economics.reservedAmount.amount) {
    throw new Error("Paid and refunded amounts cannot exceed the reserve");
  }
  return true;
}

export const EVIDENCE_LEVELS = [
  "view",
  "vote",
  "want",
  "share",
  "rsvp",
  "reservation",
  "purchase",
  "attendance",
  "redemption",
  "repeat_purchase",
] as const;

export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

export function isEvidenceAtLeast(actual: EvidenceLevel, required: EvidenceLevel) {
  return EVIDENCE_LEVELS.indexOf(actual) >= EVIDENCE_LEVELS.indexOf(required);
}

export type EarningRule = {
  funded: boolean;
  requiredEvidence: EvidenceLevel;
  amount: number;
  currency: string;
};

export function canCreateEarning(rule: EarningRule | null | undefined, evidence: EvidenceLevel) {
  return Boolean(
    rule
      && rule.funded
      && rule.amount > 0
      && rule.currency.trim()
      && isEvidenceAtLeast(evidence, rule.requiredEvidence),
  );
}
