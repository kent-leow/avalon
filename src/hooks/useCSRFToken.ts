import { useEffect, useState } from 'react';

/**
 * Hook to get CSRF token from meta tag
 */
export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      setToken(metaTag.getAttribute('content'));
    }
  }, []);
  
  return token;
}

/**
 * Get CSRF token synchronously from meta tag
 */
export function getCSRFTokenFromMeta(): string | null {
  if (typeof window === 'undefined') return null;
  
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag?.getAttribute('content') || null;
}

/**
 * Add CSRF token to headers object
 */
export function addCSRFTokenToHeaders(headers: Headers): Headers {
  const token = getCSRFTokenFromMeta();
  if (token) {
    headers.set('x-csrf-token', token);
  }
  return headers;
}

/**
 * Create headers with CSRF token
 */
export function createHeadersWithCSRF(additionalHeaders?: Record<string, string>): Headers {
  const headers = new Headers(additionalHeaders);
  return addCSRFTokenToHeaders(headers);
}
