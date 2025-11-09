/**
 * Email notification service for coupon assignments
 * Sends emails when users earn coupons
 */

const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send coupon earned notification email
 */
async function sendCouponEarnedEmail(userEmail, userName, couponData) {
  const { title, description, value, value_unit, source_label, expires_at } = couponData;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You Earned a Reward!</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          background: #f7fafc;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .reward-card {
          background: white;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .reward-value {
          font-size: 32px;
          font-weight: bold;
          color: #667eea;
          margin: 10px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #718096;
          font-size: 14px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
        .meta-info {
          background: #edf2f7;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎁 You Earned a Reward!</h1>
      </div>
      
      <div class="content">
        <p>Hi ${userName || 'there'},</p>
        
        <p>Congratulations! You've earned a new reward on Promorang:</p>
        
        <div class="reward-card">
          <h2 style="margin-top: 0; color: #2d3748;">${title}</h2>
          ${description ? `<p style="color: #4a5568;">${description}</p>` : ''}
          
          <div class="reward-value">
            ${value}${value_unit === 'percentage' ? '%' : ' ' + value_unit} ${value_unit === 'percentage' ? 'OFF' : ''}
          </div>
          
          <div class="meta-info">
            <strong>How you earned it:</strong> ${source_label}<br>
            <strong>Expires:</strong> ${new Date(expires_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        
        <p>Ready to claim your reward?</p>
        
        <center>
          <a href="${process.env.FRONTEND_URL || 'https://promorang.co'}/rewards" class="cta-button">
            View & Redeem Reward
          </a>
        </center>
        
        <p style="margin-top: 30px; color: #4a5568; font-size: 14px;">
          <strong>💡 Pro Tip:</strong> Check your Rewards tab regularly to discover new opportunities to earn exclusive perks!
        </p>
      </div>
      
      <div class="footer">
        <p>This email was sent by Promorang</p>
        <p>
          <a href="${process.env.FRONTEND_URL || 'https://promorang.co'}/rewards" style="color: #667eea;">View All Rewards</a> | 
          <a href="${process.env.FRONTEND_URL || 'https://promorang.co'}/settings" style="color: #667eea;">Email Preferences</a>
        </p>
      </div>
    </body>
    </html>
  `;

  const emailText = `
    You Earned a Reward!
    
    Hi ${userName || 'there'},
    
    Congratulations! You've earned a new reward on Promorang:
    
    ${title}
    ${description || ''}
    
    Reward Value: ${value}${value_unit === 'percentage' ? '%' : ' ' + value_unit}
    How you earned it: ${source_label}
    Expires: ${new Date(expires_at).toLocaleDateString()}
    
    View and redeem your reward at: ${process.env.FRONTEND_URL || 'https://promorang.co'}/rewards
    
    ---
    This email was sent by Promorang
  `;

  const mailOptions = {
    from: `"Promorang Rewards" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `🎁 You Earned: ${title}`,
    text: emailText,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Coupon email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending coupon email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send weekly rewards digest email
 */
async function sendWeeklyRewardsDigest(userEmail, userName, stats) {
  const { earned_this_week, available_count, expiring_soon } = stats;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Weekly Rewards Summary</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #f5576c;
        }
        .stat-label {
          font-size: 14px;
          color: #718096;
          margin-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Your Weekly Rewards Summary</h1>
      </div>
      
      <div style="background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px;">
        <p>Hi ${userName},</p>
        
        <p>Here's your rewards activity for this week:</p>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${earned_this_week}</div>
            <div class="stat-label">Earned This Week</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${available_count}</div>
            <div class="stat-label">Available</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${expiring_soon}</div>
            <div class="stat-label">Expiring Soon</div>
          </div>
        </div>
        
        ${expiring_soon > 0 ? `
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <strong>⚠️ Action Required:</strong> You have ${expiring_soon} reward${expiring_soon > 1 ? 's' : ''} expiring soon. Don't miss out!
          </div>
        ` : ''}
        
        <center>
          <a href="${process.env.FRONTEND_URL || 'https://promorang.co'}/rewards" 
             style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
            View All Rewards
          </a>
        </center>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Promorang Rewards" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `📊 Your Weekly Rewards Summary - ${earned_this_week} New Rewards!`,
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Weekly digest email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending weekly digest:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendCouponEarnedEmail,
  sendWeeklyRewardsDigest,
};
