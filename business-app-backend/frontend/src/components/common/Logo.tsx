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
 * Supports both PNG and SVG formats with automatic fallback.
 *
 * Required files in public/images/logo/:
 * - logo.png OR logo.svg (for default variant)
 * - logo-white.png OR logo-white.svg (for white variant)
 *
 * Priority: PNG first, then SVG fallback
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

  // Try PNG first, fallback to SVG
  const [logoSrc, setLogoSrc] = useState<string>(`${basePath}.png`);
  const [triedSvg, setTriedSvg] = useState(false);

  const handleError = () => {
    if (!triedSvg) {
      setTriedSvg(true);
      setLogoSrc(`${basePath}.svg`);
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
