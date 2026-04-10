import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/**
 * Renders a scannable QR code for an absolute URL (or any short string).
 * Generated in-browser — no third-party QR image API; encodes exactly `value`.
 */
export default function QrCodeImage({ value, size = 128, alt = 'QR code', className }) {
  const [dataUrl, setDataUrl] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!value || typeof value !== 'string') {
      setDataUrl('');
      setFailed(false);
      return undefined;
    }
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setFailed(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl('');
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (failed) {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          textAlign: 'center',
          padding: 4,
          background: '#f1f5f9',
          color: '#64748b',
        }}
        role="img"
        aria-label={alt}
      >
        QR error
      </span>
    );
  }

  if (!dataUrl) {
    return (
      <span
        className={className}
        style={{
          width: size,
          height: size,
          display: 'inline-block',
          background: '#f1f5f9',
          borderRadius: 4,
        }}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={dataUrl}
      alt={alt}
      width={size}
      height={size}
      className={className}
      decoding="async"
    />
  );
}
