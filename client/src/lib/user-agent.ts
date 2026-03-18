/**
 * Parse a user-agent string into a friendly device description.
 * e.g. "Chrome on macOS", "Safari on iPhone", "Firefox on Windows"
 */
export function parseUserAgent(ua: string): string {
  if (!ua) return 'Unknown device';

  let browser = 'Unknown browser';
  let os = 'Unknown OS';

  // Detect browser
  if (ua.includes('Edg/') || ua.includes('Edge/')) {
    browser = 'Edge';
  } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
    browser = 'Opera';
  } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    browser = 'Safari';
  } else if (ua.includes('Firefox/')) {
    browser = 'Firefox';
  }

  // Detect OS
  if (ua.includes('iPhone')) {
    os = 'iPhone';
  } else if (ua.includes('iPad')) {
    os = 'iPad';
  } else if (ua.includes('Android')) {
    os = 'Android';
  } else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) {
    os = 'macOS';
  } else if (ua.includes('Windows')) {
    os = 'Windows';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  } else if (ua.includes('CrOS')) {
    os = 'ChromeOS';
  }

  return `${browser} on ${os}`;
}
