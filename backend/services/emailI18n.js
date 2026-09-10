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
 * Resolves a supported email locale from an Express request.
 * Prefer the UI header, then the saved locale cookie, then Accept-Language.
 * @param {import('express').Request | { headers?: Record<string, string> } | null | undefined} req
 * @returns {'en' | 'es-419' | 'pt-BR'}
 */
function localeFromRequest(req) {
  if (!req) return DEFAULT_LOCALE;
  const headers = req.headers || {};
  const header = headers['x-promorang-locale'] || headers['X-Promorang-Locale'];
  const cookieHeader = headers.cookie || headers.Cookie || '';
  const cookieMatch = String(cookieHeader).match(/(?:^|;\s*)promorang_locale=([^;]+)/i);
  const cookieLocale = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
  const accept = headers['accept-language'] || headers['Accept-Language'];
  const acceptPrimary = typeof accept === 'string' ? accept.split(',')[0] : accept;
  return normalizeEmailLocale(header || cookieLocale || acceptPrimary);
}

function htmlLangForLocale(locale) {
  const norm = normalizeEmailLocale(locale);
  if (norm === 'es-419') return 'es';
  if (norm === 'pt-BR') return 'pt-BR';
  return 'en';
}

function formatEmailDate(value, locale, options) {
  const norm = normalizeEmailLocale(locale);
  const intl = norm === 'es-419' ? 'es-419' : norm === 'pt-BR' ? 'pt-BR' : 'en-US';
  return new Date(value).toLocaleString(intl, options);
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
      footerNote: 'Your earnings are ready in your wallet balance.'
    },
    kycApproved: {
      subject: 'Identity Verified — Full Access Unlocked — Promorang',
      title: 'KYC Verification Approved',
      preheader: 'Your identity has been successfully verified.',
      greeting: 'Hi {{name}},',
      intro: 'Your identity verification (KYC) has been successfully approved! All account features, high-tier drops, and payouts are now fully unlocked.',
      ctaText: 'Go to Wallet',
      footerNote: 'Thank you for helping keep Promorang a verified and secure platform for everyone.'
    },
    ticketPurchase: {
      subject: 'Your Ticket Confirmation — {{momentTitle}}',
      title: 'Ticket Confirmed',
      preheader: "You're attending {{momentTitle}}!",
      greeting: 'Hi {{name}},',
      intro: 'Your ticket for <strong>{{momentTitle}}</strong> is confirmed. Show your digital pass at the entrance.',
      confirmedLead: 'Your ticket has been confirmed!',
      tierLabel: 'Tier',
      codeLabel: 'Your activation code (show at entry)',
      dateLabel: 'Date',
      locationLabel: 'Location',
      ctaText: 'View Your Ticket Pass',
      footerNote: 'Save your ticket to your phone for quick check-in at the venue.'
    },
    eventReminder: {
      subject: 'Reminder: {{momentTitle}} is coming up!',
      title: 'Upcoming Moment Reminder',
      preheader: '{{momentTitle}} starts soon.',
      greeting: 'Hi {{name}},',
      intro: 'Just a reminder that <strong>{{momentTitle}}</strong> is happening soon. Get ready for an unforgettable experience!',
      tomorrowLead: 'Just a reminder – your event is <strong>tomorrow</strong>!',
      bringCode: 'Make sure to bring your activation code for entry!',
      ctaText: 'View Moment Details',
      footerNote: 'Check the location, dress code, and arrival instructions in your ticket pass.'
    },
    dropRejected: {
      subject: 'Application Update: {{dropTitle}}',
      title: 'Application Update',
      preheader: 'Your application for "{{dropTitle}}" was not approved this time.',
      greeting: 'Hi {{name}},',
      intro: 'Unfortunately, your application for "<strong>{{dropTitle}}</strong>" was not approved this time.',
      feedbackLabel: 'Feedback',
      moreDrops: "Don't worry – there are plenty more opportunities! Check out other available Drops and try again.",
      ctaText: 'Browse More Drops',
      footerNote: 'Each rejection is a step closer to your next approval!'
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
    supportTicket: {
      subject: 'Support Ticket #{{ticketId}}: {{ticketSubject}}',
      title: 'Support Ticket Created',
      preheader: 'We received your support request.',
      greeting: 'Hi {{name}},',
      intro: "We've received your support request:",
      ticketLabel: 'Ticket ID',
      categoryLabel: 'Category',
      subjectLabel: 'Subject',
      sla: 'Our team will review your request and get back to you soon. Most tickets are resolved within 24-48 hours.',
      ctaText: 'View Ticket',
      textSla: "We'll respond within 24-48 hours."
    },
    aftrHrsPass: {
      subject: 'Your AftrHrs pass is ready — every Friday at Sea Deck',
      title: 'Your AftrHrs pass is ready',
      preheader: 'Your AftrHrs Digital Free Pass is ready.',
      greeting: 'Hi {{name}},',
      cadence: 'Every Friday · 10:00 PM until · Sea Deck',
      lead: 'Open your pass, then show the QR at Sea Deck. Use the same Promorang account you claimed with.',
      passLabel: 'Digital Free Pass',
      showCode: 'Show this code or the QR from your pass at the door.',
      freeEntry: 'Free entry',
      arrive: 'Arrive before 11:30 PM to get in free.',
      venue: 'Every Friday from 10:00 PM at Sea Deck, Orchid Village, 20 Barbican Road, Kingston.',
      origin: 'Origin: Alric & Boyd · Afro House, Classic House, House Fusion.',
      ctaText: 'Open my pass',
      signInNote: 'If you are asked to sign in, use the same account.',
      viewAftrHrs: 'View AftrHrs',
      powered: 'Powered by PROMORANG'
    },
    aftrHrsRsvp: {
      subject: 'You are on the AftrHrs list — every Friday at Sea Deck',
      title: 'You are on the AftrHrs list',
      preheader: 'You are on the AftrHrs list.',
      greeting: 'Hi {{name}},',
      cadence: 'Every Friday · 10:00 PM until · Sea Deck',
      lead: 'Thanks for joining AftrHrs at Sea Deck. Keep this note — free entry is time-bound.',
      passLabel: 'Digital Free Pass',
      showCode: 'Show this code or the QR from your pass at the door.',
      freeEntry: 'Free entry',
      arrive: 'Arrive before 11:30 PM to get in free.',
      venue: 'Every Friday from 10:00 PM at Sea Deck, Orchid Village, 20 Barbican Road, Kingston.',
      origin: 'Origin: Alric & Boyd · Afro House, Classic House, House Fusion.',
      ctaText: 'Open AftrHrs',
      signInNote: 'If you are asked to sign in, use the same account.',
      viewAftrHrs: 'View AftrHrs',
      powered: 'Powered by PROMORANG'
    },
    referralSignup: {
      subject: '{{referredName}} joined via your referral!',
      title: 'New referral',
      preheader: '{{referredName}} just joined using your referral link!',
      greeting: 'Hi {{name}},',
      intro: 'Great news! Someone just joined Promorang using your referral link:',
      whenActive: "When they become active, you'll earn a bonus!",
      keepSharing: 'Keep sharing your referral link to grow your network and earnings.',
      ctaText: 'View Referral Stats'
    },
    referralActivation: {
      subject: 'You earned {{gems}} Gems from your referral!',
      title: 'Referral bonus earned',
      preheader: 'You earned a bonus because {{referredName}} became active!',
      greeting: 'Hi {{name}},',
      intro: 'Your referral <strong>{{referredName}}</strong> has become an active user on Promorang!',
      bonusLabel: 'Activation Bonus',
      pointsLine: '+{{points}} Points',
      keepSharing: "You'll continue earning commissions from their activity. Keep sharing!",
      ctaText: 'View Earnings'
    },
    referralCommission: {
      subject: 'Commission: +{{amount}} Gems from {{referredName}}',
      title: 'Commission earned',
      preheader: 'You earned {{amount}} Gems from {{referredName}}.',
      greeting: 'Hi {{name}},',
      intro: "You just earned a commission from your referral's activity:",
      fromLabel: 'From',
      activityLabel: 'Activity',
      ctaText: 'View Wallet'
    },
    withdrawalRequested: {
      subject: 'Withdrawal request received: ${{amount}}',
      title: 'Withdrawal Request Received',
      preheader: 'Your withdrawal of ${{amount}} is being processed.',
      greeting: 'Hi {{name}},',
      intro: "We've received your withdrawal request and are processing it through our secure payment system.",
      amountLabel: 'Withdrawal Amount',
      via: 'via {{method}}',
      requestedLabel: 'Requested',
      methodLabel: 'Method',
      processingLabel: 'Processing Time',
      defaultEta: '1-3 business days',
      statusLabel: 'Status',
      pendingStatus: 'Pending Review',
      reviewNote: "You'll receive a confirmation email once the transfer has been initiated. For security, all withdrawals are reviewed by our team.",
      ctaText: 'View Withdrawal Status'
    },
    withdrawalCompleted: {
      subject: 'Withdrawal complete: ${{amount}}',
      title: 'Withdrawal Complete',
      preheader: 'Your ${{amount}} has been sent.',
      greeting: 'Hi {{name}},',
      intro: 'Your withdrawal has been processed and funds have been sent. The transfer is now complete.',
      completeLabel: 'Transfer Complete',
      sentVia: 'Sent via {{method}}',
      txLabel: 'Transaction ID',
      completedLabel: 'Completed',
      statusLabel: 'Status',
      completedStatus: 'Completed',
      thanks: 'Thank you for using Promorang. Your funds should appear in your account within the processing time for your selected payment method.',
      ctaText: 'View Transaction History',
      footerNote: 'Keep this email for your records. Contact support if you have any questions about this transaction.',
      na: 'N/A'
    },
    weeklyDigest: {
      subject: 'Weekly Summary: {{earned}} Rewards Earned',
      title: 'Your Weekly Summary',
      preheader: 'This week: {{earned}} rewards, {{gems}} Gems, {{streak}}-day streak.',
      greeting: 'Hi {{name}},',
      intro: "Here's your Promorang activity for this week:",
      rewardsLabel: 'Rewards Earned',
      gemsLabel: 'Total Gems',
      streakLabel: 'Day Streak',
      expiringLead: 'Action required: you have {{count}} reward(s) expiring soon!',
      keepUp: 'Keep up the great work and keep earning!',
      ctaText: 'View Dashboard'
    }
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
      footerNote: 'Tus ganancias están listas en el saldo de tu billetera.'
    },
    kycApproved: {
      subject: 'Identidad Verificada — Acceso Total Desbloqueado — Promorang',
      title: 'Verificación KYC Aprobada',
      preheader: 'Tu identidad ha sido verificada con éxito.',
      greeting: 'Hola {{name}},',
      intro: '¡Tu verificación de identidad (KYC) fue aprobada con éxito! Todas las funciones, drops premium y retiros ya están disponibles.',
      ctaText: 'Ir a mi Billetera',
      footerNote: 'Gracias por ayudarnos a mantener Promorang como una comunidad segura y confiable para todos.'
    },
    ticketPurchase: {
      subject: 'Confirmación de Entrada — {{momentTitle}}',
      title: 'Entrada Confirmada',
      preheader: '¡Asistirás a {{momentTitle}}!',
      greeting: 'Hola {{name}},',
      intro: 'Tu entrada para <strong>{{momentTitle}}</strong> está confirmada. Muestra tu pase digital en la entrada.',
      confirmedLead: '¡Tu entrada está confirmada!',
      tierLabel: 'Nivel',
      codeLabel: 'Tu código de activación (muéstralo en la entrada)',
      dateLabel: 'Fecha',
      locationLabel: 'Lugar',
      ctaText: 'Ver Pase de Entrada',
      footerNote: 'Guarda tu entrada en tu teléfono para un acceso ágil al llegar al recinto.'
    },
    eventReminder: {
      subject: 'Recordatorio: ¡{{momentTitle}} es muy pronto!',
      title: 'Recordatorio de Momento',
      preheader: '{{momentTitle}} comenzará pronto.',
      greeting: 'Hola {{name}},',
      intro: 'Te recordamos que <strong>{{momentTitle}}</strong> ocurrirá pronto. ¡Prepárate para una gran experiencia!',
      tomorrowLead: 'Te recordamos: tu evento es <strong>mañana</strong>.',
      bringCode: 'Lleva tu código de activación para entrar.',
      ctaText: 'Ver Detalles del Momento',
      footerNote: 'Revisa la ubicación y las instrucciones de llegada en tu pase digital.'
    },
    dropRejected: {
      subject: 'Actualización de solicitud: {{dropTitle}}',
      title: 'Actualización de solicitud',
      preheader: 'Tu postulación para "{{dropTitle}}" no fue aprobada esta vez.',
      greeting: 'Hola {{name}},',
      intro: 'Esta vez tu postulación para "<strong>{{dropTitle}}</strong>" no fue aprobada.',
      feedbackLabel: 'Comentarios',
      moreDrops: 'No te preocupes: hay más oportunidades. Revisa otros Drops disponibles e inténtalo de nuevo.',
      ctaText: 'Ver más Drops',
      footerNote: 'Cada no es un paso más cerca de la siguiente aprobación.'
    },
    securityAlert: {
      subject: 'Nuevo inicio de sesión en tu cuenta Promorang',
      title: 'Alerta de seguridad',
      preheader: 'Notamos un nuevo inicio de sesión en tu cuenta.',
      greeting: 'Hola {{name}},',
      intro: 'Notamos un nuevo acceso a tu cuenta de Promorang:',
      deviceLabel: 'Dispositivo',
      locationLabel: 'Ubicación',
      timeLabel: 'Hora',
      unknownDevice: 'Dispositivo desconocido',
      unknownLocation: 'Ubicación desconocida',
      ifYou: 'Si fuiste tú, no tienes que hacer nada.',
      ifNot: 'Si no reconoces esta actividad, protege tu cuenta de inmediato.',
      ctaText: 'Revisar seguridad de la cuenta'
    },
    supportTicket: {
      subject: 'Ticket de soporte #{{ticketId}}: {{ticketSubject}}',
      title: 'Ticket de soporte creado',
      preheader: 'Recibimos tu solicitud de soporte.',
      greeting: 'Hola {{name}},',
      intro: 'Recibimos tu solicitud de soporte:',
      ticketLabel: 'ID del ticket',
      categoryLabel: 'Categoría',
      subjectLabel: 'Asunto',
      sla: 'Nuestro equipo revisará tu solicitud y te responderá pronto. La mayoría de los tickets se resuelven en 24-48 horas.',
      ctaText: 'Ver ticket',
      textSla: 'Responderemos en 24-48 horas.'
    },
    aftrHrsPass: {
      subject: 'Tu pase de AftrHrs ya está listo — todos los viernes en Sea Deck',
      title: 'Tu pase de AftrHrs ya está listo',
      preheader: 'Tu Pase Digital Gratis de AftrHrs ya está listo.',
      greeting: 'Hola {{name}},',
      cadence: 'Todos los viernes · 10:00 PM hasta · Sea Deck',
      lead: 'Abre tu pase y muestra el QR en Sea Deck. Usa la misma cuenta de Promorang con la que lo reclamaste.',
      passLabel: 'Pase Digital Gratis',
      showCode: 'Muestra este código o el QR de tu pase en la puerta.',
      freeEntry: 'Entrada gratis',
      arrive: 'Llega antes de las 11:30 PM para entrar gratis.',
      venue: 'Todos los viernes desde las 10:00 PM en Sea Deck, Orchid Village, 20 Barbican Road, Kingston.',
      origin: 'Origin: Alric & Boyd · Afro House, Classic House, House Fusion.',
      ctaText: 'Abrir mi pase',
      signInNote: 'Si te piden iniciar sesión, usa la misma cuenta.',
      viewAftrHrs: 'Ver AftrHrs',
      powered: 'Con el poder de PROMORANG'
    },
    aftrHrsRsvp: {
      subject: 'Estás en la lista de AftrHrs — todos los viernes en Sea Deck',
      title: 'Estás en la lista de AftrHrs',
      preheader: 'Estás en la lista de AftrHrs.',
      greeting: 'Hola {{name}},',
      cadence: 'Todos los viernes · 10:00 PM hasta · Sea Deck',
      lead: 'Gracias por unirte a AftrHrs en Sea Deck. Guarda esta nota — la entrada gratis tiene horario.',
      passLabel: 'Pase Digital Gratis',
      showCode: 'Muestra este código o el QR de tu pase en la puerta.',
      freeEntry: 'Entrada gratis',
      arrive: 'Llega antes de las 11:30 PM para entrar gratis.',
      venue: 'Todos los viernes desde las 10:00 PM en Sea Deck, Orchid Village, 20 Barbican Road, Kingston.',
      origin: 'Origin: Alric & Boyd · Afro House, Classic House, House Fusion.',
      ctaText: 'Abrir AftrHrs',
      signInNote: 'Si te piden iniciar sesión, usa la misma cuenta.',
      viewAftrHrs: 'Ver AftrHrs',
      powered: 'Con el poder de PROMORANG'
    },
    referralSignup: {
      subject: '¡{{referredName}} se unió con tu referido!',
      title: 'Nuevo referido',
      preheader: '¡{{referredName}} acaba de entrar usando tu enlace de referido!',
      greeting: 'Hola {{name}},',
      intro: '¡Buena noticia! Alguien acaba de unirse a Promorang con tu enlace de referido:',
      whenActive: 'Cuando se activen, ganarás un bono.',
      keepSharing: 'Sigue compartiendo tu enlace para crecer tu red y tus ganancias.',
      ctaText: 'Ver estadísticas de referidos'
    },
    referralActivation: {
      subject: 'Ganaste {{gems}} Gemas por tu referido',
      title: 'Bono de referido ganado',
      preheader: 'Ganaste un bono porque {{referredName}} se activó.',
      greeting: 'Hola {{name}},',
      intro: 'Tu referido <strong>{{referredName}}</strong> ya es un usuario activo en Promorang.',
      bonusLabel: 'Bono de activación',
      pointsLine: '+{{points}} Puntos',
      keepSharing: 'Seguirás ganando comisiones por su actividad. ¡Sigue compartiendo!',
      ctaText: 'Ver ganancias'
    },
    referralCommission: {
      subject: 'Comisión: +{{amount}} Gemas de {{referredName}}',
      title: 'Comisión ganada',
      preheader: 'Ganaste {{amount}} Gemas de {{referredName}}.',
      greeting: 'Hola {{name}},',
      intro: 'Acabas de ganar una comisión por la actividad de tu referido:',
      fromLabel: 'De',
      activityLabel: 'Actividad',
      ctaText: 'Ver billetera'
    },
    withdrawalRequested: {
      subject: 'Solicitud de retiro recibida: ${{amount}}',
      title: 'Solicitud de retiro recibida',
      preheader: 'Tu retiro de ${{amount}} se está procesando.',
      greeting: 'Hola {{name}},',
      intro: 'Recibimos tu solicitud de retiro y la estamos procesando en nuestro sistema de pagos seguro.',
      amountLabel: 'Monto del retiro',
      via: 'vía {{method}}',
      requestedLabel: 'Solicitado',
      methodLabel: 'Método',
      processingLabel: 'Tiempo de procesamiento',
      defaultEta: '1-3 días hábiles',
      statusLabel: 'Estado',
      pendingStatus: 'Pendiente de revisión',
      reviewNote: 'Te enviaremos un correo cuando se inicie la transferencia. Por seguridad, todos los retiros los revisa el equipo.',
      ctaText: 'Ver estado del retiro'
    },
    withdrawalCompleted: {
      subject: 'Retiro completado: ${{amount}}',
      title: 'Retiro completado',
      preheader: 'Tus ${{amount}} ya se enviaron.',
      greeting: 'Hola {{name}},',
      intro: 'Tu retiro se procesó y los fondos ya se enviaron. La transferencia está completa.',
      completeLabel: 'Transferencia completa',
      sentVia: 'Enviado vía {{method}}',
      txLabel: 'ID de transacción',
      completedLabel: 'Completado',
      statusLabel: 'Estado',
      completedStatus: 'Completado',
      thanks: 'Gracias por usar Promorang. Los fondos deberían aparecer en tu cuenta según el tiempo de tu método de pago.',
      ctaText: 'Ver historial de transacciones',
      footerNote: 'Guarda este correo. Si tienes preguntas sobre esta transacción, contacta a soporte.',
      na: 'N/D'
    },
    weeklyDigest: {
      subject: 'Resumen semanal: {{earned}} recompensas ganadas',
      title: 'Tu resumen semanal',
      preheader: 'Esta semana: {{earned}} recompensas, {{gems}} Gemas, racha de {{streak}} días.',
      greeting: 'Hola {{name}},',
      intro: 'Así se movió tu semana en Promorang:',
      rewardsLabel: 'Recompensas ganadas',
      gemsLabel: 'Gemas totales',
      streakLabel: 'Racha de días',
      expiringLead: 'Acción requerida: tienes {{count}} recompensa(s) por vencer pronto.',
      keepUp: 'Sigue así y sigue ganando.',
      ctaText: 'Ver panel'
    }
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
      footerNote: 'Seus rendimentos já estão disponíveis no saldo da sua carteira.'
    },
    kycApproved: {
      subject: 'Identidade Verificada — Acesso Completo Liberado — Promorang',
      title: 'Verificação KYC Aprovada',
      preheader: 'Sua identidade foi verificada com sucesso.',
      greeting: 'Olá {{name}},',
      intro: 'Sua verificação de identidade (KYC) foi aprovada com sucesso! Todos os recursos, drops premium e saques estão liberados.',
      ctaText: 'Ir para a Carteira',
      footerNote: 'Obrigado por contribuir para manter o Promorang uma plataforma confiável e segura para todos.'
    },
    ticketPurchase: {
      subject: 'Confirmação do seu Ingresso — {{momentTitle}}',
      title: 'Ingresso Confirmado',
      preheader: 'Sua presença em {{momentTitle}} está confirmada!',
      greeting: 'Olá {{name}},',
      intro: 'Seu ingresso para <strong>{{momentTitle}}</strong> está confirmado. Apresente seu passe digital na entrada do local.',
      confirmedLead: 'Seu ingresso está confirmado!',
      tierLabel: 'Tipo',
      codeLabel: 'Seu código de ativação (mostre na entrada)',
      dateLabel: 'Data',
      locationLabel: 'Local',
      ctaText: 'Ver Passe do Ingresso',
      footerNote: 'Salve seu ingresso no celular para agilizar o check-in na entrada.'
    },
    eventReminder: {
      subject: 'Lembrete: {{momentTitle}} acontecerá em breve!',
      title: 'Lembrete do Momento',
      preheader: '{{momentTitle}} começará em breve.',
      greeting: 'Olá {{name}},',
      intro: 'Passando para lembrar que <strong>{{momentTitle}}</strong> vai acontecer em breve. Prepare-se para uma experiência marcante!',
      tomorrowLead: 'Lembrete: seu evento é <strong>amanhã</strong>!',
      bringCode: 'Leve seu código de ativação para entrar.',
      ctaText: 'Ver Detalhes do Momento',
      footerNote: 'Consulte o endereço e as instruções de chegada no seu passe digital.'
    },
    dropRejected: {
      subject: 'Atualização da inscrição: {{dropTitle}}',
      title: 'Atualização da inscrição',
      preheader: 'Sua inscrição para "{{dropTitle}}" não foi aprovada desta vez.',
      greeting: 'Olá {{name}},',
      intro: 'Desta vez sua inscrição para "<strong>{{dropTitle}}</strong>" não foi aprovada.',
      feedbackLabel: 'Feedback',
      moreDrops: 'Sem problema: há mais oportunidades. Veja outros Drops disponíveis e tente de novo.',
      ctaText: 'Ver mais Drops',
      footerNote: 'Cada não é um passo mais perto da próxima aprovação.'
    },
    securityAlert: {
      subject: 'Novo login na sua conta Promorang',
      title: 'Alerta de segurança',
      preheader: 'Notamos um novo login na sua conta.',
      greeting: 'Olá {{name}},',
      intro: 'Notamos um novo acesso à sua conta Promorang:',
      deviceLabel: 'Dispositivo',
      locationLabel: 'Local',
      timeLabel: 'Horário',
      unknownDevice: 'Dispositivo desconhecido',
      unknownLocation: 'Local desconhecido',
      ifYou: 'Se foi você, não precisa fazer nada.',
      ifNot: 'Se não reconhecer esta atividade, proteja sua conta agora.',
      ctaText: 'Revisar segurança da conta'
    },
    supportTicket: {
      subject: 'Chamado de suporte #{{ticketId}}: {{ticketSubject}}',
      title: 'Chamado de suporte criado',
      preheader: 'Recebemos o seu pedido de suporte.',
      greeting: 'Olá {{name}},',
      intro: 'Recebemos o seu pedido de suporte:',
      ticketLabel: 'ID do chamado',
      categoryLabel: 'Categoria',
      subjectLabel: 'Assunto',
      sla: 'Nossa equipe vai revisar o pedido e responder em breve. A maioria dos chamados se resolve em 24-48 horas.',
      ctaText: 'Ver chamado',
      textSla: 'Vamos responder em 24-48 horas.'
    },
    aftrHrsPass: {
      subject: 'Seu passe da AftrHrs está pronto — toda sexta no Sea Deck',
      title: 'Seu passe da AftrHrs está pronto',
      preheader: 'Seu Passe Digital Grátis da AftrHrs está pronto.',
      greeting: 'Olá {{name}},',
      cadence: 'Toda sexta · 22:00 até · Sea Deck',
      lead: 'Abra seu passe e mostre o QR no Sea Deck. Use a mesma conta Promorang com que você resgatou.',
      passLabel: 'Passe Digital Grátis',
      showCode: 'Mostre este código ou o QR do seu passe na porta.',
      freeEntry: 'Entrada grátis',
      arrive: 'Chegue antes das 23:30 para entrar de graça.',
      venue: 'Toda sexta a partir das 22:00 no Sea Deck, Orchid Village, 20 Barbican Road, Kingston.',
      origin: 'Origin: Alric & Boyd · Afro House, Classic House, House Fusion.',
      ctaText: 'Abrir meu passe',
      signInNote: 'Se pedirem para entrar, use a mesma conta.',
      viewAftrHrs: 'Ver AftrHrs',
      powered: 'Com o poder da PROMORANG'
    },
    aftrHrsRsvp: {
      subject: 'Você está na lista da AftrHrs — toda sexta no Sea Deck',
      title: 'Você está na lista da AftrHrs',
      preheader: 'Você está na lista da AftrHrs.',
      greeting: 'Olá {{name}},',
      cadence: 'Toda sexta · 22:00 até · Sea Deck',
      lead: 'Obrigado por entrar na AftrHrs no Sea Deck. Guarde esta nota — a entrada grátis tem horário.',
      passLabel: 'Passe Digital Grátis',
      showCode: 'Mostre este código ou o QR do seu passe na porta.',
      freeEntry: 'Entrada grátis',
      arrive: 'Chegue antes das 23:30 para entrar de graça.',
      venue: 'Toda sexta a partir das 22:00 no Sea Deck, Orchid Village, 20 Barbican Road, Kingston.',
      origin: 'Origin: Alric & Boyd · Afro House, Classic House, House Fusion.',
      ctaText: 'Abrir AftrHrs',
      signInNote: 'Se pedirem para entrar, use a mesma conta.',
      viewAftrHrs: 'Ver AftrHrs',
      powered: 'Com o poder da PROMORANG'
    },
    referralSignup: {
      subject: '{{referredName}} entrou pelo seu convite!',
      title: 'Nova indicação',
      preheader: '{{referredName}} acabou de entrar usando o seu link de indicação!',
      greeting: 'Olá {{name}},',
      intro: 'Boa notícia! Alguém acabou de entrar no Promorang com o seu link de indicação:',
      whenActive: 'Quando essa pessoa ficar ativa, você ganha um bônus.',
      keepSharing: 'Continue compartilhando seu link para crescer a rede e os ganhos.',
      ctaText: 'Ver estatísticas de indicações'
    },
    referralActivation: {
      subject: 'Você ganhou {{gems}} Gemas pela indicação!',
      title: 'Bônus de indicação ganhos',
      preheader: 'Você ganhou um bônus porque {{referredName}} ficou ativo.',
      greeting: 'Olá {{name}},',
      intro: 'Sua indicação <strong>{{referredName}}</strong> se tornou um usuário ativo no Promorang.',
      bonusLabel: 'Bônus de ativação',
      pointsLine: '+{{points}} Pontos',
      keepSharing: 'Você continua ganhando comissões pela atividade dessa pessoa. Continue compartilhando!',
      ctaText: 'Ver ganhos'
    },
    referralCommission: {
      subject: 'Comissão: +{{amount}} Gemas de {{referredName}}',
      title: 'Comissão ganha',
      preheader: 'Você ganhou {{amount}} Gemas de {{referredName}}.',
      greeting: 'Olá {{name}},',
      intro: 'Você acabou de ganhar uma comissão pela atividade da sua indicação:',
      fromLabel: 'De',
      activityLabel: 'Atividade',
      ctaText: 'Ver carteira'
    },
    withdrawalRequested: {
      subject: 'Pedido de saque recebido: ${{amount}}',
      title: 'Pedido de saque recebido',
      preheader: 'Seu saque de ${{amount}} está em processamento.',
      greeting: 'Olá {{name}},',
      intro: 'Recebemos o seu pedido de saque e estamos processando no nosso sistema seguro de pagamentos.',
      amountLabel: 'Valor do saque',
      via: 'via {{method}}',
      requestedLabel: 'Solicitado',
      methodLabel: 'Método',
      processingLabel: 'Prazo de processamento',
      defaultEta: '1-3 dias úteis',
      statusLabel: 'Status',
      pendingStatus: 'Em análise',
      reviewNote: 'Você recebe um e-mail quando a transferência for iniciada. Por segurança, todos os saques passam pela equipe.',
      ctaText: 'Ver status do saque'
    },
    withdrawalCompleted: {
      subject: 'Saque concluído: ${{amount}}',
      title: 'Saque concluído',
      preheader: 'Seus ${{amount}} já foram enviados.',
      greeting: 'Olá {{name}},',
      intro: 'Seu saque foi processado e os fundos já foram enviados. A transferência está concluída.',
      completeLabel: 'Transferência concluída',
      sentVia: 'Enviado via {{method}}',
      txLabel: 'ID da transação',
      completedLabel: 'Concluído',
      statusLabel: 'Status',
      completedStatus: 'Concluído',
      thanks: 'Obrigado por usar o Promorang. Os fundos devem aparecer na sua conta no prazo do método escolhido.',
      ctaText: 'Ver histórico de transações',
      footerNote: 'Guarde este e-mail. Se tiver dúvidas sobre esta transação, fale com o suporte.',
      na: 'N/D'
    },
    weeklyDigest: {
      subject: 'Resumo semanal: {{earned}} recompensas ganhas',
      title: 'Seu resumo semanal',
      preheader: 'Nesta semana: {{earned}} recompensas, {{gems}} Gemas, sequência de {{streak}} dias.',
      greeting: 'Olá {{name}},',
      intro: 'Assim foi a sua semana no Promorang:',
      rewardsLabel: 'Recompensas ganhas',
      gemsLabel: 'Gemas totais',
      streakLabel: 'Sequência de dias',
      expiringLead: 'Ação necessária: você tem {{count}} recompensa(s) prestes a expirar.',
      keepUp: 'Continue assim e continue ganhando.',
      ctaText: 'Ver painel'
    }
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
  localeFromRequest,
  htmlLangForLocale,
  formatEmailDate,
  getLocalizedEmailUrl,
  getEmailContent,
  EMAIL_TRANSLATIONS
};
