import { Language } from './translations';

/**
 * Returns the current language with Urdu as the default
 * @param selectedLanguage The selected language from context
 * @returns The language to use, defaulting to Urdu if no selection is made
 */
export const getDefaultLanguage = (selectedLanguage: string | null): Language => {
    return (selectedLanguage || 'اردو') as Language;
}; 