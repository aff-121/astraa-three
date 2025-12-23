/**
 * Normalize Indian phone numbers to E.164 format (+91XXXXXXXXXX)
 * Handles various input formats:
 * - 9876543210 → +919876543210
 * - 09876543210 → +919876543210
 * - +919876543210 → +919876543210
 * - 91 9876543210 → +919876543210
 */
export function normalizeIndianPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // Remove all non-digit characters except leading +
  let cleaned = phone.trim().replace(/[^\d+]/g, '');

  // If starts with +, keep it, otherwise work with digits only
  if (cleaned.startsWith('+')) {
    // Already has country code, validate it's Indian
    if (cleaned.startsWith('+91') && cleaned.length === 13) {
      return cleaned;
    }
    // Remove + and process
    cleaned = cleaned.substring(1);
  }

  // Remove leading 91 if present (country code without +)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }

  // Remove leading 0 if present
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Validate: should be exactly 10 digits now
  if (cleaned.length !== 10) {
    return null;
  }

  // Indian mobile numbers start with 6, 7, 8, or 9
  if (!['6', '7', '8', '9'].includes(cleaned[0])) {
    return null;
  }

  return `+91${cleaned}`;
}

/**
 * Format phone for display: +919876543210 → +91 98765 43210
 */
export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizeIndianPhone(phone);
  if (!normalized) return phone;

  // Format as +91 XXXXX XXXXX
  return `${normalized.slice(0, 3)} ${normalized.slice(3, 8)} ${normalized.slice(8)}`;
}

/**
 * Validate if a string is a valid Indian mobile number
 */
export function isValidIndianPhone(phone: string | null | undefined): boolean {
  return normalizeIndianPhone(phone) !== null;
}
