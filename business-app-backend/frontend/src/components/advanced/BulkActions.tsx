import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import MailIcon from '@mui/icons-material/Mail';

interface DataItem {
  id: number;
  name: string;
  category: string;
  status: string;
}

interface BulkActionsProps {
  title: string;
  data: DataItem[];
}

const BulkActions = ({ title, data }: BulkActionsProps) => {
  const [selected, setSelected] = useState<number[]>([]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(data.map((item) => item.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action: string) => {
    alert(`${action} action performed on ${selected.length} items`);
    setSelected([]);
  };

  const isSelected = (id: number) => selected.includes(id);
  const selectedCount = selected.length;
  const allSelected = selectedCount === data.length;

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {selectedCount > 0 && (
            <Chip label={`${selectedCount} selected`} color="primary" size="small" />
          )}
        </Box>
        {selectedCount > 0 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MailIcon />}
              onClick={() => handleBulkAction('Email')}
            >
              Email
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArchiveIcon />}
              onClick={() => handleBulkAction('Archive')}
            >
              Archive
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleBulkAction('Delete')}
            >
              Delete
            </Button>
          </Box>
        )}
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allSelected}
                  indeterminate={selectedCount > 0 && !allSelected}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                selected={isSelected(row.id)}
                onClick={() => handleSelect(row.id)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell padding="checkbox">
                  <Checkbox checked={isSelected(row.id)} />
                </TableCell>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default BulkActions;
