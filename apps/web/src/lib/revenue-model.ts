export const revenueLines = [
  {
    key: "funded-moments",
    title: "Funded Moments",
    payer: "Brands, agencies, hosts",
    capture: "Published platform fee",
    description: "Promorang earns for configuring, verifying, operating, and reporting a funded activation. Reward funds remain separately committed.",
  },
  {
    key: "operator-plans",
    title: "Operator plans",
    payer: "Merchants and repeat operators",
    capture: "Monthly plan",
    description: "Recurring Moments, templates, placement, loyalty tools, reporting, and priority support create recurring platform revenue.",
  },
  {
    key: "memberships",
    title: "Participant memberships",
    payer: "Optional paid members",
    capture: "$9.99–$49.99 / month",
    description: "Paid standing and higher service limits create subscription revenue; free contribution remains a complete route through the economy.",
  },
  {
    key: "commerce",
    title: "Commerce and bookings",
    payer: "Transacting merchants or buyers",
    capture: "Disclosed at checkout",
    description: "Promorang may earn a transaction or service fee when a real product, booking, ticket, or offer is successfully fulfilled.",
  },
  {
    key: "sponsorships",
    title: "Sponsorship administration",
    payer: "Sponsors",
    capture: "Published platform fee",
    description: "Promorang earns for pool administration, eligibility, verification, issuance, and sponsor reporting. The net reward pool is shown separately.",
  },
  {
    key: "pieces",
    title: "Pieces market",
    payer: "Market participants",
    capture: "1% platform fee",
    description: "When trading is enabled, the atomic settlement model reserves a 1% platform fee, separate from creator and liquidity allocations.",
  },
] as const;

export const moneyBoundaries = [
  { label: "Promorang revenue", detail: "The disclosed platform, subscription, transaction, or service fee Promorang earns." },
  { label: "Committed value", detail: "Reward pools, Gems backing, prizes, or participant payouts reserved for published outcomes." },
  { label: "Operator proceeds", detail: "Merchant, host, creator, or seller proceeds after disclosed fees, refunds, and required reserves." },
] as const;

export const commercialJourney = [
  "Choose a role and paid use case",
  "Configure scope, outcomes, and budget",
  "Review Promorang fee and committed value separately",
  "Authenticate without losing the selected intent",
  "Fund or approve the commercial order",
  "Measure verified outcomes, then renew or scale",
] as const;
