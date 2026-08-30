export type ActionUnlockReceiptModel = {
  heading: string;
  proved: string;
  unlocked: string;
  next: string;
  nextHref: string;
  nextLabel: string;
};

export type ActionUnlockReceiptInput = {
  action: "check_in" | "join" | "proof" | "claim";
  momentName?: string;
  perk?: string;
};

export function buildActionUnlockReceipt(
  input: ActionUnlockReceiptInput,
  copy: {
    checkInHeading: string;
    checkInProved: string;
    checkInUnlocked: string;
    checkInNext: string;
    checkInCta: string;
  },
): ActionUnlockReceiptModel {
  const name = input.momentName ? ` · ${input.momentName}` : "";
  return {
    heading: `${copy.checkInHeading}${name}`,
    proved: copy.checkInProved,
    unlocked: input.perk || copy.checkInUnlocked,
    next: copy.checkInNext,
    nextHref: "/vault",
    nextLabel: copy.checkInCta,
  };
}
