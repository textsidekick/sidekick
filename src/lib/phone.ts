/**
 * Normalize phone number to E.164 format (+1234567890)
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle US/Canada numbers (10 digits or 11 starting with 1)
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // Return as-is if already formatted or different country code
  return phone.startsWith('+') ? phone : `+${digits}`;
}

/**
 * Format phone number for display (e.g., +1 (415) 843-8174)
 */
export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  const digits = normalized.replace(/\D/g, '');
  
  if (digits.length === 11 && digits.startsWith('1')) {
    // US format: +1 (XXX) XXX-XXXX
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return normalized;
}

/**
 * Format phone for unformatted display (e.g., 4158438174)
 */
export function formatPhoneUnformatted(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  return normalized.replace(/\D/g, '');
}

/**
 * Create SMS link for mobile (tel: URI)
 */
export function createSmsLink(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  return `sms:${normalized}`;
}
