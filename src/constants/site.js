/**
 * Public site origin for in-app links (e.g. QR codes on the home page).
 * Default matches Netlify; override with VITE_SITE_URL when you use a custom domain.
 * Full checklist: see CUSTOM_DOMAIN.txt in the project root.
 */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://lunasenpantry.co.uk').replace(
  /\/$/,
  ''
);
