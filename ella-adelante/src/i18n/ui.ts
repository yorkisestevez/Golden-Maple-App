// Site chrome copy in both languages. UI follows the language toggle;
// article bodies stay in their native language.
//
// Spanish is written Dominican-natural (tú, not vosotros).

export type Lang = 'es' | 'en';

export const DEFAULT_LANG: Lang = 'es';

export const SITE_NAME = 'Ella Adelante';

export const TAGLINE = {
  es: 'Historias, herramientas y voz para la mujer que avanza.',
  en: 'Stories, tools, and voice for the woman moving forward.',
} as const;

// Pillars — slug, label and one-line mission per language.
export const PILLARS = {
  historias: {
    href: '/historias',
    label: { es: 'Historias', en: 'Stories' },
    mission: {
      es: 'Perfiles de mujeres dominicanas y latinas que están construyendo algo real.',
      en: 'Profiles of Dominican and Latina women building something real.',
    },
  },
  dinero: {
    href: '/dinero',
    label: { es: 'Dinero y Trabajo', en: 'Money & Work' },
    mission: {
      es: 'Educación financiera y emprendimiento, sin paños tibios ni promesas vacías.',
      en: 'Financial literacy and entrepreneurship — straight talk, no empty promises.',
    },
  },
  voz: {
    href: '/voz',
    label: { es: 'Voz', en: 'Voice' },
    mission: {
      es: 'Ensayos sobre cultura, machismo, identidad y ambición. Lo que pensamos en voz alta.',
      en: 'Essays on culture, machismo, identity, and ambition. What we think out loud.',
    },
  },
  herramientas: {
    href: '/herramientas',
    label: { es: 'Herramientas', en: 'Tools' },
    mission: {
      es: 'Guías, plantillas y recursos que puedes usar hoy, no algún día.',
      en: 'Guides, templates, and resources you can use today, not someday.',
    },
  },
} as const;

export type PillarKey = keyof typeof PILLARS;

export const ui = {
  es: {
    'nav.home': 'Inicio',
    'nav.about': 'Sobre nosotras',
    'nav.contact': 'Contacto',
    'nav.menu': 'Menú',
    'nav.close': 'Cerrar',
    'lang.toggle': 'Ver en inglés',
    'lang.label': 'Idioma',
    'lang.es': 'Español',
    'lang.en': 'English',
    'lang.filter.all': 'Todo',
    'home.featured': 'Historia destacada',
    'home.latest': 'Lo más reciente',
    'home.byPillar': 'Por sección',
    'home.viewAll': 'Ver toda la sección',
    'home.readStory': 'Leer la historia',
    'post.by': 'Por',
    'post.readingTime': 'min de lectura',
    'post.published': 'Publicado el',
    'post.updated': 'Actualizado el',
    'post.share': 'Compartir',
    'post.shareWhatsApp': 'Compartir por WhatsApp',
    'post.shareFacebook': 'Compartir en Facebook',
    'post.shareX': 'Compartir en X',
    'post.shareCopy': 'Copiar enlace',
    'post.shareCopied': '¡Enlace copiado!',
    'post.related': 'Sigue leyendo',
    'post.sample': 'Contenido de muestra',
    'post.readOther': 'Leer en inglés',
    'newsletter.title': 'No te pierdas nada',
    'newsletter.body':
      'Una vez por semana: historias, herramientas y voz directo a tu correo. Sin relleno.',
    'newsletter.placeholder': 'tu@correo.com',
    'newsletter.cta': 'Suscribirme',
    'newsletter.consent': 'Te escribimos solo a ti. Cancela cuando quieras.',
    'contact.title': 'Hablemos',
    'contact.intro':
      '¿Tienes una historia, una idea o quieres colaborar con nosotras? Cuéntanos. Leemos cada mensaje.',
    'contact.name': 'Nombre',
    'contact.email': 'Correo',
    'contact.type': '¿De qué se trata?',
    'contact.type.pitch': 'Quiero proponer un artículo',
    'contact.type.collab': 'Colaboración o alianza',
    'contact.type.other': 'Otro',
    'contact.message': 'Tu mensaje',
    'contact.pitchHint':
      'Si vas a proponer un artículo: dinos de qué trata en dos líneas, por qué importa ahora y a qué sección pertenece.',
    'contact.send': 'Enviar',
    'contact.success': '¡Gracias! Recibimos tu mensaje y te respondemos pronto.',
    'footer.follow': 'Síguenos',
    'footer.sections': 'Secciones',
    'footer.about': 'La plataforma',
    'footer.rights': 'Todos los derechos reservados.',
    'footer.madeIn': 'Hecho en República Dominicana.',
    'footer.rss': 'Suscríbete por RSS',
    'ribbon.es': 'ES',
    'ribbon.en': 'EN',
    'ribbon.bilingual': 'ES + EN',
    'a11y.skip': 'Saltar al contenido',
    '404.title': 'No encontramos esta página',
    '404.body': 'Puede que el enlace haya cambiado. Vuelve al inicio y sigue leyendo.',
    '404.cta': 'Volver al inicio',
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',
    'nav.close': 'Close',
    'lang.toggle': 'Ver en español',
    'lang.label': 'Language',
    'lang.es': 'Español',
    'lang.en': 'English',
    'lang.filter.all': 'All',
    'home.featured': 'Featured story',
    'home.latest': 'Latest',
    'home.byPillar': 'By section',
    'home.viewAll': 'See the whole section',
    'home.readStory': 'Read the story',
    'post.by': 'By',
    'post.readingTime': 'min read',
    'post.published': 'Published',
    'post.updated': 'Updated',
    'post.share': 'Share',
    'post.shareWhatsApp': 'Share on WhatsApp',
    'post.shareFacebook': 'Share on Facebook',
    'post.shareX': 'Share on X',
    'post.shareCopy': 'Copy link',
    'post.shareCopied': 'Link copied!',
    'post.related': 'Keep reading',
    'post.sample': 'Sample content',
    'post.readOther': 'Read in Spanish',
    'newsletter.title': "Don't miss a thing",
    'newsletter.body':
      'Once a week: stories, tools, and voice straight to your inbox. No filler.',
    'newsletter.placeholder': 'you@email.com',
    'newsletter.cta': 'Subscribe',
    'newsletter.consent': 'We only write to you. Unsubscribe anytime.',
    'contact.title': "Let's talk",
    'contact.intro':
      'Have a story, an idea, or want to work with us? Tell us. We read every message.',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.type': "What's this about?",
    'contact.type.pitch': 'I want to pitch a piece',
    'contact.type.collab': 'Collaboration or partnership',
    'contact.type.other': 'Something else',
    'contact.message': 'Your message',
    'contact.pitchHint':
      "If you're pitching: tell us what it's about in two lines, why it matters now, and which section it fits.",
    'contact.send': 'Send',
    'contact.success': 'Thank you! We got your message and will reply soon.',
    'footer.follow': 'Follow us',
    'footer.sections': 'Sections',
    'footer.about': 'The platform',
    'footer.rights': 'All rights reserved.',
    'footer.madeIn': 'Made in the Dominican Republic.',
    'footer.rss': 'Subscribe via RSS',
    'ribbon.es': 'ES',
    'ribbon.en': 'EN',
    'ribbon.bilingual': 'ES + EN',
    'a11y.skip': 'Skip to content',
    '404.title': "We couldn't find this page",
    '404.body': 'The link may have changed. Head back home and keep reading.',
    '404.cta': 'Back to home',
  },
} as const;

export function t(lang: Lang) {
  return function translate(key: keyof (typeof ui)['es']): string {
    return ui[lang][key] ?? ui[DEFAULT_LANG][key];
  };
}

// Social + contact constants — swap for the real accounts at launch.
export const SOCIAL = {
  instagram: 'https://instagram.com/ellaadelante',
  instagramHandle: '@ellaadelante',
  email: 'hola@ellaadelante.do',
} as const;
