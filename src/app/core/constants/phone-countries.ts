/** Dial codes for booking phone field (name + ISO + E.164 country code). */
export interface PhoneCountry {
  name: string;
  iso: string;
  dial: string;
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { name: 'Sri Lanka', iso: 'LK', dial: '+94' },
  { name: 'United Kingdom', iso: 'GB', dial: '+44' },
  { name: 'United States', iso: 'US', dial: '+1' },
  { name: 'Canada', iso: 'CA', dial: '+1' },
  { name: 'Australia', iso: 'AU', dial: '+61' },
  { name: 'Germany', iso: 'DE', dial: '+49' },
  { name: 'France', iso: 'FR', dial: '+33' },
  { name: 'Netherlands', iso: 'NL', dial: '+31' },
  { name: 'Belgium', iso: 'BE', dial: '+32' },
  { name: 'Switzerland', iso: 'CH', dial: '+41' },
  { name: 'Austria', iso: 'AT', dial: '+43' },
  { name: 'Italy', iso: 'IT', dial: '+39' },
  { name: 'Spain', iso: 'ES', dial: '+34' },
  { name: 'Portugal', iso: 'PT', dial: '+351' },
  { name: 'Ireland', iso: 'IE', dial: '+353' },
  { name: 'Sweden', iso: 'SE', dial: '+46' },
  { name: 'Norway', iso: 'NO', dial: '+47' },
  { name: 'Denmark', iso: 'DK', dial: '+45' },
  { name: 'Finland', iso: 'FI', dial: '+358' },
  { name: 'Poland', iso: 'PL', dial: '+48' },
  { name: 'Czechia', iso: 'CZ', dial: '+420' },
  { name: 'Hungary', iso: 'HU', dial: '+36' },
  { name: 'Romania', iso: 'RO', dial: '+40' },
  { name: 'Greece', iso: 'GR', dial: '+30' },
  { name: 'Turkey', iso: 'TR', dial: '+90' },
  { name: 'Russia', iso: 'RU', dial: '+7' },
  { name: 'Ukraine', iso: 'UA', dial: '+380' },
  { name: 'India', iso: 'IN', dial: '+91' },
  { name: 'Pakistan', iso: 'PK', dial: '+92' },
  { name: 'Bangladesh', iso: 'BD', dial: '+880' },
  { name: 'Nepal', iso: 'NP', dial: '+977' },
  { name: 'Maldives', iso: 'MV', dial: '+960' },
  { name: 'China', iso: 'CN', dial: '+86' },
  { name: 'Japan', iso: 'JP', dial: '+81' },
  { name: 'South Korea', iso: 'KR', dial: '+82' },
  { name: 'Hong Kong', iso: 'HK', dial: '+852' },
  { name: 'Singapore', iso: 'SG', dial: '+65' },
  { name: 'Malaysia', iso: 'MY', dial: '+60' },
  { name: 'Thailand', iso: 'TH', dial: '+66' },
  { name: 'Indonesia', iso: 'ID', dial: '+62' },
  { name: 'Philippines', iso: 'PH', dial: '+63' },
  { name: 'Vietnam', iso: 'VN', dial: '+84' },
  { name: 'United Arab Emirates', iso: 'AE', dial: '+971' },
  { name: 'Saudi Arabia', iso: 'SA', dial: '+966' },
  { name: 'Qatar', iso: 'QA', dial: '+974' },
  { name: 'Kuwait', iso: 'KW', dial: '+965' },
  { name: 'Bahrain', iso: 'BH', dial: '+973' },
  { name: 'Oman', iso: 'OM', dial: '+968' },
  { name: 'Israel', iso: 'IL', dial: '+972' },
  { name: 'South Africa', iso: 'ZA', dial: '+27' },
  { name: 'Egypt', iso: 'EG', dial: '+20' },
  { name: 'Kenya', iso: 'KE', dial: '+254' },
  { name: 'Nigeria', iso: 'NG', dial: '+234' },
  { name: 'Morocco', iso: 'MA', dial: '+212' },
  { name: 'Brazil', iso: 'BR', dial: '+55' },
  { name: 'Argentina', iso: 'AR', dial: '+54' },
  { name: 'Chile', iso: 'CL', dial: '+56' },
  { name: 'Mexico', iso: 'MX', dial: '+52' },
  { name: 'New Zealand', iso: 'NZ', dial: '+64' },
];

export const DEFAULT_PHONE_COUNTRY =
  PHONE_COUNTRIES.find((c) => c.iso === 'LK') ?? PHONE_COUNTRIES[0];

/** Build display/API phone like "+94 714293585". */
export function formatInternationalPhone(dial: string, nationalNumber: string): string {
  const code = dial.trim();
  const digits = nationalNumber.replace(/\D/g, '');
  if (!digits) return '';
  return `${code} ${digits}`.trim();
}
