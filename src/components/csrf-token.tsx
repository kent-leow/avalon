import { generateCSRFToken } from '~/lib/csrf';

/**
 * CSRFToken component that injects CSRF token into HTML head
 * Should be used in the root layout
 */
export async function CSRFToken() {
  const token = await generateCSRFToken();
  
  return (
    <meta name="csrf-token" content={token} />
  );
}
