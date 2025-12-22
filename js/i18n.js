// js/i18n.js
class I18n {
  constructor() {
    this.currentLang = 'fr';
    this.translations = {};
  }

  async loadLanguage(lang) {
    try {
      const response = await fetch(`locales/${lang}.json`);
      this.translations[lang] = await response.json();
    } catch (error) {
      console.error(`Error loading language ${lang}:`, error);
    }
  }

  async init() {
    await this.loadLanguage('fr');
    await this.loadLanguage('en');
    this.applyTranslations();
  }

  switchLanguage(lang) {
    this.currentLang = lang;
    document.documentElement.lang = lang;
    this.applyTranslations();

    const langToggle = document.getElementById('lang-toggle');
    langToggle.textContent = lang === 'fr' ? 'EN' : 'FR';
    langToggle.setAttribute('data-lang', lang === 'fr' ? 'en' : 'fr');
    langToggle.title = this.t('lang.switchTo');
  }

  t(key) {
    const keys = key.split('.');
    let value = this.translations[this.currentLang];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  }

  applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);

      if (translation) {
        if (element.classList.contains('bio')) {
          element.innerHTML = translation.replace(
            'Université de Sherbrooke',
            '<a href="https://www.usherbrooke.ca/genie" target="_blank" rel="noopener noreferrer">Université de Sherbrooke</a>'
          );
        } else if (element.classList.contains('experience-description')) {
          element.innerHTML = translation.replace(/\n/g, '<br>');
        } else {
          element.textContent = translation;
        }
      }
    });
  }
}

const i18n = new I18n();
document.addEventListener('DOMContentLoaded', () => i18n.init());
