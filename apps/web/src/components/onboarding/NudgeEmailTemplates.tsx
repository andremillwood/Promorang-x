/**
 * Nudge Email Templates
 * Templates for onboarding reminder emails
 */

export interface NudgeEmailData {
  to: string;
  userName: string;
  nudgeType: 'profile_incomplete' | 'no_moments_joined' | 'no_checkin' | 'no_following' | 'abandoned';
  ctaUrl: string;
}

export function getNudgeSubject(type: NudgeEmailData['nudgeType']): string {
  const subjects: Record<NudgeEmailData['nudgeType'], string> = {
    profile_incomplete: "👋 Complete your Promorang profile",
    no_moments_joined: "🔥 Discover moments happening near you",
    no_checkin: "✅ Don't forget to check in to your moment",
    no_following: "👥 Connect with creators on Promorang",
    abandoned: "We miss you! Come back to Promorang"
  };
  return subjects[type];
}

export function getNudgeContent(data: NudgeEmailData): { title: string; body: string; cta: string } {
  const templates: Record<NudgeEmailData['nudgeType'], { title: string; body: string; cta: string }> = {
    profile_incomplete: {
      title: "Let's make you stand out",
      body: `Hi ${data.userName},<br><br>
        You're almost there! Complete your profile with a photo and display name so others can recognize you at moments.`,
      cta: "Complete Profile"
    },
    no_moments_joined: {
      title: "Your city is buzzing",
      body: `Hi ${data.userName},<br><br>
        There are moments happening near you this week. From workshops to socials, find something that sparks your interest.`,
      cta: "Browse Moments"
    },
    no_checkin: {
      title: "Did you make it?",
      body: `Hi ${data.userName},<br><br>
        You joined a moment - awesome! Don't forget to check in when you arrive to earn points and unlock rewards.`,
      cta: "Check In Now"
    },
    no_following: {
      title: "Build your circle",
      body: `Hi ${data.userName},<br><br>
        Following creators and hosts helps you stay updated on their latest moments. Start building your personal feed.`,
      cta: "Find People"
    },
    abandoned: {
      title: "We miss you",
      body: `Hi ${data.userName},<br><br>
        It's been a while since your last moment. New experiences are being added every day - come see what you're missing!`,
      cta: "Discover Moments"
    }
  };

  return templates[data.nudgeType];
}

export function generateNudgeEmailHTML(data: NudgeEmailData): string {
  const content = getNudgeContent(data);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${getNudgeSubject(data.nudgeType)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #FDFCF9; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #FF6B00 0%, #FF9500 50%, #FFCC1A 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; margin: 0; font-weight: 600; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1F1F1F; font-size: 20px; margin: 0 0 20px 0; }
    .content p { color: #3D3D3D; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; }
    .button { display: inline-block; background: #FF6B00; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; }
    .button:hover { background: #E55A00; }
    .footer { padding: 30px; text-align: center; background: #F5F0E8; }
    .footer p { color: #706C65; font-size: 14px; margin: 0; }
    .footer a { color: #FF6B00; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Promorang</h1>
    </div>
    <div class="content">
      <h2>${content.title}</h2>
      <p>${content.body}</p>
      <a href="${data.ctaUrl}" class="button">${content.cta}</a>
    </div>
    <div class="footer">
      <p>You're receiving this because you signed up for Promorang.<br>
      <a href="https://promorang.co/unsubscribe">Unsubscribe</a> | 
      <a href="https://promorang.co/privacy">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>
  `;
}
