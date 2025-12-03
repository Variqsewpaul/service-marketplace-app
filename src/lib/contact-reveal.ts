/**
 * Utility functions for managing contact information reveal
 */

/**
 * Mask email address
 * Example: john.doe@example.com -> j***@***.com
 */
export function maskEmail(email: string): string {
    if (!email) return '';

    const [username, domain] = email.split('@');
    if (!domain) return '***@***.***';

    const maskedUsername = username.charAt(0) + '***';
    const maskedDomain = '***.' + domain.split('.').pop();

    return `${maskedUsername}@${maskedDomain}`;
}

/**
 * Mask phone number
 * Example: +1234567890 -> ***-***-7890
 */
export function maskPhone(phone: string): string {
    if (!phone) return '';

    // Get last 4 digits
    const lastFour = phone.slice(-4);
    return `***-***-${lastFour}`;
}

/**
 * Check if contact information should be revealed to a user
 * Contact is revealed if:
 * 1. The user is the provider themselves
 * 2. The user has a confirmed booking with the provider
 * 3. The provider has auto-reveal enabled and there's any booking
 */
export function shouldRevealContact(
    viewerId: string,
    providerId: string,
    hasConfirmedBooking: boolean,
    autoRevealEnabled: boolean = true
): boolean {
    // Provider can always see their own contact info
    if (viewerId === providerId) {
        return true;
    }

    // STRICT PRIVACY: Never reveal contact info on public profile.
    // Communication should happen via platform tools (Chat/Leads).
    // Even with a booking, we keep the public profile private to prevent platform circumvention.
    return false;
}

/**
 * Mask contact information in provider profile
 */
export function maskContactInfo(profile: {
    contactEmail?: string | null;
    contactPhone?: string | null;
}) {
    return {
        ...profile,
        contactEmail: profile.contactEmail ? maskEmail(profile.contactEmail) : null,
        contactPhone: profile.contactPhone ? maskPhone(profile.contactPhone) : null,
    };
}
