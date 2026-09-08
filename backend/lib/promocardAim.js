// Keep keyword lists aligned with packages/shared/src/promocard-aim.ts

const AIMS = {
  'kingston-after-dark': {
    id: 'kingston-after-dark',
    label: 'Kingston After Dark',
    keywords: ['after dark', 'after-dark', 'nightlife', 'cocktail', 'cocktails', 'bar', 'club', 'tab', 'music', 'dancehall', 'wednesday'],
  },
  barbican: {
    id: 'barbican',
    label: 'Barbican',
    keywords: ['barbican', 'jerk', 'platter', 'sea deck', 'restaurant', 'food'],
  },
  food: {
    id: 'food',
    label: 'Food',
    keywords: ['food', 'jerk', 'platter', 'taste', 'tasting', 'restaurant', 'eat', 'cook', 'grocer'],
  },
  tonight: {
    id: 'tonight',
    label: 'Tonight',
    keywords: ['tonight', 'after dark', 'nightlife', 'evening', 'cocktail', 'tab', 'live'],
  },
};

function resolvePromoCardAim(value) {
  const key = String(value || '').trim().toLowerCase().replace(/[\s_]+/g, '-');
  return AIMS[key] || null;
}

function inferPromoCardAimFromText(value) {
  const raw = String(value || '');
  const tagged = raw.match(/aim:([a-z0-9-]+)/i);
  if (tagged) return resolvePromoCardAim(tagged[1]);
  return resolvePromoCardAim(raw);
}

function aimScore(aim, benefit) {
  const hay = [benefit?.title, benefit?.detail, benefit?.locationLabel, benefit?.issuer?.name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (!aim || !hay) return 0;
  return aim.keywords.reduce((score, keyword) => score + (hay.includes(keyword) ? 1 : 0), 0);
}

function sortBenefitsByAim(benefits, aim) {
  if (!aim) return benefits || [];
  return [...(benefits || [])].sort((left, right) => aimScore(aim, right) - aimScore(aim, left));
}

module.exports = {
  AIMS,
  resolvePromoCardAim,
  inferPromoCardAimFromText,
  aimScore,
  sortBenefitsByAim,
};
