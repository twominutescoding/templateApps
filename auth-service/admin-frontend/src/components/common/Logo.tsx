import { useState } from 'react';

// Default SVG logos (fallback)
import defaultLogo from '../../assets/images/logo.svg';
import defaultLogoWhite from '../../assets/images/logo-white.svg';

interface LogoProps {
  variant?: 'default' | 'white';
  height?: number | string;
  maxWidth?: number | string;
  alt?: string;
  style?: React.CSSProperties;
}

/**
 * Logo component with automatic fallback.
 *
 * Priority:
 * 1. Custom logo.png (if exists in public/)
 * 2. Default SVG logo
 *
 * Usage:
 * - Place your custom logo as logo.png or logo-white.png in public/
 * - The component will automatically use it if available
 * - Otherwise falls back to the default placeholder SVG
 */
const Logo = ({
  variant = 'default',
  height = 32,
  maxWidth = 120,
  alt = 'Company Logo',
  style
}: LogoProps) => {
  // Start with custom PNG, fallback to SVG on error
  const customLogo = variant === 'white' ? '/logo-white.png' : '/logo.png';
  const fallbackLogo = variant === 'white' ? defaultLogoWhite : defaultLogo;

  const [logoSrc, setLogoSrc] = useState<string>(customLogo);
  const [useFallback, setUseFallback] = useState(false);

  const handleError = () => {
    if (!useFallback) {
      setUseFallback(true);
      setLogoSrc(fallbackLogo);
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
