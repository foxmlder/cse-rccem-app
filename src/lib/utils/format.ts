/**
 * Format utilities
 */

/**
 * Format number as currency (EUR)
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format number with spaces as thousand separator
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${formatNumber(value, decimals)} %`;
}

/**
 * Format file size (bytes to human readable)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 octets';

  const units = ['octets', 'Ko', 'Mo', 'Go', 'To'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * Format phone number (French format)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as XX XX XX XX XX
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }

  // Format as +33 X XX XX XX XX
  if (cleaned.length === 11 && cleaned.startsWith('33')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }

  return phone;
}

/**
 * Format SIRET (French business ID)
 */
export function formatSiret(siret: string): string {
  const cleaned = siret.replace(/\s/g, '');
  if (cleaned.length === 14) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4');
  }
  return siret;
}

/**
 * Format postal code
 */
export function formatPostalCode(code: string): string {
  const cleaned = code.replace(/\s/g, '');
  return cleaned;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize each word
 */
export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Convert to slug (URL-friendly string)
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Format initials from name
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Format duration (minutes to human readable)
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} heure${hours > 1 ? 's' : ''}`;
  }

  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
}

/**
 * Format list with commas and "et"
 */
export function formatList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} et ${items[1]}`;

  const allButLast = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  return `${allButLast} et ${last}`;
}

/**
 * Format credit card number (mask all but last 4 digits)
 */
export function formatCreditCard(cardNumber: string, maskChar: string = '•'): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  const last4 = cleaned.slice(-4);
  const masked = maskChar.repeat(cleaned.length - 4);
  return masked + last4;
}

/**
 * Format to title case
 */
export function toTitleCase(text: string): string {
  const smallWords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'à', 'au', 'aux'];

  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !smallWords.includes(word)) {
        return capitalize(word);
      }
      return word;
    })
    .join(' ');
}

/**
 * Add ordinal suffix to number (1er, 2ème, etc.)
 */
export function ordinal(num: number): string {
  if (num === 1) return '1er';
  return `${num}ème`;
}

/**
 * Mask email (show only first 3 chars and domain)
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  if (username.length <= 3) return email;

  const visiblePart = username.slice(0, 3);
  const maskedPart = '•'.repeat(username.length - 3);
  return `${visiblePart}${maskedPart}@${domain}`;
}

/**
 * Format bytes to bits
 */
export function formatBitrate(bytesPerSecond: number): string {
  const bitsPerSecond = bytesPerSecond * 8;
  const units = ['bps', 'Kbps', 'Mbps', 'Gbps'];
  const k = 1000;
  const i = Math.floor(Math.log(bitsPerSecond) / Math.log(k));

  return `${parseFloat((bitsPerSecond / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}
