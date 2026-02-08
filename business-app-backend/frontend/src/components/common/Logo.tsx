import { useState } from 'react';

interface LogoProps {
  variant?: 'default' | 'white';
  height?: number | string;
  maxWidth?: number | string;
  alt?: string;
  style?: React.CSSProperties;
}

/**
 * Logo component that loads logos from public/images/logo folder.
 * Supports both SVG and PNG formats with automatic fallback.
 *
 * Required files in public/images/logo/:
 * - logo.svg OR logo.png (for default variant)
 * - logo-white.svg OR logo-white.png (for white variant)
 *
 * Priority: SVG first, then PNG fallback
 */
const Logo = ({
  variant = 'default',
  height = 32,
  maxWidth = 120,
  alt = 'Company Logo',
  style
}: LogoProps) => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const logoName = variant === 'white' ? 'logo-white' : 'logo';
  const basePath = `${baseUrl}images/logo/${logoName}`.replace('//', '/');

  // Try SVG first, fallback to PNG
  const [logoSrc, setLogoSrc] = useState<string>(`${basePath}.svg`);
  const [triedPng, setTriedPng] = useState(false);

  const handleError = () => {
    if (!triedPng) {
      setTriedPng(true);
      setLogoSrc(`${basePath}.png`);
    }
  };

  return (
    <img
      src={logoSrc}
      alt={alt}
      onError={handleError}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
        objectFit: 'contain',
        ...style,
      }}
    />
  );
};

export default Logo;
