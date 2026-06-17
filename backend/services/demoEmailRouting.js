const DEMO_EMAIL_DOMAINS = ['promorang.co', 'demo.com', 'promorang.com'];

function normalizeEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (!email) return null;
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  return isValid ? email : null;
}

function isDemoEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  const [, domain] = normalized.split('@');
  return normalized.startsWith('demo.') ||
    normalized.includes('_demo@') ||
    normalized.includes('@demo.') ||
    DEMO_EMAIL_DOMAINS.includes(domain);
}

async function getDemoEmailRecipient(supabase, userEmail) {
  const normalized = normalizeEmail(userEmail);
  if (!supabase || !isDemoEmail(normalized)) return null;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('demo_email_recipient')
      .eq('email', normalized)
      .maybeSingle();

    if (error) {
      console.warn('[DemoEmailRouting] Failed to resolve demo recipient:', error.message);
      return null;
    }

    return normalizeEmail(data?.demo_email_recipient);
  } catch (error) {
    console.warn('[DemoEmailRouting] Failed to resolve demo recipient:', error.message);
    return null;
  }
}

async function resolveEmailRecipient(supabase, email) {
  const override = await getDemoEmailRecipient(supabase, email);
  return override || email;
}

module.exports = {
  normalizeEmail,
  isDemoEmail,
  getDemoEmailRecipient,
  resolveEmailRecipient,
};
