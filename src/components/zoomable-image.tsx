'use client';

import { useEffect, useState } from 'react';
import { Image, type ImageProps } from 'fumadocs-core/framework';

export function ZoomableImage(props: ImageProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const { className, style, alt, ...rest } = props;
  const altText = typeof alt === 'string' ? alt : '';

  return (
    <>
      <Image
        {...rest}
        alt={altText}
        onClick={() => setOpen(true)}
        className={className}
        style={{ cursor: 'zoom-in', ...style }}
      />
      {open && (
        <div
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={altText || 'Expanded image'}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            padding: '2rem',
          }}
        >
          <Image
            {...rest}
            alt={altText}
            style={{
              width: 'auto',
              height: 'auto',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      )}
    </>
  );
}
