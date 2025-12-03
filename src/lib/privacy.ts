
/**
 * Privacy utility functions for masking sensitive information
 */

// Regex patterns for sensitive information
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_REGEX = /\b[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}\b/g;
// Simple URL regex - be careful not to be too aggressive
const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[^\s]+)/g;

// Additional patterns for common workarounds
const EMAIL_WORKAROUND_REGEX = /\b[A-Za-z0-9._%+-]+\s*(?:at|@|\(at\))\s*[A-Za-z0-9.-]+\s*(?:dot|\.|\(dot\))\s*(?:com|co\.za|net|org|za)\b/gi;
const PHONE_WORKAROUND_REGEX = /\b(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)\s*(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)\s*(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)\s*(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)\s*(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)\s*(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)\s*(?:zero|one|two|three|four|five|six|seven|eight|nine|\d)/gi;
const WHATSAPP_REGEX = /\b(?:whatsapp|wa|watsapp)\s*(?:me|number|num|no)?\s*[:=]?\s*[\+]?[0-9\s-]{7,}/gi;

// Catch common email providers even without full email
const EMAIL_PROVIDER_REGEX = /\b(?:gmail|yahoo|hotmail|outlook|icloud|protonmail|mail|email)\s*(?:\.com|\.co\.za|dot\s*com|account|address)?\b/gi;

// Catch @ symbol in any context (often used to share emails)
const AT_SYMBOL_REGEX = /\b[A-Za-z0-9._%+-]+\s*@\s*[A-Za-z0-9.-]+/g;

/**
 * Masks sensitive information in the provided text
 * @param text The text to sanitize
 * @returns The sanitized text with sensitive info replaced
 */
export function maskSensitiveContent(text: string): string {
    if (!text) return text;

    let maskedText = text;

    // Mask Emails
    maskedText = maskedText.replace(EMAIL_REGEX, '[Hidden Email]');

    // Mask email workarounds (e.g., "john at gmail dot com")
    maskedText = maskedText.replace(EMAIL_WORKAROUND_REGEX, '[Hidden Email]');

    // Mask @ symbol usage
    maskedText = maskedText.replace(AT_SYMBOL_REGEX, '[Hidden Email]');

    // Mask email provider mentions
    maskedText = maskedText.replace(EMAIL_PROVIDER_REGEX, '[Hidden Email Provider]');

    // Mask Phone Numbers
    // We need to be careful with phone numbers as they can look like other numbers
    // This is a basic implementation
    maskedText = maskedText.replace(PHONE_REGEX, (match) => {
        // Only mask if it looks like a phone number (at least 7 digits)
        const digitCount = match.replace(/[^0-9]/g, '').length;
        if (digitCount >= 7) {
            return '[Hidden Phone]';
        }
        return match;
    });

    // Mask phone workarounds (spelled out or heavily spaced)
    maskedText = maskedText.replace(PHONE_WORKAROUND_REGEX, '[Hidden Phone]');

    // Mask WhatsApp references with numbers
    maskedText = maskedText.replace(WHATSAPP_REGEX, '[Hidden Contact]');

    // Mask URLs
    maskedText = maskedText.replace(URL_REGEX, '[Hidden Link]');

    return maskedText;
}

/**
 * Checks if the text contains sensitive information
 * @param text The text to check
 * @returns True if sensitive info is detected
 */
export function containsSensitiveContent(text: string): boolean {
    if (!text) return false;
    return (
        EMAIL_REGEX.test(text) ||
        EMAIL_WORKAROUND_REGEX.test(text) ||
        AT_SYMBOL_REGEX.test(text) ||
        EMAIL_PROVIDER_REGEX.test(text) ||
        (PHONE_REGEX.test(text) && text.replace(/[^0-9]/g, '').length >= 7) ||
        PHONE_WORKAROUND_REGEX.test(text) ||
        WHATSAPP_REGEX.test(text) ||
        URL_REGEX.test(text)
    );
}
