'use client';

import { useEffect } from 'react';

/**
 * CSRFToken component that fetches CSRF token and injects it into HTML head
 * Should be used in the root layout
 */
export function CSRFToken() {
  useEffect(() => {
    // Check if token already exists
    const existingMeta = document.querySelector('meta[name="csrf-token"]');
    if (existingMeta?.getAttribute('content')) {
      return;
    }
    
    // Fetch token from API
    fetch('/api/csrf')
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          // Update or create meta tag
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
  
  return null;
}
