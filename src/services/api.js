/**
 * Central HTTPS client — SSL-pinning ready.
 *
 * TO ADD SSL PINNING (when you have a real backend domain):
 *  1. npm install react-native-ssl-pinning
 *  2. Get your cert hash:
 *       openssl s_client -connect api.yourdomain.com:443 \
 *         | openssl x509 -noout -fingerprint -sha256
 *  3. Replace the fetch call below with:
 *       import { fetch as pinnedFetch } from 'react-native-ssl-pinning';
 *       return pinnedFetch(url, {
 *         ...options,
 *         sslPinning: { certs: ['YOUR_CERT_FILENAME'] },
 *       });
 *     (put the .cer file in android/app/src/main/assets/
 *      and ios/YourApp/ respectively)
 */

const BASE_URL = 'https://REPLACE_WITH_YOUR_API_URL';

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
