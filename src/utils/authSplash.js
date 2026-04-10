/**
 * Full-screen splash in index.html — used only during staff/admin sign-in, not on public home load.
 */
const SPLASH_ID = 'luna-splash';
const BOOT_HIDDEN = 'luna-splash--boot-hidden';

export function showAuthSplash(message = 'Signing in…') {
  const el = document.getElementById(SPLASH_ID);
  if (!el) return;
  const textEl = el.querySelector('.luna-splash__text');
  if (textEl) textEl.textContent = message;
  el.classList.remove(BOOT_HIDDEN);
  el.classList.remove('is-hidden');
  el.setAttribute('aria-hidden', 'false');
}

export function hideAuthSplash() {
  const el = document.getElementById(SPLASH_ID);
  if (!el) return;
  el.classList.add('is-hidden');
  window.setTimeout(() => {
    try {
      el.classList.add(BOOT_HIDDEN);
      el.classList.remove('is-hidden');
      el.setAttribute('aria-hidden', 'true');
    } catch {
      // ignore
    }
  }, 280);
}
