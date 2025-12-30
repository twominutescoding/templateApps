import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import type { ColorPalette } from '../../types/palette';

interface CustomPaletteEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (palette: ColorPalette) => void;
}

const CustomPaletteEditor = ({ open, onClose, onSave }: CustomPaletteEditorProps) => {
  const [paletteName, setPaletteName] = useState('');
  const [lightColors, setLightColors] = useState({
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#000000',
  });
  const [darkColors, setDarkColors] = useState({
    primary: '#0f2027',
    secondary: '#203a43',
    accent: '#2c5364',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
  });

  const handleSave = () => {
    if (!paletteName.trim()) {
      alert('Please enter a palette name');
      return;
    }

    const newPalette: ColorPalette = {
      id: `custom-${Date.now()}`,
      name: paletteName,
      light: lightColors,
      dark: darkColors,
    };

    onSave(newPalette);
    handleClose();
  };

  const handleClose = () => {
    setPaletteName('');
    setLightColors({
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      background: '#f5f5f5',
      surface: '#ffffff',
      text: '#000000',
    });
    setDarkColors({
      primary: '#0f2027',
      secondary: '#203a43',
      accent: '#2c5364',
      background: '#121212',
      surface: '#1e1e1e',
      text: '#ffffff',
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Custom Palette</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Palette Name"
            value={paletteName}
            onChange={(e) => setPaletteName(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Typography variant="h6" gutterBottom>
            Light Mode Colors
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              label="Primary"
              type="color"
              value={lightColors.primary}
              onChange={(e) => setLightColors({ ...lightColors, primary: e.target.value })}
            />
            <TextField
              fullWidth
              label="Secondary"
              type="color"
              value={lightColors.secondary}
              onChange={(e) => setLightColors({ ...lightColors, secondary: e.target.value })}
            />
            <TextField
              fullWidth
              label="Accent"
              type="color"
              value={lightColors.accent}
              onChange={(e) => setLightColors({ ...lightColors, accent: e.target.value })}
            />
            <TextField
              fullWidth
              label="Background"
              type="color"
              value={lightColors.background}
              onChange={(e) => setLightColors({ ...lightColors, background: e.target.value })}
            />
            <TextField
              fullWidth
              label="Surface"
              type="color"
              value={lightColors.surface}
              onChange={(e) => setLightColors({ ...lightColors, surface: e.target.value })}
            />
            <TextField
              fullWidth
              label="Text"
              type="color"
              value={lightColors.text}
              onChange={(e) => setLightColors({ ...lightColors, text: e.target.value })}
            />
          </Box>

          <Typography variant="h6" gutterBottom>
            Dark Mode Colors
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Primary"
              type="color"
              value={darkColors.primary}
              onChange={(e) => setDarkColors({ ...darkColors, primary: e.target.value })}
            />
            <TextField
              fullWidth
              label="Secondary"
              type="color"
              value={darkColors.secondary}
              onChange={(e) => setDarkColors({ ...darkColors, secondary: e.target.value })}
            />
            <TextField
              fullWidth
              label="Accent"
              type="color"
              value={darkColors.accent}
              onChange={(e) => setDarkColors({ ...darkColors, accent: e.target.value })}
            />
            <TextField
              fullWidth
              label="Background"
              type="color"
              value={darkColors.background}
              onChange={(e) => setDarkColors({ ...darkColors, background: e.target.value })}
            />
            <TextField
              fullWidth
              label="Surface"
              type="color"
              value={darkColors.surface}
              onChange={(e) => setDarkColors({ ...darkColors, surface: e.target.value })}
            />
            <TextField
              fullWidth
              label="Text"
              type="color"
              value={darkColors.text}
              onChange={(e) => setDarkColors({ ...darkColors, text: e.target.value })}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Palette
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomPaletteEditor;
