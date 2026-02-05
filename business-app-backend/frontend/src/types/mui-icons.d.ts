// Type declarations for @mui/icons-material
// This file ensures TypeScript recognizes the icon imports

declare module '@mui/icons-material/*' {
  import { SvgIconProps } from '@mui/material/SvgIcon';
  const Icon: React.ComponentType<SvgIconProps>;
  export default Icon;
}
