import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '../constants/site';

function joinUrl(base, path) {
  const b = String(base || '').replace(/\/$/, '');
  const p = String(path || '/');
  return `${b}${p.startsWith('/') ? p : `/${p}`}`;
}

export function Seo({
  title,
  description,
  path = '/',
  imagePath = '/app-icon.svg',
  robots = 'index,follow',
  jsonLd,
}) {
  const url = joinUrl(SITE_URL, path);
  const imageUrl = joinUrl(SITE_URL, imagePath);
  const fullTitle = title ? `${title} | LUNA SEN PANTRY` : 'LUNA SEN PANTRY';

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      {description ? <meta name="description" content={description} /> : null}
      <meta name="robots" content={robots} />

      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="LUNA SEN PANTRY" />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description ? <meta name="twitter:description" content={description} /> : null}
      <meta name="twitter:image" content={imageUrl} />

      {jsonLd ? <script type="application/ld+json">{JSON.stringify(jsonLd)}</script> : null}
    </Helmet>
  );
}

