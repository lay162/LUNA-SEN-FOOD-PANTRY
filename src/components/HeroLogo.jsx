import { brandLogoUrl } from '../constants/assets';

/**
 * Brand mark for gradient hero sections. Size is controlled only by
 * `luna-theme.css` (--luna-hero-logo-*) and `.luna-hero__logo` in global.css.
 */
const HeroLogo = () => (
  <img
    src={brandLogoUrl}
    alt=""
    className="luna-hero__logo"
    aria-hidden="true"
    width="160"
    height="160"
    decoding="async"
  />
);

export default HeroLogo;
