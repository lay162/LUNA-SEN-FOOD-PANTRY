import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { brandLogoUrl as defaultBrandLogoUrl } from '../constants/assets';

const LS_KEY = 'luna-admin-branding-v1';

function readStoredLogoRaw() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw);
    const u = j?.logoUrl;
    if (u == null || String(u).trim() === '') return null;
    return String(u).trim();
  } catch {
    return null;
  }
}

export function resolveBrandLogoUrl(stored) {
  if (!stored) return defaultBrandLogoUrl;
  const s = String(stored).trim();
  if (/^https?:\/\//i.test(s) || s.startsWith('data:')) return s;
  const base = import.meta.env.BASE_URL || '/';
  const path = s.replace(/^\/+/, '');
  const b = base.endsWith('/') ? base : `${base}/`;
  return `${b}${path}`;
}

const BrandingContext = createContext(null);

export function BrandingProvider({ children }) {
  const [logoUrlOverride, setLogoUrlOverride] = useState(() => readStoredLogoRaw());

  const logoUrl = useMemo(() => resolveBrandLogoUrl(logoUrlOverride), [logoUrlOverride]);

  const setLogoUrl = useCallback((next) => {
    const v = next == null || String(next).trim() === '' ? null : String(next).trim();
    setLogoUrlOverride(v);
    try {
      if (v == null) localStorage.removeItem(LS_KEY);
      else
        localStorage.setItem(
          LS_KEY,
          JSON.stringify({ logoUrl: v, updatedAt: new Date().toISOString() })
        );
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const resetLogo = useCallback(() => setLogoUrl(null), [setLogoUrl]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== LS_KEY) return;
      setLogoUrlOverride(readStoredLogoRaw());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /** Keep tab favicon in sync when a founder changes the logo (PNG or data URL). */
  useEffect(() => {
    try {
      document.querySelectorAll('link[rel*="icon"]').forEach((link) => {
        link.href = logoUrl;
      });
    } catch {
      /* ignore */
    }
  }, [logoUrl]);

  const value = useMemo(
    () => ({
      logoUrl,
      logoUrlOverride,
      setLogoUrl,
      resetLogo,
    }),
    [logoUrl, logoUrlOverride, setLogoUrl, resetLogo]
  );

  return <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>;
}

/** Resolved logo URL for navbar, footer, admin shell, etc. */
export function useBrandLogoUrl() {
  const ctx = useContext(BrandingContext);
  return ctx?.logoUrl ?? defaultBrandLogoUrl;
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return ctx;
}
