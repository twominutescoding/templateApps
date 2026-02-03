# Company Logo Customization

This folder contains placeholder company logos. Replace these files with your actual company branding.

## Logo Files

### 1. `logo.svg` (Main Logo - Header/Topbar)
- **Used in**: Header/Topbar
- **Recommended size**: 120x40px (or similar aspect ratio)
- **Format**: SVG (preferred) or PNG with transparent background
- **Colors**: Should work on gradient backgrounds

### 2. `logo-white.svg` (White Logo - Login Page)
- **Used in**: Login page header
- **Recommended size**: 200x50px (or similar aspect ratio)
- **Format**: SVG (preferred) or PNG with transparent background
- **Colors**: White or light colors for dark blue gradient background

## How to Replace Logos

### Option 1: Use Custom PNG (Recommended)

Place your custom logo files in the `public/` folder:

1. Add `logo.png` to `public/` - used in the header
2. Add `logo-white.png` to `public/` - used on the login page

The Logo component will automatically detect and use these files.

### Option 2: Replace the SVG files

1. Replace `logo.svg` with your company logo
2. Replace `logo-white.svg` with a white version of your logo

### Option 3: Use external URL

Modify the Logo component to use an external URL:

```typescript
// In src/components/common/Logo.tsx
// Change the default logo source to your CDN URL
```

## File Structure

```
admin-frontend/
├── public/
│   ├── logo.png         # Custom logo (optional - takes priority)
│   └── logo-white.png   # Custom white logo (optional - takes priority)
└── src/
    ├── assets/
    │   └── images/
    │       ├── logo.svg         # Default logo (fallback)
    │       ├── logo-white.svg   # Default white logo (fallback)
    │       └── README.md        # This file
    └── components/
        └── common/
            └── Logo.tsx         # Logo component with fallback logic
```

## Logo Component Usage

The `Logo` component automatically handles the fallback:

```typescript
import Logo from '../components/common/Logo';

// In Header (default variant)
<Logo variant="default" height={32} maxWidth={120} />

// In Login page (white variant)
<Logo variant="white" height={50} maxWidth={200} />
```

## Priority Order

1. **Custom PNG in public/** (e.g., `/public/logo.png`) - checked first
2. **Default SVG** (e.g., `src/assets/images/logo.svg`) - fallback

## Customization Tips

- SVG logos work best for scaling
- Use transparent backgrounds for PNG files
- Test your logo on both light and dark themes
- Ensure logos are optimized for web (compress large files)
- White logo should be clearly visible on dark blue gradient background
