import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

interface ModalExampleProps {
  title: string;
}

const ModalExample = ({ title }: ModalExampleProps) => {
  const [openSimple, setOpenSimple] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [name, setName] = useState('');

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={() => setOpenSimple(true)}>
          Simple Modal
        </Button>
        <Button variant="contained" color="secondary" onClick={() => setOpenForm(true)}>
          Form Modal
        </Button>
      </Box>

      {/* Simple Modal */}
      <Dialog open={openSimple} onClose={() => setOpenSimple(false)}>
        <DialogTitle>Simple Information Modal</DialogTitle>
        <DialogContent>
          <Typography>
            This is a simple modal dialog. It can display any content you need, such as
            information, confirmations, or warnings.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSimple(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Form Modal */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>Create New Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button
            onClick={() => {
              alert(`Creating item: ${name}`);
              setOpenForm(false);
              setName('');
            }}
            variant="contained"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ModalExample;
