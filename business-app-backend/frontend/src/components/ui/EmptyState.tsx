import { Paper, Typography, Box, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';

interface EmptyStateProps {
  title: string;
  icon?: 'inbox' | 'search' | 'folder';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({
  title,
  icon = 'inbox',
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const icons = {
    inbox: <InboxIcon sx={{ fontSize: 80 }} />,
    search: <SearchOffIcon sx={{ fontSize: 80 }} />,
    folder: <FolderOpenIcon sx={{ fontSize: 80 }} />,
  };

  return (
    <Paper
      sx={{
        p: 6,
        textAlign: 'center',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? 'grey.50' : 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'inline-flex',
          color: 'text.secondary',
          mb: 2,
        }}
      >
        {icons[icon]}
      </Box>

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
        {message}
      </Typography>

      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;
