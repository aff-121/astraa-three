/**
 * Phone Number Validation Utilities
 * 
 * Implements E.164 format validation for phone numbers.
 * E.164 is the international telephone numbering plan that ensures
 * phone numbers are globally unique and properly formatted.
 * 
 * Format: +[country code][subscriber number]
 * Example: +919961491824 (India)
 * 
 * @see https://en.wikipedia.org/wiki/E.164
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string | null;
  error: string | null;
  countryCode: string | null;
  nationalNumber: string | null;
}

/**
 * Supported country configurations
 * Add more countries as needed
 */
const COUNTRY_CONFIG = {
  IN: {
    code: '+91',
    name: 'India',
    // Indian mobile numbers: 10 digits, starting with 6, 7, 8, or 9
    pattern: /^[6-9]\d{9}$/,
    length: 10,
    example: '9961491824',
  },
  // Add more countries as needed:
  // US: { code: '+1', pattern: /^[2-9]\d{9}$/, length: 10 },
} as const;

type CountryCode = keyof typeof COUNTRY_CONFIG;

/**
 * Validate and format a phone number to E.164 format
 * 
 * @param phone - The phone number to validate (with or without country code)
 * @param countryCode - Default country code (default: 'IN' for India)
 * @returns Validation result with formatted number or error
 * 
 * @example
 * validatePhone('9961491824', 'IN')
 * // { isValid: true, formatted: '+919961491824', ... }
 * 
 * validatePhone('+919961491824')
 * // { isValid: true, formatted: '+919961491824', ... }
 * 
 * validatePhone('1234567890', 'IN')
 * // { isValid: false, error: 'Invalid Indian mobile number...', ... }
 */
export function validatePhone(
  phone: string,
  countryCode: CountryCode = 'IN'
): PhoneValidationResult {
  // Remove all non-digit characters except leading +
  let cleaned = phone.trim();
  const hasPlus = cleaned.startsWith('+');
  cleaned = cleaned.replace(/\D/g, '');
  
  // If empty after cleaning
  if (!cleaned) {
    return {
      isValid: false,
      formatted: null,
      error: 'Phone number is required',
      countryCode: null,
      nationalNumber: null,
    };
  }
  
  const config = COUNTRY_CONFIG[countryCode];
  const countryDigits = config.code.replace('+', '');
  
  let nationalNumber: string;
  
  // Handle different input formats
  if (hasPlus || cleaned.startsWith(countryDigits)) {
    // Already has country code (e.g., +919961491824 or 919961491824)
    if (cleaned.startsWith(countryDigits)) {
      nationalNumber = cleaned.slice(countryDigits.length);
    } else {
      // Has + but different country code - reject for now
      return {
        isValid: false,
        formatted: null,
        error: `Only ${config.name} phone numbers (+${countryDigits}) are supported`,
        countryCode: null,
        nationalNumber: null,
      };
    }
  } else {
    // No country code, use as national number
    nationalNumber = cleaned;
  }
  
  // Validate length
  if (nationalNumber.length !== config.length) {
    return {
      isValid: false,
      formatted: null,
      error: `Phone number must be exactly ${config.length} digits`,
      countryCode: null,
      nationalNumber: null,
    };
  }
  
  // Validate pattern (Indian numbers must start with 6, 7, 8, or 9)
  if (!config.pattern.test(nationalNumber)) {
    return {
      isValid: false,
      formatted: null,
      error: `Invalid ${config.name} mobile number. Must start with 6, 7, 8, or 9`,
      countryCode: null,
      nationalNumber: null,
    };
  }
  
  // Format to E.164
  const formatted = `${config.code}${nationalNumber}`;
  
  return {
    isValid: true,
    formatted,
    error: null,
    countryCode: config.code,
    nationalNumber,
  };
}

/**
 * Quick validation check without full result object
 */
export function isValidPhone(phone: string, countryCode: CountryCode = 'IN'): boolean {
  return validatePhone(phone, countryCode).isValid;
}

/**
 * Format phone for display (with spaces for readability)
 * 
 * @example
 * formatPhoneDisplay('+919961491824')
 * // '+91 99614 91824'
 */
export function formatPhoneDisplay(phone: string): string {
  const result = validatePhone(phone);
  if (!result.isValid || !result.nationalNumber) {
    return phone;
  }
  
  // Format as: +91 XXXXX XXXXX
  const nat = result.nationalNumber;
  return `${result.countryCode} ${nat.slice(0, 5)} ${nat.slice(5)}`;
}

/**
 * Validate E.164 format strictly
 * Used for final validation before API calls
 * 
 * @example
 * isValidE164('+919961491824') // true
 * isValidE164('9961491824')    // false (missing +91)
 * isValidE164('+91 9961491824') // false (has space)
 */
export function isValidE164(phone: string): boolean {
  // E.164: + followed by 1-15 digits, no spaces
  const e164Pattern = /^\+[1-9]\d{1,14}$/;
  
  if (!e164Pattern.test(phone)) {
    return false;
  }
  
  // Additional validation for supported countries
  if (phone.startsWith('+91')) {
    const national = phone.slice(3);
    return COUNTRY_CONFIG.IN.pattern.test(national);
  }
  
  // For unsupported countries, just check basic E.164 format
  return true;
}

/**
 * Sanitize user input to digits only (for controlled input)
 * 
 * @example
 * sanitizePhoneInput('(996) 149-1824') // '9961491824'
 * sanitizePhoneInput('+91 9961 491824') // '919961491824'
 */
export function sanitizePhoneInput(input: string, maxLength: number = 10): string {
  return input.replace(/\D/g, '').slice(0, maxLength);
}
