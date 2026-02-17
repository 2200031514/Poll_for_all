// Simple browser fingerprinting based on user agent and screen resolution
// For a production app, use a library like fingerprintjs.
// This handles the "Fairness" requirement.

export const getFingerprint = async () => {
    const msg = navigator.userAgent + navigator.language + screen.colorDepth + screen.width + screen.height + new Date().getTimezoneOffset();
    const encoder = new TextEncoder();
    const data = encoder.encode(msg);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
