-- Update existing users to have default theme and paletteId values
-- This script should be run once to migrate existing data

-- Update users with NULL theme to 'light' (new default)
UPDATE D_USERS
SET THEME = 'light'
WHERE THEME IS NULL;

-- Update users with NULL paletteId to 'ocean-blue' (default palette)
UPDATE D_USERS
SET PALETTE_ID = 'ocean-blue'
WHERE PALETTE_ID IS NULL;

-- Commit the changes
COMMIT;
