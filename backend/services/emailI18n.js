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
      ctaText: 'View Your Ticket Pass',
      footerNote: 'Save your ticket to your phone for quick check-in at the venue.'
    },
    eventReminder: {
      subject: 'Reminder: {{momentTitle}} is coming up!',
      title: 'Upcoming Moment Reminder',
      preheader: '{{momentTitle}} starts soon.',
      greeting: 'Hi {{name}},',
      intro: 'Just a reminder that <strong>{{momentTitle}}</strong> is happening soon. Get ready for an unforgettable experience!',
      ctaText: 'View Moment Details',
      footerNote: 'Check the location, dress code, and arrival instructions in your ticket pass.'
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
      ctaText: 'Ver Pase de Entrada',
      footerNote: 'Guarda tu entrada en tu teléfono para un acceso ágil al llegar al recinto.'
    },
    eventReminder: {
      subject: 'Recordatorio: ¡{{momentTitle}} es muy pronto!',
      title: 'Recordatorio de Momento',
      preheader: '{{momentTitle}} comenzará pronto.',
      greeting: 'Hola {{name}},',
      intro: 'Te recordamos que <strong>{{momentTitle}}</strong> ocurrirá pronto. ¡Prepárate para una gran experiencia!',
      ctaText: 'Ver Detalles del Momento',
      footerNote: 'Revisa la ubicación y las instrucciones de llegada en tu pase digital.'
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
      ctaText: 'Ver Passe do Ingresso',
      footerNote: 'Salve seu ingresso no celular para agilizar o check-in na entrada.'
    },
    eventReminder: {
      subject: 'Lembrete: {{momentTitle}} acontecerá em breve!',
      title: 'Lembrete do Momento',
      preheader: '{{momentTitle}} começará em breve.',
      greeting: 'Olá {{name}},',
      intro: 'Passando para lembrar que <strong>{{momentTitle}}</strong> vai acontecer em breve. Prepare-se para uma experiência marcante!',
      ctaText: 'Ver Detalhes do Momento',
      footerNote: 'Consulte o endereço e as instruções de chegada no seu passe digital.'
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
  getLocalizedEmailUrl,
  getEmailContent,
  EMAIL_TRANSLATIONS
};
