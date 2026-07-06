const STATE_NAMES: Record<string, { en: string; ru: string }> = {
  NC: { en: 'North Carolina', ru: 'Северная Каролина' },
  SC: { en: 'South Carolina', ru: 'Южная Каролина' },
};

export function getStateName(state: string, locale: 'en' | 'ru'): string {
  return STATE_NAMES[state]?.[locale] ?? state;
}

export function interpolate(
  template: string,
  vars: Record<string, string>
): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template
  );
}

export const CITY_SERVICE_KEYS = [
  'weddings',
  'corporate',
  'private',
  'stpatricks',
] as const;

export const CITY_WHY_KEYS = ['authentic', 'premium', 'flexible', 'insured'] as const;
