const DEFAULT_LANGUAGE = 'en';

const i18nTable = await fetch(new URL('./i18n.json', import.meta.url).toString()).then(r => r.json());
export default (key) => {
  const lang = [...navigator.languages, DEFAULT_LANGUAGE].find(l => i18nTable[key][l]);
  return i18nTable[key][lang];
};
