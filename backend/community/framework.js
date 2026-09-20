// Adapted from the two supplied Promorang community frameworks.
// Schedules are programming templates, not claims that sessions are booked.
const paths = ['TikTok Content Creator', 'YouTube Creator', 'Musician (Artiste)', 'Community Leader',
  'Creative Service Provider', 'Marketer', 'Events Coordinator', 'Events Promoter',
  'Ecommerce Coordinator', 'Affiliate Marketer', 'Automation Solutionist'];

const pods = [
  { id: 'general', name: 'General Room', focus: 'Meet the community. Share a goal, a question, or a win.' },
  { id: 'creators', name: 'Content Creators', focus: 'Share drafts, make things together, and exchange useful feedback.' },
  { id: 'challenges', name: 'Challenge Masters', focus: 'Design useful challenges and help each other finish.' },
  { id: 'referrals', name: 'Referral Experts', focus: 'Bring people in and help them find their first real win.' },
  { id: 'leaders', name: 'Community Leaders', focus: 'Mentor members and organize what happens next.' },
];

const daily = [
  ['09:00', '10:00', 'Morning Motivation', 'Share the one thing you want to move forward today.'],
  ['10:00', '12:00', 'Platform Tips & Tricks', 'Teach one useful way to get more from Promorang.'],
  ['12:00', '13:00', 'Community Polls & Feedback', 'Tell the community what is working and what needs attention.'],
  ['13:00', '14:00', 'Lunch & Learn', 'Pick up a skill and share one thing you will put to use.'],
  ['14:00', '15:00', 'Content Highlights', 'Give someone’s work a thoughtful big up.'],
  ['15:00', '16:00', 'Referral Strategies', 'Help the next person find their first useful move.'],
  ['16:00', '17:00', 'End-of-Day Reflection', 'Keep a win, ask for help, and choose tomorrow’s move.'],
].map(([start, end, title, prompt]) => ({ start, end, title, prompt }));

const weeks = [
  { week: 1, title: 'Find your feet', sourceTitle: 'Welcome & Onboarding', sessions: [
    ['Monday', 'super', 'Onboarding Webinar'], ['Tuesday', 'super', 'Discovery Webinar'],
    ['Thursday', 'super', 'Strategy Session'], ['Tuesday', 'premium', 'Onboarding Webinar'],
    ['Thursday', 'premium', 'Training Session'], ['Wednesday', 'free', 'Onboarding Webinar'],
  ], hostNotes: 'Welcome people personally. Share the takeaways and a useful first move.' },
  { week: 2, title: 'Build your edge', sourceTitle: 'Skills Development & Engagement', sessions: [
    ['Tuesday', 'super', 'Advanced Skills, AI & Automation'], ['Thursday', 'super', 'Careers & Certifications'],
    ['Friday', 'super', 'Social Growth Portfolio Workshop'], ['Wednesday', 'premium', 'DM Management & Sales Funnels'],
    ['Thursday', 'premium', 'Creator Content Session'], ['Wednesday', 'free', 'Tasks & Commissions Training'],
  ], hostNotes: 'Offer useful practice. Make recordings available for people who cannot attend live.' },
  { week: 3, title: 'Make it happen together', sourceTitle: 'Community Activation & Networking', sessions: [
    ['Tuesday', 'super', 'Growth Presentations'], ['Thursday', 'super', 'Creator & Business Networking'],
    ['Friday', 'super', 'Awards & Recognition'], ['Wednesday', 'premium', 'Creator Content Session'],
    ['Friday', 'premium', 'Creator & Business Networking'], ['Wednesday', 'free', 'Academy Careers Session'],
    ['Thursday', 'free', 'Engagement Task Challenge'],
  ], hostNotes: 'Recognize real achievements and leave room for small-group conversations.' },
  { week: 4, title: 'Keep the wins moving', sourceTitle: 'Review & Growth Planning', sessions: [
    ['Monday', 'all', 'Town Hall Update'], ['Wednesday', 'all', 'Promorang Growth Hub'],
    ['Friday', 'all', 'Featured Creator Interview & Q&A'], ['Thursday', 'super', 'Franchise Review & Rewards'],
    ['Friday', 'super', 'Next Month’s Growth Strategy'],
  ], hostNotes: 'Use actual results, collect feedback, and let members help plan the next round.' },
].map(w => ({ ...w, sessions: w.sessions.map(([day, tier, title]) => ({ day, tier, title })) }));

const roles = [
  { id: 'ambassador', name: 'Community Ambassador', kind: 'onboarding', tiers: ['premium', 'super'],
    purpose: 'Welcome new people and help them reach a first win.', proof: 'Accepted onboarding help and useful introductions.',
    privileges: ['Ambassador badge', 'Role room', 'Strategy resources', 'Early feature briefings'] },
  { id: 'creator', name: 'Content Creator', kind: 'content', tiers: ['free', 'premium', 'super'],
    purpose: 'Make content people can learn from, share, and use.', proof: 'Original content accepted against a clear brief.',
    privileges: ['Creator badge', 'Role room', 'Creator resources', 'Eligible for community spotlights'] },
  { id: 'coordinator', name: 'Event Coordinator', kind: 'session', tiers: ['premium', 'super'],
    purpose: 'Bring people together for workshops, conversations, and experiences.', proof: 'Delivered sessions with a recap and member feedback.',
    privileges: ['Coordinator badge', 'Role room', 'Session resources', 'Eligible to co-host sessions'] },
  { id: 'growth', name: 'Growth Champion', kind: 'distribution', tiers: ['free', 'premium', 'super'],
    purpose: 'Get useful work seen and help the right people take part.', proof: 'Evidence of distribution and the resulting useful actions.',
    privileges: ['Growth badge', 'Role room', 'Growth resources', 'Strategy session eligibility'] },
  { id: 'taskmaster', name: 'Task Master', kind: 'operations', tiers: ['free', 'premium', 'super'],
    purpose: 'Turn a community need into a clear, worthwhile move.', proof: 'Delivered operations work and usable task designs.',
    privileges: ['Task Master badge', 'Role room', 'Operations resources', 'Move design recognition'] },
  { id: 'mentor', name: 'Mentor', kind: 'mentoring', tiers: ['premium', 'super'],
    purpose: 'Help another member build skill, confidence, and independence.', proof: 'Mentoring recap with evidence of the member’s next step.',
    privileges: ['Mentor badge', 'Role room', 'Mentor resources', 'Mentor session eligibility'] },
].map(r => ({ ...r, termDays: 90, reviewDays: 30, graceDays: 7, minPoints: 60, minMoves: 2 }));

const ongoing = [
  { title: 'Weekly Newsletter', kind: 'content', purpose: 'Recap useful moments, member wins, and upcoming opportunities.' },
  { title: 'Big Ups', kind: 'feedback', purpose: 'Recognize a useful contribution with a specific, public thank you.' },
  { title: 'PromoShare Club', kind: 'distribution', purpose: 'Coordinate useful distribution through existing PromoShare opportunities.' },
  { title: 'Resource Library', kind: 'operations', purpose: 'Keep guides, tools, and session recordings available by community tier.' },
  { title: 'Monthly Task Challenge', kind: 'operations', purpose: 'Connect this month’s moves to shared goals and funded rewards.' },
  { title: 'Super User Campaigns', kind: 'distribution', purpose: 'Bring advanced tools and networks to a funded community brief.' },
  { title: 'Feedback Loop', kind: 'feedback', purpose: 'Ask what changed after each session and use it in the next plan.' },
  { title: 'Cross-Tier Preview', kind: 'session', purpose: 'Publish a selected advanced session for every approved member to try.' },
];

module.exports = { paths, pods, daily, weeks, roles, ongoing,
  kinds: ['content', 'distribution', 'onboarding', 'mentoring', 'session', 'operations', 'feedback'],
  tiers: ['free', 'premium', 'super'],
  timezone: 'America/Jamaica',
};
