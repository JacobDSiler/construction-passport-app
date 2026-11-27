// Second languages offered next to English. `name` is how the language writes its own name.
export const LANGUAGES = [
  { code: 'ro', name: 'Română', english: 'Romanian' },
  { code: 'pl', name: 'Polski', english: 'Polish' },
  { code: 'lt', name: 'Lietuvių', english: 'Lithuanian' },
  { code: 'uk', name: 'Українська', english: 'Ukrainian' },
  { code: 'ru', name: 'Русский', english: 'Russian' },
  { code: 'pt', name: 'Português', english: 'Portuguese' },
  { code: 'fr', name: 'Français', english: 'French' },
  { code: 'it', name: 'Italiano', english: 'Italian' },
  { code: 'es', name: 'Español', english: 'Spanish' },
  { code: 'ga', name: 'Gaeilge', english: 'Irish' },
  { code: 'fil', name: 'Filipino', english: 'Filipino' },
] as const;
export type LangCode = (typeof LANGUAGES)[number]['code'];
