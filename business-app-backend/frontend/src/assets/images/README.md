# Company Logo Customization

This folder contains placeholder company logos. Replace these files with your actual company branding.

## Logo Files

### 1. `logo.svg` (Main Logo - Dark Backgrounds)
- **Used in**: Header/Topbar
- **Recommended size**: 120x40px (or similar aspect ratio)
- **Format**: SVG (preferred) or PNG with transparent background
- **Colors**: Should work on gradient backgrounds (will be inverted to white)

### 2. `logo-white.svg` (White Logo - Dark Backgrounds)
- **Used in**: Login page header
- **Recommended size**: 200x50px (or similar aspect ratio)
- **Format**: SVG (preferred) or PNG with transparent background
- **Colors**: White or light colors for dark blue gradient background

### 3. `favicon.svg` (Browser Tab Icon)
- **Located in**: `/frontend/public/favicon.svg`
- **Recommended size**: 32x32px
- **Format**: SVG or ICO
- **Colors**: Should be recognizable at small sizes

## How to Replace Logos

### Option 1: Replace the SVG files directly
1. Replace `logo.svg` with your company logo
2. Replace `logo-white.svg` with a white version of your logo
3. Replace `/frontend/public/favicon.svg` with your favicon

### Option 2: Use PNG/JPG files
1. Add your logo files (e.g., `logo.png`, `logo-white.png`)
2. Update the import paths in:
   - `/frontend/src/components/layout/Header.tsx`
   - `/frontend/src/pages/Login.tsx`

Example:
```typescript
// Before
import logo from '../../assets/images/logo.svg';

// After
import logo from '../../assets/images/logo.png';
```

### Option 3: Use external URL
If your logo is hosted externally, you can use the URL directly:

```typescript
// In Header.tsx or Login.tsx
<img src="https://yourcompany.com/logo.svg" alt="Company Logo" />
```

## Customization Tips

### Login Page Logo
- Best size: Height 40-60px, Width up to 200px
- Should be white or light colored for dark gradient background
- Located at: `/frontend/src/pages/Login.tsx` line 98

### Header/Topbar Logo
- Best size: Height 30-36px, Width up to 120px
- Uses CSS filter to make it white on gradient background
- Located at: `/frontend/src/components/layout/Header.tsx` line 86

### Removing the Filter
If your logo is already white/light, you may want to remove the CSS filter:

```typescript
// In Header.tsx, remove or comment out:
filter: 'brightness(0) invert(1)',
```

## File Structure
```
frontend/
├── public/
│   └── favicon.svg          # Browser tab icon
└── src/
    └── assets/
        └── images/
            ├── logo.svg           # Main logo (topbar)
            ├── logo-white.svg     # White logo (login page)
            └── README.md          # This file
```

## Need Help?
- SVG logos work best for scaling
- Use transparent backgrounds for PNG files
- Test your logo on both light and dark themes
- Ensure logos are optimized for web (compress large files)
