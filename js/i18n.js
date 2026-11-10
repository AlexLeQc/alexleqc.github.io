// Traduction FR/EN. Le HTML contient le français; on remplace au besoin.
// data-i18n="clé"        → texte
// data-i18n-html="clé"   → HTML (liens, gras, listes)
// data-i18n-attr="attr:clé;attr2:clé2" → attributs (alt, title, aria-label...)
const I18n = (() => {
  const base = document.body.dataset.base || "";
  const translations = {};
  let current = "fr";

  function readStoredLang() {
    try {
      return localStorage.getItem("lang");
    } catch (e) {
      return null;
    }
  }

  function storeLang(lang) {
    try {
      localStorage.setItem("lang", lang);
    } catch (e) {
      /* stockage indisponible : on ignore */
    }
  }

  async function load(lang) {
    if (translations[lang]) return translations[lang];
    const res = await fetch(`${base}locales/${lang}.json`);
    translations[lang] = await res.json();
    return translations[lang];
  }

  function t(key) {
    return key.split(".").reduce((o, k) => (o ? o[k] : undefined), translations[current]);
  }

  function apply() {
    document.documentElement.lang = current;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = t(el.dataset.i18n);
      if (typeof v === "string") el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const v = t(el.dataset.i18nHtml);
      if (typeof v === "string") el.innerHTML = v;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":");
        const v = t(key);
        if (typeof v === "string") el.setAttribute(attr, v);
      });
    });
    document.querySelectorAll(".js-cv").forEach((el) => {
      const href = el.getAttribute(`data-cv-${current}`);
      if (href) el.setAttribute("href", href);
    });
  }

  async function setLang(lang) {
    try {
      await load(lang);
    } catch (e) {
      console.error("Traduction introuvable :", lang, e);
      return;
    }
    current = lang;
    storeLang(lang);
    apply();
  }

  function init() {
    const params = new URLSearchParams(location.search);
    const wanted = params.get("lang") || readStoredLang();
    if (wanted === "en") setLang("en");
  }

  return { init, setLang, t, get current() { return current; } };
})();

document.addEventListener("DOMContentLoaded", I18n.init);
