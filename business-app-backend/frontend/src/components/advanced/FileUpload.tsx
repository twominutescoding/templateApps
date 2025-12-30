import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

interface UploadedFile {
  name: string;
  size: number;
  progress: number;
}

interface FileUploadProps {
  title: string;
}

const FileUpload = ({ title }: FileUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles).map((file) => ({
        name: file.name,
        size: file.size,
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Simulate upload progress
      newFiles.forEach((file) => {
        const interval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.name === file.name && f.progress < 100
                ? { ...f, progress: Math.min(f.progress + 10, 100) }
                : f
            )
          );
        }, 200);

        setTimeout(() => clearInterval(interval), 2200);
      });
    }
  };

  const handleRemove = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        {title}
      </Typography>

      <Box
        sx={{
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          mb: 3,
          backgroundColor: (theme) =>
            theme.palette.mode === 'light' ? 'grey.50' : 'background.paper',
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body1" gutterBottom>
          Drag and drop files here, or click to select
        </Typography>
        <Button variant="contained" component="label" sx={{ mt: 2 }}>
          Select Files
          <input
            type="file"
            hidden
            multiple
            onChange={handleFileChange}
          />
        </Button>
      </Box>

      {files.length > 0 && (
        <List>
          {files.map((file, index) => (
            <ListItem key={`${file.name}-${index}`}>
              <InsertDriveFileIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText
                primary={file.name}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={file.progress}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    <Typography variant="caption">
                      {file.progress}% • {formatFileSize(file.size)}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleRemove(file.name)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default FileUpload;
