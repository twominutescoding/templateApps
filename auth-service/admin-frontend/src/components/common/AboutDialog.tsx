import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { getAppInfo } from '../../services/docsService';

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

const AboutDialog = ({ open, onClose }: AboutDialogProps) => {
  const [appInfo, setAppInfo] = useState<{ version: string; appName: string; lastUpdated: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      setLoading(true);
      const info = await getAppInfo();
      setAppInfo(info);
    } catch (err) {
      console.error('Error loading about info:', err);
    } finally {
      setLoading(false);
    }
  };

  const techStack = ['React 19', 'TypeScript', 'MUI v7', 'Jotai', 'Vite'];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <IconButton
        onClick={onClose}
        size="small"
        sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogContent sx={{ pt: 3, pb: 3, textAlign: 'center' }}>
        {loading ? (
          <Box sx={{ py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <>
            <AdminPanelSettingsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              {appInfo?.appName}
            </Typography>
            <Chip
              label={`v${appInfo?.version}`}
              size="small"
              color="primary"
              sx={{ mt: 1, mb: 2 }}
            />

            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
              {techStack.map((tech) => (
                <Chip
                  key={tech}
                  label={tech}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 22 }}
                />
              ))}
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AboutDialog;
