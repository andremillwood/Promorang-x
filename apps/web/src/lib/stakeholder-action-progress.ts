export type StakeholderProgressFacts = {
  evidenceMatchesRole: boolean;
  suppliesInventory: boolean;
  perksGiven: number;
  cardPerks: number;
  verifiedActions: number;
};

export function completedStakeholderActionIds(role: string, facts: StakeholderProgressFacts) {
  if (!facts.evidenceMatchesRole) return [];

  switch (role) {
    case "merchant":
      return [
        facts.suppliesInventory ? "put-perk-up" : null,
        facts.perksGiven > 0 ? "share-perk" : null,
        facts.verifiedActions > 0 ? "validate" : null,
      ].filter((id): id is string => Boolean(id));
    case "creator":
      return [
        facts.perksGiven > 0 ? "attach-perk" : null,
        facts.cardPerks > 0 ? "take-perk" : null,
      ].filter((id): id is string => Boolean(id));
    case "host":
      return [
        facts.perksGiven > 0 ? "attach-perk" : null,
        facts.verifiedActions > 0 ? "validate" : null,
      ].filter((id): id is string => Boolean(id));
    case "brand":
      return [
        facts.suppliesInventory ? "fund-perk" : null,
        facts.verifiedActions > 0 ? "watch-attributed" : null,
      ].filter((id): id is string => Boolean(id));
    default:
      return [];
  }
}
