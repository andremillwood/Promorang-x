import { CREATE_INTENTS, type CreateIntent } from '@promorang/shared';

export function mobileCreateHref(intent: CreateIntent, href: string) {
  if (intent === 'post') return '/post?intent=post';
  if (intent === 'answer') return '/post?intent=answer';
  if (href.startsWith('/create/moment')) return `/studio/create-moment?intent=${intent}`;
  if (href.startsWith('/give')) return href;
  if (href.startsWith('/people')) return href;
  if (href.startsWith('/missions')) return '/post?intent=post';
  return href;
}

export { CREATE_INTENTS };
