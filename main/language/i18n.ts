import { I18n } from 'i18n-js';
import en from './en.json';
import mm from './mm.json';
export const i18n = new I18n({
  ...en,
  ...mm
});
i18n.defaultLocale = 'en';
i18n.enableFallback = true;
i18n.translations = { en, mm };

export default i18n;