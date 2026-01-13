import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Switch,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import { useThemeContext } from '../theme/ThemeContext';
import { useDateFormat } from '../context/DateFormatContext';
import type { DateFormatType, TimestampFormatType } from '../context/DateFormatContext';
import { predefinedPalettes } from '../types/palette';
import CustomPaletteEditor from '../components/common/CustomPaletteEditor';
import type { ColorPalette } from '../types/palette';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { mode, toggleTheme, palette, setPalette, customPalettes, addCustomPalette, removeCustomPalette } = useThemeContext();
  const { dateFormat, setDateFormat, timestampFormat, setTimestampFormat, getPlaceholder, getTimestampPlaceholder } = useDateFormat();
  const { user } = useAuth();
  const [editorOpen, setEditorOpen] = useState(false);

  const allPalettes = [...predefinedPalettes, ...customPalettes];

  const handlePaletteSelect = (selectedPalette: ColorPalette) => {
    setPalette(selectedPalette);
  };

  const handleSaveCustomPalette = (newPalette: ColorPalette) => {
    addCustomPalette(newPalette);
  };

  const handleDeleteCustomPalette = (paletteId: string) => {
    if (window.confirm('Are you sure you want to delete this custom palette?')) {
      removeCustomPalette(paletteId);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Settings
      </Typography>

      {/* User Profile Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          User Profile
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user.email}
              </Typography>
              <Chip
                label={user.role.toUpperCase()}
                size="small"
                color={
                  user.role === 'admin' ? 'error' :
                  user.role === 'manager' ? 'warning' : 'default'
                }
              />
            </Box>
          </Box>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          Connected to Spring Boot backend. User data is managed through JWT authentication.
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Appearance
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Dark Mode"
              secondary={`Currently using ${mode} mode. Toggle to switch themes.`}
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                onChange={toggleTheme}
                checked={mode === 'dark'}
                inputProps={{ 'aria-label': 'dark mode toggle' }}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Date Format"
              secondary={`Format used for dates. Example: ${getPlaceholder()}`}
            />
            <ListItemSecondaryAction>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value as DateFormatType)}
                >
                  <MenuItem value="DD.MM.YYYY">DD.MM.YYYY</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                </Select>
              </FormControl>
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Timestamp Format"
              secondary={`Format used for timestamps. Example: ${getTimestampPlaceholder()}`}
            />
            <ListItemSecondaryAction>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={timestampFormat}
                  onChange={(e) => setTimestampFormat(e.target.value as TimestampFormatType)}
                >
                  <MenuItem value="DD.MM.YYYY HH:mm:ss">DD.MM.YYYY HH:mm:ss</MenuItem>
                  <MenuItem value="MM/DD/YYYY HH:mm:ss">MM/DD/YYYY HH:mm:ss</MenuItem>
                  <MenuItem value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss</MenuItem>
                </Select>
              </FormControl>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Color Palettes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setEditorOpen(true)}
          >
            Create Custom Palette
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select a color palette to customize the appearance of your application. Each palette includes colors for both light and dark modes.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {allPalettes.map((p) => {
            const isSelected = p.id === palette.id;
            const isCustom = p.id.startsWith('custom-');
            const colors = mode === 'light' ? p.light : p.dark;

            return (
              <Box key={p.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: isSelected ? 2 : 1,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => handlePaletteSelect(p)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {p.name}
                      </Typography>
                      {isSelected && (
                        <CheckCircleIcon color="primary" />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                      <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5 }}>
                        {[colors.primary, colors.secondary, colors.accent, colors.background, colors.surface, colors.text].map((color, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              height: 18,
                              backgroundColor: color,
                              borderRadius: 0.5,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      {isCustom ? 'Custom Palette' : 'Predefined Palette'}
                    </Typography>
                  </CardContent>

                  {isCustom && (
                    <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomPalette(p.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  )}
                </Card>
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Other Settings
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Language"
              secondary="Select your preferred language (Coming soon)"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Notifications"
              secondary="Manage your notification preferences (Coming soon)"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="Account"
              secondary="Manage your account settings (Coming soon)"
            />
          </ListItem>
        </List>
      </Paper>

      <CustomPaletteEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveCustomPalette}
      />
    </Box>
  );
};

export default Settings;
