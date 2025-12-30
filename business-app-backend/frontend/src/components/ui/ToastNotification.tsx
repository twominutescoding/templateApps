import { useState } from 'react';
import { Paper, Typography, Box, Button, Snackbar, Alert } from '@mui/material';
import type { AlertColor } from '@mui/material';

interface ToastNotificationProps {
  title: string;
}

const ToastNotification = ({ title }: ToastNotificationProps) => {
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState<AlertColor>('success');
  const [message, setMessage] = useState('');

  const showToast = (type: AlertColor, msg: string) => {
    setSeverity(type);
    setMessage(msg);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => showToast('success', 'Operation completed successfully!')}
        >
          Show Success
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => showToast('error', 'An error occurred!')}
        >
          Show Error
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => showToast('warning', 'Warning: Please check your input!')}
        >
          Show Warning
        </Button>
        <Button
          variant="contained"
          color="info"
          onClick={() => showToast('info', 'Here is some useful information.')}
        >
          Show Info
        </Button>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ToastNotification;
