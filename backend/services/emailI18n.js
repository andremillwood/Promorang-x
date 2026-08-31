/**
 * Email Internationalization (i18n) Engine for Promorang Backend Resend Notifications
 * Supported Locales: 'en', 'es-419', 'pt-BR'
 */

const SUPPORTED_LOCALES = ['en', 'es-419', 'pt-BR'];
const DEFAULT_LOCALE = 'en';

/**
 * Normalizes a raw locale string to a supported locale
 * @param {string} [locale]
 * @returns {'en' | 'es-419' | 'pt-BR'}
 */
function normalizeEmailLocale(locale) {
  if (!locale || typeof locale !== 'string') return DEFAULT_LOCALE;
  const lower = locale.toLowerCase().trim();
  if (lower.startsWith('es')) return 'es-419';
  if (lower.startsWith('pt')) return 'pt-BR';
  return 'en';
}

/**
 * Appends localized prefix to a URL path if not default english
 * @param {string} path - URL path e.g. '/dashboard'
 * @param {string} [locale]
 * @param {string} [baseUrl]
 * @returns {string}
 */
function getLocalizedEmailUrl(path, locale, baseUrl = 'https://promorang.co') {
  const norm = normalizeEmailLocale(locale);
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (norm === 'en') {
    return `${cleanBase}${cleanPath}`;
  }
  return `${cleanBase}/${norm}${cleanPath}`;
}

const EMAIL_TRANSLATIONS = {
  en: {
    welcome: {
      subject: 'Welcome to Promorang — Your rewards journey begins',
      title: 'Welcome to Promorang',
      preheader: 'Your journey to earning rewards starts now.',
      greeting: 'Hi {{name}},',
      intro: "Welcome to <strong>Promorang</strong> — where your engagement becomes real rewards. We're thrilled to have you join our community of creators, influencers, and reward-earners.",
      bonusLabel: 'Welcome Bonus',
      bonusValue: '100 Points + 10 Keys',
      bonusSublabel: 'Already credited to your account',
      sectionTitle: 'What you can do',
      features: [
        'Complete Drops to earn Gems and unlock opportunities',
        'Invest in content you believe in and share in the success',
        'Build daily streaks for compounding bonus rewards',
        'Grow your network and earn from every referral'
      ],
      readyPrompt: 'Ready to start earning? Your dashboard awaits.',
      ctaText: 'Enter Dashboard',
      footerNote: 'Complete your first Drop within 24 hours to unlock a 2x earnings multiplier on your next three completions.'
    },
    passwordReset: {
      subject: 'Reset Your Password — Promorang Security',
      title: 'Reset Your Password',
      preheader: 'Secure your account with a new password.',
      greeting: 'Hi {{name}},',
      intro: 'We received a request to reset the password for your Promorang account. Click the button below to securely create a new password.',
      requestTime: 'Request Time',
      expiresLabel: 'Expires',
      expiresValue: '1 hour',
      ctaText: 'Reset Password',
      securityNote: "If you didn't request a password reset, you can safely ignore this email. Your password will not change.",
      footerNote: 'For security reasons, this link will expire in 60 minutes. Never share this link with anyone.'
    },
    dropApproved: {
      subject: 'Drop Approved! Get ready to create — Promorang',
      title: 'Drop Application Approved',
      preheader: 'Your application for "{{dropTitle}}" was approved!',
      greeting: 'Hi {{name}},',
      intro: 'Great news! Your application for <strong>{{dropTitle}}</strong> has been approved by the brand. You can now start creating and submitting your content.',
      payoutLabel: 'Estimated Reward',
      deadlineLabel: 'Submission Deadline',
      ctaText: 'View Drop Details',
      rewardUponCompletion: "Potential reward upon completion",
      footerNote: 'Make sure your submission follows all campaign guidelines to ensure swift verification and payout.'
    },
    dropCompleted: {
      subject: 'Reward Earned! Your drop was verified — Promorang',
      title: 'Drop Verified & Rewarded',
      preheader: 'Your submission for "{{dropTitle}}" was approved!',
      greeting: 'Hi {{name}},',
      intro: 'Congratulations! Your submission for <strong>{{dropTitle}}</strong> has been verified and your reward is now available.',
      earnedLabel: 'Reward Credited',
      ctaText: 'View Wallet & Earnings',
      completedLabel: "Completed",
      statusLabel: "Status",
      statusValue: "Verified & paid",
      creditedSublabel: "Credited to your account",
      footerNote: 'Your earnings are ready in your wallet balance.'
    },
    kycApproved: {
      subject: 'Identity Verified — Full Access Unlocked — Promorang',
      title: 'KYC Verification Approved',
      preheader: 'Your identity has been successfully verified.',
      greeting: 'Hi {{name}},',
      intro: 'Your identity verification (KYC) has been successfully approved! All account features, high-tier drops, and payouts are now fully unlocked.',
      ctaText: 'Go to Wallet',
      levelLabel: "Verification level",
      dailyDeposit: "Daily deposit limit",
      dailyWithdrawal: "Daily withdrawal limit",
      maxTrade: "Max single trade",
      continueCopy: "You can now continue with trading, withdrawals, and higher account limits.",
      footerNote: 'Thank you for helping keep Promorang a verified and secure platform for everyone.'
    },
    ticketPurchase: {
      subject: 'Your Ticket Confirmation — {{momentTitle}}',
      title: 'Ticket Confirmed',
      preheader: "You're attending {{momentTitle}}!",
      greeting: 'Hi {{name}},',
      intro: 'Your ticket for <strong>{{momentTitle}}</strong> is confirmed. Show your digital pass at the entrance.',
      ctaText: 'View Your Ticket Pass',
      dateLabel: "Date",
      locationLabel: "Location",
      codeLabel: "Your activation code (show at entry)",
      tierLabel: "Tier",
      footerNote: 'Save your ticket to your phone for quick check-in at the venue.'
    },
    eventReminder: {
      subject: 'Reminder: {{momentTitle}} is coming up!',
      title: 'Upcoming Moment Reminder',
      preheader: '{{momentTitle}} starts soon.',
      greeting: 'Hi {{name}},',
      intro: 'Just a reminder that <strong>{{momentTitle}}</strong> is happening soon. Get ready for an unforgettable experience!',
      ctaText: 'View Moment Details',
      bringCode: "Make sure to bring your activation code for entry!",
      footerNote: 'Check the location, dress code, and arrival instructions in your ticket pass.'
    },
    securityAlert: {
      subject: 'New login to your Promorang account',
      title: 'Security Alert',
      preheader: 'We noticed a new login to your account.',
      greeting: 'Hi {{name}},',
      intro: 'We noticed a new sign-in to your Promorang account:',
      deviceLabel: 'Device',
      locationLabel: 'Location',
      timeLabel: 'Time',
      unknownDevice: 'Unknown device',
      unknownLocation: 'Unknown location',
      ifYou: 'If this was you, no action is needed.',
      ifNot: "If you don't recognize this activity, please secure your account immediately.",
      ctaText: 'Review Account Security'
    },
    dropRejected: {
      subject: 'Application update: {{dropTitle}}',
      title: 'Application Update',
      greeting: 'Hi {{name}},',
      intro: 'Unfortunately, your application for "<strong>{{dropTitle}}</strong>" was not approved this time.',
      feedbackLabel: 'Feedback',
      moreCopy: "Don't worry — there are plenty more opportunities. Check out other available Drops and try again.",
      ctaText: 'Browse More Drops',
      footerNote: 'Each rejection is a step closer to your next approval!'
    },
    referralSignup: {
      subject: '{{referredName}} joined via your referral!',
      title: 'New Referral',
      preheader: '{{referredName}} just joined using your referral link!',
      greeting: 'Hi {{name}},',
      intro: 'Great news! Someone just joined Promorang using your referral link:',
      bonusHint: "When they become active, you'll earn a bonus!",
      keepSharing: 'Keep sharing your referral link to grow your network and earnings.',
      ctaText: 'View Referral Stats'
    },
    referralActivation: {
      subject: 'You earned {{gems}} Gems from your referral!',
      title: 'Referral Bonus Earned',
      preheader: 'You earned a bonus because {{referredName}} became active!',
      greeting: 'Hi {{name}},',
      intro: 'Your referral <strong>{{referredName}}</strong> has become an active user on Promorang!',
      bonusLabel: 'Activation Bonus',
      keepSharing: "You'll continue earning commissions from their activity. Keep sharing!",
      ctaText: 'View Earnings'
    },
    referralCommission: {
      subject: 'Commission: +{{amount}} Gems from {{referredName}}',
      title: 'Commission Earned',
      greeting: 'Hi {{name}},',
      intro: "You just earned a commission from your referral's activity:",
      fromLabel: 'From',
      activityLabel: 'Activity',
      ctaText: 'View Wallet'
    },
    withdrawalRequested: {
      subject: 'Withdrawal request received: {{amount}}',
      title: 'Withdrawal Request Received',
      preheader: 'Your withdrawal of {{amount}} is being processed.',
      greeting: 'Hi {{name}},',
      intro: "We've received your withdrawal request and are processing it through our secure payment system.",
      amountLabel: 'Withdrawal Amount',
      viaLabel: 'via {{method}}',
      requestedLabel: 'Requested',
      methodLabel: 'Method',
      processingLabel: 'Processing Time',
      defaultEta: '1-3 business days',
      statusLabel: 'Status',
      pendingReview: 'Pending Review',
      reviewNote: "You'll receive a confirmation email once the transfer has been initiated. For security, all withdrawals are reviewed by our team.",
      ctaText: 'View Withdrawal Status'
    },
    withdrawalCompleted: {
      subject: 'Withdrawal complete: {{amount}}',
      title: 'Withdrawal Complete',
      preheader: 'Your {{amount}} has been sent.',
      greeting: 'Hi {{name}},',
      intro: 'Your withdrawal has been processed and funds have been sent. The transfer is now complete.',
      completeLabel: 'Transfer Complete',
      sentVia: 'Sent via {{method}}',
      txnLabel: 'Transaction ID',
      completedLabel: 'Completed',
      statusLabel: 'Status',
      completedStatus: 'Completed',
      thanks: 'Thank you for using Promorang. Your funds should appear in your account within the processing time for your selected payment method.',
      ctaText: 'View Transaction History',
      footerNote: 'Keep this email for your records. Contact support if you have any questions about this transaction.'
    },
    kycRequired: {
      subject: 'Identity verification required',
      title: 'Verification Required',
      greeting: 'Hi {{name}},',
      intro: 'To continue with your request, we need to verify your identity.',
      defaultReason: 'Withdrawals over $500 require identity verification for security.',
      processNote: 'This is a quick, secure process that helps protect your account and comply with regulations.',
      ctaText: 'Start Verification',
      footerNote: 'Verification typically takes just a few minutes.'
    },
    kycRejected: {
      subject: 'Your Promorang verification needs updates',
      title: 'Verification Update',
      preheader: 'Your identity verification needs changes before approval.',
      greeting: 'Hi {{name}},',
      intro: 'We reviewed your verification submission and could not approve it yet.',
      reasonLabel: 'Reason',
      defaultReason: 'Your submission needs clarification or clearer documents.',
      categoryLabel: 'Category',
      resubmitCopy: 'You can resubmit with updated information and clearer documentation.',
      ctaText: 'Review and Resubmit',
      footerNote: 'Support can help if you need clarification on the rejection reason.'
    },
    kycAdditionalInfo: {
      subject: 'Additional information needed for verification',
      title: 'More Information Needed',
      preheader: 'We need one more update to complete your verification.',
      greeting: 'Hi {{name}},',
      intro: 'Your verification review is in progress, but we need additional information before we can finish it.',
      defaultRequest: 'Please log in and review your verification request for the exact details.',
      afterUpdate: 'Once you update the requested information, the review can continue.',
      ctaText: 'Update Verification'
    },

    streakMilestone: {
      subject: '{{emoji}} {{days}}-day streak achievement!',
      title: '{{days}}-day streak! {{emoji}}',
      preheader: "You've been active for {{days}} days straight!",
      greeting: 'Hi {{name}},',
      intro: "Incredible dedication! You've kept your streak going for <strong>{{days}} days</strong>!",
      milestoneLabel: '{{emoji}} Streak milestone',
      daysLabel: '{{days}} days',
      bonusLabel: 'Bonus: +{{bonusGems}} Gems, +{{bonusPoints}} Points',
      keepGoing: 'Keep it up — the longer your streak, the bigger the rewards.',
      ctaText: 'Continue your streak'
    },
    questCompleted: {
      subject: 'Quest complete: {{title}}',
      title: 'Quest complete!',
      preheader: 'You finished {{title}}.',
      greeting: 'Hi {{name}},',
      intro: "You've completed a quest:",
      moreCopy: 'Check the Quests page for more opportunities.',
      ctaText: 'View more quests'
    },
    achievementUnlocked: {
      subject: 'Achievement: {{title}}',
      title: 'Achievement unlocked!',
      preheader: 'You unlocked {{title}}.',
      greeting: 'Hi {{name}},',
      intro: "You've unlocked a new achievement!",
      rewardLabel: '+{{rewardGems}} Gems, +{{rewardPoints}} Points',
      ctaText: 'View all achievements'
    },
    couponEarned: {
      subject: 'You earned: {{title}}',
      title: 'You earned a reward!',
      preheader: 'Use your new reward: {{title}}',
      greeting: 'Hi {{name}},',
      intro: "Congratulations! You've earned a new reward:",
      howLabel: 'How you earned it',
      expiresLabel: 'Expires',
      ctaText: 'View and redeem reward',
      footerNote: 'Check your Rewards tab regularly to discover new perks.'
    },
    weeklyDigest: {
      subject: 'Weekly summary: {{earned}} rewards earned',
      title: 'Your weekly summary',
      preheader: 'Your Promorang activity this week.',
      greeting: 'Hi {{name}},',
      intro: "Here's your Promorang activity for this week:",
      rewardsEarned: 'Rewards earned',
      totalGems: 'Total Gems',
      dayStreak: 'Day streak',
      expiring: 'Action needed: you have {{count}} reward(s) expiring soon.',
      keepGoing: 'Keep up the great work and keep earning.',
      ctaText: 'View dashboard'
    },
    supportTicketCreated: {
      subject: 'Support ticket #{{ticketId}}: {{subject}}',
      title: 'Support ticket created',
      preheader: "We've received your support request.",
      greeting: 'Hi {{name}},',
      intro: "We've received your support request:",
      ticketIdLabel: 'Ticket ID',
      categoryLabel: 'Category',
      subjectLabel: 'Subject',
      etaCopy: 'Our team will review your request and get back to you soon. Most tickets are resolved within 24-48 hours.',
      ctaText: 'View ticket'
    },
    supportTicketResponse: {
      subject: 'Re: Support ticket #{{ticketId}}',
      title: 'New response to your ticket',
      preheader: 'Support replied to ticket #{{ticketId}}.',
      greeting: 'Hi {{name}},',
      intro: "We've responded to your support ticket:",
      ticketLabel: 'Ticket #{{ticketId}}:',
      ctaText: 'View full response'
    },
    teamInvitation: {
      subject: '{{inviterName}} invited you to {{accountName}} on Promorang',
      title: "You're invited to {{accountName}}",
      preheader: '{{inviterName}} invited you to collaborate on {{accountName}}',
      greeting: 'Hi there,',
      intro: '<strong>{{inviterName}}</strong> has invited you to join their team on Promorang.',
      roleLabel: 'Your role',
      roleAdmin: 'full access to manage campaigns, team members, and settings',
      roleManager: 'access to create and manage campaigns and content',
      roleViewer: 'read-only access to view dashboards and analytics',
      personalMessage: 'Personal message from {{inviterName}}:',
      acceptCopy: 'Click the button below to accept this invitation and start collaborating.',
      expiresCopy: 'This invitation expires on {{expires}}.',
      ctaText: 'Accept invitation',
      footerNote: "If you don't recognize this invitation, you can safely ignore this email."
    },
    invitationAccepted: {
      subject: '{{newMemberName}} joined {{accountName}}',
      title: 'New team member',
      preheader: '{{newMemberName}} joined your team',
      intro: 'Great news!',
      body: '<strong>{{newMemberName}}</strong> accepted your invitation and joined your team on <strong>{{accountName}}</strong>.',
      addedLabel: 'Team member added',
      addedCopy: '{{newMemberName}} is now part of your team and can start collaborating.',
      manageCopy: 'You can manage team permissions at any time from your account settings.',
      ctaText: 'View team'
    },
    teamRemoval: {
      subject: 'Your access to {{accountName}} has been removed',
      title: 'Team access removed',
      preheader: 'Your access to {{accountName}} was removed.',
      greeting: 'Hi {{name}},',
      intro: 'Your access to <strong>{{accountName}}</strong> on Promorang has been removed by {{removedByName}}.',
      helpCopy: 'If you believe this was a mistake, please contact the account owner or our support team.',
      ctaText: 'Go to dashboard'
    },
    roleChanged: {
      subject: 'Your role on {{accountName}} has been updated',
      title: 'Team role updated',
      preheader: 'Your role on {{accountName}} changed.',
      greeting: 'Hi {{name}},',
      intro: 'Your role on <strong>{{accountName}}</strong> has been updated by {{changedByName}}.',
      previousRole: 'Previous role',
      newRole: 'New role',
      permissionsCopy: 'Your permissions have been updated accordingly.',
      ctaText: 'View dashboard'
    },

  },
  'es-419': {
    welcome: {
      subject: 'Bienvenido a Promorang — Tu viaje de recompensas comienza hoy',
      title: 'Bienvenido a Promorang',
      preheader: 'Tu camino hacia recompensas reales empieza ahora.',
      greeting: 'Hola {{name}},',
      intro: 'Bienvenido a <strong>Promorang</strong> — donde tu interacción se transforma en recompensas reales. Nos alegra tenerte en nuestra comunidad de creadores, anfitriones y exploradores.',
      bonusLabel: 'Bono de Bienvenida',
      bonusValue: '100 Puntos + 10 Llaves',
      bonusSublabel: 'Acreditado automáticamente en tu cuenta',
      sectionTitle: 'Lo que puedes hacer',
      features: [
        'Completa Drops para ganar Gemas y desbloquear oportunidades',
        'Invierte en contenido en el que crees y comparte su éxito',
        'Crea rachas diarias para multiplicar tus bonificaciones',
        'Expande tu red y gana recompensas por cada referido'
      ],
      readyPrompt: '¿Listo para empezar a ganar? Tu panel te espera.',
      ctaText: 'Ir a mi Panel',
      footerNote: 'Completa tu primer Drop dentro de las primeras 24 horas para desbloquear un multiplicador de ganancias de 2x en tus siguientes tres entregas.'
    },
    passwordReset: {
      subject: 'Restablece tu Contraseña — Seguridad Promorang',
      title: 'Restablece tu Contraseña',
      preheader: 'Protege tu cuenta con una nueva contraseña.',
      greeting: 'Hola {{name}},',
      intro: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta de Promorang. Haz clic en el botón a continuación para crear una nueva de forma segura.',
      requestTime: 'Hora de solicitud',
      expiresLabel: 'Vence en',
      expiresValue: '1 hora',
      ctaText: 'Restablecer Contraseña',
      securityNote: 'Si no solicitaste este cambio, puedes ignorar este mensaje sin problemas. Tu contraseña actual no cambiará.',
      footerNote: 'Por razones de seguridad, este enlace expirará en 60 minutos. Nunca compartas este enlace con nadie.'
    },
    dropApproved: {
      subject: '¡Drop Aprobado! Prepárate para crear — Promorang',
      title: 'Solicitud de Drop Aprobada',
      preheader: '¡Tu postulación para "{{dropTitle}}" fue aprobada!',
      greeting: 'Hola {{name}},',
      intro: '¡Excelentes noticias! Tu postulación para <strong>{{dropTitle}}</strong> ha sido aprobada por la marca. Ya puedes comenzar a crear y enviar tu contenido.',
      payoutLabel: 'Recompensa Estimada',
      deadlineLabel: 'Fecha límite de entrega',
      ctaText: 'Ver Detalles del Drop',
      rewardUponCompletion: "Recompensa potencial al completar",
      footerNote: 'Asegúrate de seguir todas las pautas de la campaña para garantizar una verificación rápida y tu pago.'
    },
    dropCompleted: {
      subject: '¡Recompensa Ganada! Tu drop fue verificado — Promorang',
      title: 'Drop Verificado y Recompensado',
      preheader: '¡Tu entrega para "{{dropTitle}}" fue verificada con éxito!',
      greeting: 'Hola {{name}},',
      intro: '¡Felicitaciones! Tu entrega para <strong>{{dropTitle}}</strong> ha sido verificada y tu recompensa ya está disponible.',
      earnedLabel: 'Recompensa Acreditada',
      ctaText: 'Ver Billetera y Ganancias',
      completedLabel: "Completado",
      statusLabel: "Estado",
      statusValue: "Verificado y pagado",
      creditedSublabel: "Acreditado en tu cuenta",
      footerNote: 'Tus ganancias están listas en el saldo de tu billetera.'
    },
    kycApproved: {
      subject: 'Identidad Verificada — Acceso Total Desbloqueado — Promorang',
      title: 'Verificación KYC Aprobada',
      preheader: 'Tu identidad ha sido verificada con éxito.',
      greeting: 'Hola {{name}},',
      intro: '¡Tu verificación de identidad (KYC) fue aprobada con éxito! Todas las funciones, drops premium y retiros ya están disponibles.',
      ctaText: 'Ir a mi Billetera',
      levelLabel: "Nivel de verificación",
      dailyDeposit: "Límite diario de depósito",
      dailyWithdrawal: "Límite diario de retiro",
      maxTrade: "Operación máxima",
      continueCopy: "Ya puedes operar, retirar y usar límites más altos.",
      footerNote: 'Gracias por ayudarnos a mantener Promorang como una comunidad segura y confiable para todos.'
    },
    ticketPurchase: {
      subject: 'Confirmación de Entrada — {{momentTitle}}',
      title: 'Entrada Confirmada',
      preheader: '¡Asistirás a {{momentTitle}}!',
      greeting: 'Hola {{name}},',
      intro: 'Tu entrada para <strong>{{momentTitle}}</strong> está confirmada. Muestra tu pase digital en la entrada.',
      ctaText: 'Ver Pase de Entrada',
      dateLabel: "Fecha",
      locationLabel: "Ubicación",
      codeLabel: "Tu código de activación (muéstralo en la entrada)",
      tierLabel: "Nivel",
      footerNote: 'Guarda tu entrada en tu teléfono para un acceso ágil al llegar al recinto.'
    },
    eventReminder: {
      subject: 'Recordatorio: ¡{{momentTitle}} es muy pronto!',
      title: 'Recordatorio de Momento',
      preheader: '{{momentTitle}} comenzará pronto.',
      greeting: 'Hola {{name}},',
      intro: 'Te recordamos que <strong>{{momentTitle}}</strong> ocurrirá pronto. ¡Prepárate para una gran experiencia!',
      ctaText: 'Ver Detalles del Momento',
      bringCode: "¡Lleva tu código de activación para entrar!",
      footerNote: 'Revisa la ubicación y las instrucciones de llegada en tu pase digital.'
    },
    securityAlert: {
      subject: 'Nuevo inicio de sesión en tu cuenta Promorang',
      title: 'Alerta de Seguridad',
      preheader: 'Notamos un nuevo inicio de sesión en tu cuenta.',
      greeting: 'Hola {{name}},',
      intro: 'Notamos un nuevo acceso a tu cuenta de Promorang:',
      deviceLabel: 'Dispositivo',
      locationLabel: 'Ubicación',
      timeLabel: 'Hora',
      unknownDevice: 'Dispositivo desconocido',
      unknownLocation: 'Ubicación desconocida',
      ifYou: 'Si fuiste tú, no necesitas hacer nada.',
      ifNot: 'Si no reconoces esta actividad, asegura tu cuenta de inmediato.',
      ctaText: 'Revisar Seguridad de la Cuenta'
    },
    dropRejected: {
      subject: 'Actualización de solicitud: {{dropTitle}}',
      title: 'Actualización de Solicitud',
      greeting: 'Hola {{name}},',
      intro: 'Esta vez tu solicitud para "<strong>{{dropTitle}}</strong>" no fue aprobada.',
      feedbackLabel: 'Comentarios',
      moreCopy: 'No te preocupes — hay muchas más oportunidades. Revisa otros Drops disponibles e inténtalo de nuevo.',
      ctaText: 'Ver más Drops',
      footerNote: 'Cada rechazo te acerca a tu próxima aprobación.'
    },
    referralSignup: {
      subject: '¡{{referredName}} se unió con tu referido!',
      title: 'Nuevo Referido',
      preheader: '¡{{referredName}} acaba de unirse con tu enlace!',
      greeting: 'Hola {{name}},',
      intro: '¡Buenas noticias! Alguien se unió a Promorang con tu enlace de referido:',
      bonusHint: 'Cuando se active, ganarás un bono.',
      keepSharing: 'Sigue compartiendo tu enlace para crecer tu red y tus ganancias.',
      ctaText: 'Ver estadísticas de referidos'
    },
    referralActivation: {
      subject: 'Ganaste {{gems}} Gemas por tu referido',
      title: 'Bono de Referido Ganado',
      preheader: 'Ganaste un bono porque {{referredName}} se activó.',
      greeting: 'Hola {{name}},',
      intro: 'Tu referido <strong>{{referredName}}</strong> ya es un usuario activo en Promorang.',
      bonusLabel: 'Bono de activación',
      keepSharing: 'Seguirás ganando comisiones por su actividad. ¡Sigue compartiendo!',
      ctaText: 'Ver ganancias'
    },
    referralCommission: {
      subject: 'Comisión: +{{amount}} Gemas de {{referredName}}',
      title: 'Comisión Ganada',
      greeting: 'Hola {{name}},',
      intro: 'Acabas de ganar una comisión por la actividad de tu referido:',
      fromLabel: 'De',
      activityLabel: 'Actividad',
      ctaText: 'Ver billetera'
    },
    withdrawalRequested: {
      subject: 'Solicitud de retiro recibida: {{amount}}',
      title: 'Solicitud de Retiro Recibida',
      preheader: 'Tu retiro de {{amount}} se está procesando.',
      greeting: 'Hola {{name}},',
      intro: 'Recibimos tu solicitud de retiro y la estamos procesando de forma segura.',
      amountLabel: 'Monto del retiro',
      viaLabel: 'vía {{method}}',
      requestedLabel: 'Solicitado',
      methodLabel: 'Método',
      processingLabel: 'Tiempo de procesamiento',
      defaultEta: '1-3 días hábiles',
      statusLabel: 'Estado',
      pendingReview: 'En revisión',
      reviewNote: 'Recibirás un correo cuando se inicie la transferencia. Por seguridad, todos los retiros se revisan.',
      ctaText: 'Ver estado del retiro'
    },
    withdrawalCompleted: {
      subject: 'Retiro completado: {{amount}}',
      title: 'Retiro Completado',
      preheader: 'Tu {{amount}} ya se envió.',
      greeting: 'Hola {{name}},',
      intro: 'Tu retiro se procesó y los fondos ya se enviaron.',
      completeLabel: 'Transferencia completada',
      sentVia: 'Enviado vía {{method}}',
      txnLabel: 'ID de transacción',
      completedLabel: 'Completado',
      statusLabel: 'Estado',
      completedStatus: 'Completado',
      thanks: 'Gracias por usar Promorang. Los fondos deberían aparecer según el tiempo de tu método de pago.',
      ctaText: 'Ver historial de transacciones',
      footerNote: 'Guarda este correo. Contacta a soporte si tienes preguntas sobre esta transacción.'
    },
    kycRequired: {
      subject: 'Se requiere verificación de identidad',
      title: 'Verificación Requerida',
      greeting: 'Hola {{name}},',
      intro: 'Para continuar con tu solicitud, necesitamos verificar tu identidad.',
      defaultReason: 'Los retiros mayores a $500 requieren verificación de identidad por seguridad.',
      processNote: 'Es un proceso rápido y seguro que protege tu cuenta y cumple con las regulaciones.',
      ctaText: 'Empezar verificación',
      footerNote: 'La verificación suele tardar solo unos minutos.'
    },
    kycRejected: {
      subject: 'Tu verificación de Promorang necesita actualizaciones',
      title: 'Actualización de Verificación',
      preheader: 'Tu verificación de identidad necesita cambios antes de aprobarse.',
      greeting: 'Hola {{name}},',
      intro: 'Revisamos tu envío y aún no pudimos aprobarlo.',
      reasonLabel: 'Motivo',
      defaultReason: 'Tu envío necesita aclaraciones o documentos más claros.',
      categoryLabel: 'Categoría',
      resubmitCopy: 'Puedes enviar de nuevo con información actualizada y documentos más claros.',
      ctaText: 'Revisar y reenviar',
      footerNote: 'Soporte puede ayudarte si necesitas aclarar el motivo.'
    },
    kycAdditionalInfo: {
      subject: 'Se necesita más información para la verificación',
      title: 'Se Necesita Más Información',
      preheader: 'Necesitamos una actualización más para completar tu verificación.',
      greeting: 'Hola {{name}},',
      intro: 'Tu revisión está en curso, pero necesitamos más información para terminarla.',
      defaultRequest: 'Inicia sesión y revisa tu solicitud de verificación para ver los detalles.',
      afterUpdate: 'Cuando actualices la información, la revisión podrá continuar.',
      ctaText: 'Actualizar verificación'
    },

    streakMilestone: {
      subject: '¡{{emoji}} Racha de {{days}} días!',
      title: '¡Racha de {{days}} días! {{emoji}}',
      preheader: 'Llevas {{days}} días activos seguidos.',
      greeting: 'Hola {{name}},',
      intro: '¡Qué constancia! Has mantenido tu racha durante <strong>{{days}} días</strong>.',
      milestoneLabel: '{{emoji}} Hito de racha',
      daysLabel: '{{days}} días',
      bonusLabel: 'Bono: +{{bonusGems}} Gemas, +{{bonusPoints}} Puntos',
      keepGoing: 'Sigue así: cuanto más larga la racha, más grandes las recompensas.',
      ctaText: 'Continuar tu racha'
    },
    questCompleted: {
      subject: 'Misión completa: {{title}}',
      title: '¡Misión completa!',
      preheader: 'Terminaste {{title}}.',
      greeting: 'Hola {{name}},',
      intro: 'Completaste una misión:',
      moreCopy: 'Revisa la página de Misiones para más oportunidades.',
      ctaText: 'Ver más misiones'
    },
    achievementUnlocked: {
      subject: 'Logro: {{title}}',
      title: '¡Logro desbloqueado!',
      preheader: 'Desbloqueaste {{title}}.',
      greeting: 'Hola {{name}},',
      intro: '¡Desbloqueaste un nuevo logro!',
      rewardLabel: '+{{rewardGems}} Gemas, +{{rewardPoints}} Puntos',
      ctaText: 'Ver todos los logros'
    },
    couponEarned: {
      subject: 'Ganaste: {{title}}',
      title: '¡Ganaste una recompensa!',
      preheader: 'Usa tu nueva recompensa: {{title}}',
      greeting: 'Hola {{name}},',
      intro: '¡Felicidades! Ganaste una nueva recompensa:',
      howLabel: 'Cómo la ganaste',
      expiresLabel: 'Vence',
      ctaText: 'Ver y canjear recompensa',
      footerNote: 'Revisa tu pestaña de Recompensas para descubrir nuevos beneficios.'
    },
    weeklyDigest: {
      subject: 'Resumen semanal: {{earned}} recompensas ganadas',
      title: 'Tu resumen semanal',
      preheader: 'Tu actividad en Promorang esta semana.',
      greeting: 'Hola {{name}},',
      intro: 'Así estuvo tu actividad en Promorang esta semana:',
      rewardsEarned: 'Recompensas ganadas',
      totalGems: 'Gemas totales',
      dayStreak: 'Racha de días',
      expiring: 'Acción necesaria: tienes {{count}} recompensa(s) por vencer pronto.',
      keepGoing: 'Sigue así y sigue ganando.',
      ctaText: 'Ver panel'
    },
    supportTicketCreated: {
      subject: 'Ticket de soporte #{{ticketId}}: {{subject}}',
      title: 'Ticket de soporte creado',
      preheader: 'Recibimos tu solicitud de soporte.',
      greeting: 'Hola {{name}},',
      intro: 'Recibimos tu solicitud de soporte:',
      ticketIdLabel: 'ID del ticket',
      categoryLabel: 'Categoría',
      subjectLabel: 'Asunto',
      etaCopy: 'Nuestro equipo revisará tu solicitud y te responderá pronto. La mayoría se resuelven en 24-48 horas.',
      ctaText: 'Ver ticket'
    },
    supportTicketResponse: {
      subject: 'Re: Ticket de soporte #{{ticketId}}',
      title: 'Nueva respuesta a tu ticket',
      preheader: 'Soporte respondió al ticket #{{ticketId}}.',
      greeting: 'Hola {{name}},',
      intro: 'Respondimos a tu ticket de soporte:',
      ticketLabel: 'Ticket #{{ticketId}}:',
      ctaText: 'Ver respuesta completa'
    },
    teamInvitation: {
      subject: '{{inviterName}} te invitó a {{accountName}} en Promorang',
      title: 'Te invitaron a {{accountName}}',
      preheader: '{{inviterName}} te invitó a colaborar en {{accountName}}',
      greeting: 'Hola,',
      intro: '<strong>{{inviterName}}</strong> te invitó a unirte a su equipo en Promorang.',
      roleLabel: 'Tu rol',
      roleAdmin: 'acceso total para gestionar campañas, equipo y ajustes',
      roleManager: 'acceso para crear y gestionar campañas y contenido',
      roleViewer: 'acceso de solo lectura a paneles y analítica',
      personalMessage: 'Mensaje personal de {{inviterName}}:',
      acceptCopy: 'Haz clic en el botón para aceptar la invitación y empezar a colaborar.',
      expiresCopy: 'Esta invitación vence el {{expires}}.',
      ctaText: 'Aceptar invitación',
      footerNote: 'Si no reconoces esta invitación, puedes ignorar este correo.'
    },
    invitationAccepted: {
      subject: '{{newMemberName}} se unió a {{accountName}}',
      title: 'Nuevo miembro del equipo',
      preheader: '{{newMemberName}} se unió a tu equipo',
      intro: '¡Buenas noticias!',
      body: '<strong>{{newMemberName}}</strong> aceptó tu invitación y se unió a tu equipo en <strong>{{accountName}}</strong>.',
      addedLabel: 'Miembro agregado',
      addedCopy: '{{newMemberName}} ya forma parte de tu equipo y puede colaborar.',
      manageCopy: 'Puedes gestionar permisos cuando quieras desde los ajustes de la cuenta.',
      ctaText: 'Ver equipo'
    },
    teamRemoval: {
      subject: 'Tu acceso a {{accountName}} fue eliminado',
      title: 'Acceso al equipo eliminado',
      preheader: 'Tu acceso a {{accountName}} fue eliminado.',
      greeting: 'Hola {{name}},',
      intro: '{{removedByName}} eliminó tu acceso a <strong>{{accountName}}</strong> en Promorang.',
      helpCopy: 'Si crees que fue un error, contacta al dueño de la cuenta o a soporte.',
      ctaText: 'Ir al panel'
    },
    roleChanged: {
      subject: 'Tu rol en {{accountName}} se actualizó',
      title: 'Rol de equipo actualizado',
      preheader: 'Tu rol en {{accountName}} cambió.',
      greeting: 'Hola {{name}},',
      intro: '{{changedByName}} actualizó tu rol en <strong>{{accountName}}</strong>.',
      previousRole: 'Rol anterior',
      newRole: 'Nuevo rol',
      permissionsCopy: 'Tus permisos se actualizaron en consecuencia.',
      ctaText: 'Ver panel'
    },

  },
  'pt-BR': {
    welcome: {
      subject: 'Boas-vindas ao Promorang — Sua jornada de recompensas começa agora',
      title: 'Boas-vindas ao Promorang',
      preheader: 'Sua jornada de ganhos reais começa aqui.',
      greeting: 'Olá {{name}},',
      intro: 'Boas-vindas ao <strong>Promorang</strong> — onde seu engajamento se transforma em recompensas reais. É um prazer ter você em nossa comunidade de criadores, anfitriões e exploradores.',
      bonusLabel: 'Bônus de Boas-vindas',
      bonusValue: '100 Pontos + 10 Chaves',
      bonusSublabel: 'Já creditado na sua conta',
      sectionTitle: 'O que você pode fazer',
      features: [
        'Conclua Drops para ganhar Gemas e desbloquear oportunidades',
        'Invista em conteúdos que você confia e compartilhe o sucesso',
        'Mantenha sequências diárias para multiplicar seus bônus',
        'Expanda sua rede e ganhe comissões por cada indicação'
      ],
      readyPrompt: 'Pronto para começar a ganhar? Seu painel está à sua espera.',
      ctaText: 'Acessar meu Painel',
      footerNote: 'Conclua seu primeiro Drop em até 24 horas para desbloquear um multiplicador de ganhos 2x nas próximas três entregas.'
    },
    passwordReset: {
      subject: 'Redefina sua Senha — Segurança Promorang',
      title: 'Redefinição de Senha',
      preheader: 'Proteja sua conta criando uma nova senha.',
      greeting: 'Olá {{name}},',
      intro: 'Recebemos uma solicitação para redefinir a senha da sua conta Promorang. Clique no botão abaixo para cadastrar uma nova senha com segurança.',
      requestTime: 'Horário do pedido',
      expiresLabel: 'Expira em',
      expiresValue: '1 hora',
      ctaText: 'Redefinir Senha',
      securityNote: 'Se você não solicitou a redefinição de senha, pode ignorar este e-mail tranquilamente. Sua senha atual permanecerá inalterada.',
      footerNote: 'Por segurança, este link expirará em 60 minutos. Nunca compartilhe este link com terceiros.'
    },
    dropApproved: {
      subject: 'Drop Aprovado! Prepare-se para criar — Promorang',
      title: 'Inscrição de Drop Aprovada',
      preheader: 'Sua inscrição para "{{dropTitle}}" foi aprovada!',
      greeting: 'Olá {{name}},',
      intro: 'Ótima notícia! Sua inscrição para o drop <strong>{{dropTitle}}</strong> foi aprovada pela marca. Você já pode criar e enviar seu conteúdo.',
      payoutLabel: 'Recompensa Estimada',
      deadlineLabel: 'Prazo de envio',
      ctaText: 'Ver Detalhes do Drop',
      rewardUponCompletion: "Recompensa potencial ao concluir",
      footerNote: 'Siga todas as diretrizes da campanha para garantir uma verificação ágil e a liberação do seu pagamento.'
    },
    dropCompleted: {
      subject: 'Recompensa Conquistada! Seu drop foi verificado — Promorang',
      title: 'Drop Verificado e Recompensado',
      preheader: 'Seu conteúdo de "{{dropTitle}}" foi aprovado com sucesso!',
      greeting: 'Olá {{name}},',
      intro: 'Parabéns! Sua entrega para <strong>{{dropTitle}}</strong> foi verificada e sua recompensa já está disponível.',
      earnedLabel: 'Recompensa Creditada',
      ctaText: 'Ver Carteira e Ganhos',
      completedLabel: "Concluído",
      statusLabel: "Status",
      statusValue: "Verificado e pago",
      creditedSublabel: "Creditado na sua conta",
      footerNote: 'Seus rendimentos já estão disponíveis no saldo da sua carteira.'
    },
    kycApproved: {
      subject: 'Identidade Verificada — Acesso Completo Liberado — Promorang',
      title: 'Verificação KYC Aprovada',
      preheader: 'Sua identidade foi verificada com sucesso.',
      greeting: 'Olá {{name}},',
      intro: 'Sua verificação de identidade (KYC) foi aprovada com sucesso! Todos os recursos, drops premium e saques estão liberados.',
      ctaText: 'Ir para a Carteira',
      levelLabel: "Nível de verificação",
      dailyDeposit: "Limite diário de depósito",
      dailyWithdrawal: "Limite diário de saque",
      maxTrade: "Operação máxima",
      continueCopy: "Agora você pode operar, sacar e usar limites mais altos.",
      footerNote: 'Obrigado por contribuir para manter o Promorang uma plataforma confiável e segura para todos.'
    },
    ticketPurchase: {
      subject: 'Confirmação do seu Ingresso — {{momentTitle}}',
      title: 'Ingresso Confirmado',
      preheader: 'Sua presença em {{momentTitle}} está confirmada!',
      greeting: 'Olá {{name}},',
      intro: 'Seu ingresso para <strong>{{momentTitle}}</strong> está confirmado. Apresente seu passe digital na entrada do local.',
      ctaText: 'Ver Passe do Ingresso',
      dateLabel: "Data",
      locationLabel: "Local",
      codeLabel: "Seu código de ativação (mostre na entrada)",
      tierLabel: "Nível",
      footerNote: 'Salve seu ingresso no celular para agilizar o check-in na entrada.'
    },
    eventReminder: {
      subject: 'Lembrete: {{momentTitle}} acontecerá em breve!',
      title: 'Lembrete do Momento',
      preheader: '{{momentTitle}} começará em breve.',
      greeting: 'Olá {{name}},',
      intro: 'Passando para lembrar que <strong>{{momentTitle}}</strong> vai acontecer em breve. Prepare-se para uma experiência marcante!',
      ctaText: 'Ver Detalhes do Momento',
      bringCode: "Leve seu código de ativação para entrar!",
      footerNote: 'Consulte o endereço e as instruções de chegada no seu passe digital.'
    },
    securityAlert: {
      subject: 'Novo login na sua conta Promorang',
      title: 'Alerta de Segurança',
      preheader: 'Notamos um novo login na sua conta.',
      greeting: 'Olá {{name}},',
      intro: 'Notamos um novo acesso à sua conta Promorang:',
      deviceLabel: 'Dispositivo',
      locationLabel: 'Local',
      timeLabel: 'Horário',
      unknownDevice: 'Dispositivo desconhecido',
      unknownLocation: 'Local desconhecido',
      ifYou: 'Se foi você, nenhuma ação é necessária.',
      ifNot: 'Se você não reconhece esta atividade, proteja sua conta imediatamente.',
      ctaText: 'Revisar Segurança da Conta'
    },
    dropRejected: {
      subject: 'Atualização da inscrição: {{dropTitle}}',
      title: 'Atualização da Inscrição',
      greeting: 'Olá {{name}},',
      intro: 'Desta vez sua inscrição para "<strong>{{dropTitle}}</strong>" não foi aprovada.',
      feedbackLabel: 'Feedback',
      moreCopy: 'Não se preocupe — há muitas outras oportunidades. Veja outros Drops disponíveis e tente de novo.',
      ctaText: 'Ver mais Drops',
      footerNote: 'Cada recusa te aproxima da próxima aprovação.'
    },
    referralSignup: {
      subject: '{{referredName}} entrou pelo seu convite!',
      title: 'Novo Indicado',
      preheader: '{{referredName}} acabou de entrar com o seu link!',
      greeting: 'Olá {{name}},',
      intro: 'Boa notícia! Alguém acabou de entrar no Promorang com o seu link de indicação:',
      bonusHint: 'Quando a pessoa ficar ativa, você ganha um bônus!',
      keepSharing: 'Continue compartilhando seu link para crescer sua rede e seus ganhos.',
      ctaText: 'Ver estatísticas de indicação'
    },
    referralActivation: {
      subject: 'Você ganhou {{gems}} Gemas pela indicação!',
      title: 'Bônus de Indicação',
      preheader: 'Você ganhou um bônus porque {{referredName}} ficou ativo!',
      greeting: 'Olá {{name}},',
      intro: 'Sua indicação <strong>{{referredName}}</strong> se tornou um usuário ativo no Promorang!',
      bonusLabel: 'Bônus de ativação',
      keepSharing: 'Você continuará ganhando comissões da atividade. Continue compartilhando!',
      ctaText: 'Ver ganhos'
    },
    referralCommission: {
      subject: 'Comissão: +{{amount}} Gemas de {{referredName}}',
      title: 'Comissão Recebida',
      greeting: 'Olá {{name}},',
      intro: 'Você acabou de ganhar uma comissão da atividade do seu indicado:',
      fromLabel: 'De',
      activityLabel: 'Atividade',
      ctaText: 'Ver carteira'
    },
    withdrawalRequested: {
      subject: 'Pedido de saque recebido: {{amount}}',
      title: 'Pedido de Saque Recebido',
      preheader: 'Seu saque de {{amount}} está em processamento.',
      greeting: 'Olá {{name}},',
      intro: 'Recebemos seu pedido de saque e estamos processando pelo sistema seguro.',
      amountLabel: 'Valor do saque',
      viaLabel: 'via {{method}}',
      requestedLabel: 'Solicitado',
      methodLabel: 'Método',
      processingLabel: 'Prazo de processamento',
      defaultEta: '1-3 dias úteis',
      statusLabel: 'Status',
      pendingReview: 'Em análise',
      reviewNote: 'Você receberá um e-mail quando a transferência for iniciada. Por segurança, todos os saques são revisados.',
      ctaText: 'Ver status do saque'
    },
    withdrawalCompleted: {
      subject: 'Saque concluído: {{amount}}',
      title: 'Saque Concluído',
      preheader: 'Seu {{amount}} foi enviado.',
      greeting: 'Olá {{name}},',
      intro: 'Seu saque foi processado e os fundos já foram enviados.',
      completeLabel: 'Transferência concluída',
      sentVia: 'Enviado via {{method}}',
      txnLabel: 'ID da transação',
      completedLabel: 'Concluído',
      statusLabel: 'Status',
      completedStatus: 'Concluído',
      thanks: 'Obrigado por usar o Promorang. Os fundos devem aparecer no prazo do seu método de pagamento.',
      ctaText: 'Ver histórico de transações',
      footerNote: 'Guarde este e-mail. Fale com o suporte se tiver dúvidas sobre esta transação.'
    },
    kycRequired: {
      subject: 'Verificação de identidade necessária',
      title: 'Verificação Necessária',
      greeting: 'Olá {{name}},',
      intro: 'Para continuar com o seu pedido, precisamos verificar sua identidade.',
      defaultReason: 'Saques acima de US$ 500 exigem verificação de identidade por segurança.',
      processNote: 'É um processo rápido e seguro que protege sua conta e atende às regras.',
      ctaText: 'Começar verificação',
      footerNote: 'A verificação costuma levar só alguns minutos.'
    },
    kycRejected: {
      subject: 'Sua verificação Promorang precisa de atualizações',
      title: 'Atualização da Verificação',
      preheader: 'Sua verificação de identidade precisa de mudanças antes da aprovação.',
      greeting: 'Olá {{name}},',
      intro: 'Analisamos seu envio e ainda não pudemos aprovar.',
      reasonLabel: 'Motivo',
      defaultReason: 'Seu envio precisa de esclarecimento ou documentos mais nítidos.',
      categoryLabel: 'Categoria',
      resubmitCopy: 'Você pode enviar de novo com informações atualizadas e documentos mais claros.',
      ctaText: 'Revisar e reenviar',
      footerNote: 'O suporte pode ajudar se você precisar esclarecer o motivo.'
    },
    kycAdditionalInfo: {
      subject: 'Precisamos de mais informações para a verificação',
      title: 'Mais Informações Necessárias',
      preheader: 'Precisamos de mais uma atualização para concluir sua verificação.',
      greeting: 'Olá {{name}},',
      intro: 'Sua análise está em andamento, mas precisamos de mais informações para terminar.',
      defaultRequest: 'Entre e revise seu pedido de verificação para ver os detalhes.',
      afterUpdate: 'Quando você atualizar as informações, a análise poderá continuar.',
      ctaText: 'Atualizar verificação'
    },

    streakMilestone: {
      subject: '{{emoji}} Sequência de {{days}} dias!',
      title: 'Sequência de {{days}} dias! {{emoji}}',
      preheader: 'Você está ativo há {{days}} dias seguidos.',
      greeting: 'Olá {{name}},',
      intro: 'Que constância! Você manteve sua sequência por <strong>{{days}} dias</strong>.',
      milestoneLabel: '{{emoji}} Marco da sequência',
      daysLabel: '{{days}} dias',
      bonusLabel: 'Bônus: +{{bonusGems}} Gemas, +{{bonusPoints}} Pontos',
      keepGoing: 'Continue: quanto maior a sequência, maiores as recompensas.',
      ctaText: 'Continuar sua sequência'
    },
    questCompleted: {
      subject: 'Missão concluída: {{title}}',
      title: 'Missão concluída!',
      preheader: 'Você concluiu {{title}}.',
      greeting: 'Olá {{name}},',
      intro: 'Você concluiu uma missão:',
      moreCopy: 'Veja a página de Missões para mais oportunidades.',
      ctaText: 'Ver mais missões'
    },
    achievementUnlocked: {
      subject: 'Conquista: {{title}}',
      title: 'Conquista desbloqueada!',
      preheader: 'Você desbloqueou {{title}}.',
      greeting: 'Olá {{name}},',
      intro: 'Você desbloqueou uma nova conquista!',
      rewardLabel: '+{{rewardGems}} Gemas, +{{rewardPoints}} Pontos',
      ctaText: 'Ver todas as conquistas'
    },
    couponEarned: {
      subject: 'Você ganhou: {{title}}',
      title: 'Você ganhou uma recompensa!',
      preheader: 'Use sua nova recompensa: {{title}}',
      greeting: 'Olá {{name}},',
      intro: 'Parabéns! Você ganhou uma nova recompensa:',
      howLabel: 'Como você ganhou',
      expiresLabel: 'Expira',
      ctaText: 'Ver e resgatar recompensa',
      footerNote: 'Confira a aba de Recompensas para descobrir novos benefícios.'
    },
    weeklyDigest: {
      subject: 'Resumo semanal: {{earned}} recompensas ganhas',
      title: 'Seu resumo semanal',
      preheader: 'Sua atividade na Promorang nesta semana.',
      greeting: 'Olá {{name}},',
      intro: 'Veja sua atividade na Promorang nesta semana:',
      rewardsEarned: 'Recompensas ganhas',
      totalGems: 'Gemas totais',
      dayStreak: 'Sequência de dias',
      expiring: 'Ação necessária: você tem {{count}} recompensa(s) expirando em breve.',
      keepGoing: 'Continue assim e continue ganhando.',
      ctaText: 'Ver painel'
    },
    supportTicketCreated: {
      subject: 'Ticket de suporte #{{ticketId}}: {{subject}}',
      title: 'Ticket de suporte criado',
      preheader: 'Recebemos seu pedido de suporte.',
      greeting: 'Olá {{name}},',
      intro: 'Recebemos seu pedido de suporte:',
      ticketIdLabel: 'ID do ticket',
      categoryLabel: 'Categoria',
      subjectLabel: 'Assunto',
      etaCopy: 'Nossa equipe vai revisar seu pedido e responder em breve. A maioria se resolve em 24-48 horas.',
      ctaText: 'Ver ticket'
    },
    supportTicketResponse: {
      subject: 'Re: Ticket de suporte #{{ticketId}}',
      title: 'Nova resposta no seu ticket',
      preheader: 'O suporte respondeu o ticket #{{ticketId}}.',
      greeting: 'Olá {{name}},',
      intro: 'Respondemos ao seu ticket de suporte:',
      ticketLabel: 'Ticket #{{ticketId}}:',
      ctaText: 'Ver resposta completa'
    },
    teamInvitation: {
      subject: '{{inviterName}} convidou você para {{accountName}} na Promorang',
      title: 'Você foi convidado para {{accountName}}',
      preheader: '{{inviterName}} convidou você para colaborar em {{accountName}}',
      greeting: 'Olá,',
      intro: '<strong>{{inviterName}}</strong> convidou você para entrar na equipe na Promorang.',
      roleLabel: 'Seu papel',
      roleAdmin: 'acesso total para gerenciar campanhas, equipe e configurações',
      roleManager: 'acesso para criar e gerenciar campanhas e conteúdo',
      roleViewer: 'acesso somente leitura a painéis e análises',
      personalMessage: 'Mensagem pessoal de {{inviterName}}:',
      acceptCopy: 'Clique no botão para aceitar o convite e começar a colaborar.',
      expiresCopy: 'Este convite expira em {{expires}}.',
      ctaText: 'Aceitar convite',
      footerNote: 'Se você não reconhece este convite, pode ignorar este e-mail.'
    },
    invitationAccepted: {
      subject: '{{newMemberName}} entrou em {{accountName}}',
      title: 'Novo membro da equipe',
      preheader: '{{newMemberName}} entrou na sua equipe',
      intro: 'Boa notícia!',
      body: '<strong>{{newMemberName}}</strong> aceitou seu convite e entrou na equipe de <strong>{{accountName}}</strong>.',
      addedLabel: 'Membro adicionado',
      addedCopy: '{{newMemberName}} agora faz parte da equipe e já pode colaborar.',
      manageCopy: 'Você pode gerenciar permissões a qualquer momento nas configurações da conta.',
      ctaText: 'Ver equipe'
    },
    teamRemoval: {
      subject: 'Seu acesso a {{accountName}} foi removido',
      title: 'Acesso da equipe removido',
      preheader: 'Seu acesso a {{accountName}} foi removido.',
      greeting: 'Olá {{name}},',
      intro: '{{removedByName}} removeu seu acesso a <strong>{{accountName}}</strong> na Promorang.',
      helpCopy: 'Se achar que foi um engano, fale com o dono da conta ou com o suporte.',
      ctaText: 'Ir ao painel'
    },
    roleChanged: {
      subject: 'Seu papel em {{accountName}} foi atualizado',
      title: 'Papel da equipe atualizado',
      preheader: 'Seu papel em {{accountName}} mudou.',
      greeting: 'Olá {{name}},',
      intro: '{{changedByName}} atualizou seu papel em <strong>{{accountName}}</strong>.',
      previousRole: 'Papel anterior',
      newRole: 'Novo papel',
      permissionsCopy: 'Suas permissões foram atualizadas de acordo.',
      ctaText: 'Ver painel'
    },

  }
};

/**
 * Gets localized email template data for a given key and locale
 * @param {string} templateKey - e.g. 'welcome', 'passwordReset'
 * @param {string} [locale] - 'en', 'es-419', 'pt-BR'
 * @param {Record<string, string>} [replacements]
 * @returns {Record<string, any>}
 */
function getEmailContent(templateKey, locale, replacements = {}) {
  const normLocale = normalizeEmailLocale(locale);
  const localeDict = EMAIL_TRANSLATIONS[normLocale] || EMAIL_TRANSLATIONS.en;
  const template = localeDict[templateKey] || EMAIL_TRANSLATIONS.en[templateKey] || {};

  const processString = (str) => {
    if (typeof str !== 'string') return str;
    let result = str;
    for (const [k, v] of Object.entries(replacements)) {
      result = result.replace(new RegExp(`{{${k}}}`, 'g'), v !== undefined && v !== null ? String(v) : '');
    }
    return result;
  };

  const processed = {};
  for (const [k, val] of Object.entries(template)) {
    if (Array.isArray(val)) {
      processed[k] = val.map(processString);
    } else if (typeof val === 'string') {
      processed[k] = processString(val);
    } else {
      processed[k] = val;
    }
  }

  return {
    ...processed,
    locale: normLocale
  };
}

module.exports = {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  normalizeEmailLocale,
  getLocalizedEmailUrl,
  getEmailContent,
  EMAIL_TRANSLATIONS
};
