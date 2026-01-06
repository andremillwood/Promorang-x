import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    common: {
      language: {
        select: 'Select Language'
      }
    }
  },
  es: {
    common: {
      language: {
        select: 'Seleccionar Idioma'
      }
    }
  },
  fr: {
    common: {
      language: {
        select: 'Sélectionner la Langue'
      }
    }
  },
  de: {
    common: {
      language: {
        select: 'Sprache Auswählen'
      }
    }
  },
  it: {
    common: {
      language: {
        select: 'Seleziona Lingua'
      }
    }
  },
  pt: {
    common: {
      language: {
        select: 'Selecionar Idioma'
      }
    }
  },
  ja: {
    common: {
      language: {
        select: '言語を選択'
      }
    }
  },
  ko: {
    common: {
      language: {
        select: '언어 선택'
      }
    }
  },
  zh: {
    common: {
      language: {
        select: '选择语言'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
