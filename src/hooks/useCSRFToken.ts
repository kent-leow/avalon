import { useEffect, useState } from 'react';

/**
 * Hook to get CSRF token from meta tag or fetch it if not available
 */
export function useCSRFToken() {
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    // First check if token already exists in meta tag
    const checkMetaTag = () => {
      const metaTag = document.querySelector('meta[name="csrf-token"]');
      if (metaTag?.getAttribute('content')) {
        setToken(metaTag.getAttribute('content'));
        return true;
      }
      return false;
    };
    
    if (checkMetaTag()) {
      return;
    }
    
    // If no token in meta tag, fetch from API
    fetch('/api/csrf')
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          setToken(data.token);
          // Update or create meta tag for future use
          let metaTag = document.querySelector('meta[name="csrf-token"]');
          if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.setAttribute('name', 'csrf-token');
            document.head.appendChild(metaTag);
          }
          metaTag.setAttribute('content', data.token);
        }
      })
      .catch(error => {
        console.error('Failed to fetch CSRF token:', error);
      });
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
