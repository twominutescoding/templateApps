import { useState, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

type Order = 'asc' | 'desc';

interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
}

interface DataTableWithFilterProps {
  title: string;
  columns: Column[];
  data: Record<string, any>[];
  defaultSortColumn?: string;
  defaultSortOrder?: Order;
}

const DataTableWithFilter = ({
  title,
  columns,
  data,
  defaultSortColumn,
  defaultSortOrder = 'asc',
}: DataTableWithFilterProps) => {
  const [order, setOrder] = useState<Order>(defaultSortOrder);
  const [orderBy, setOrderBy] = useState<string>(defaultSortColumn || columns[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredAndSortedData = useMemo(() => {
    // Filter data
    let filtered = data;
    if (searchQuery) {
      filtered = data.filter((row) =>
        columns.some((column) => {
          if (column.filterable !== false) {
            const value = row[column.id];
            return String(value).toLowerCase().includes(searchQuery.toLowerCase());
          }
          return false;
        })
      );
    }

    // Sort data
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue === bValue) return 0;

      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle strings
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();

      if (order === 'asc') {
        return aString < bString ? -1 : 1;
      } else {
        return aString > bString ? -1 : 1;
      }
    });

    return sorted;
  }, [data, columns, searchQuery, order, orderBy]);

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Chip
            icon={<FilterListIcon />}
            label={`${filteredAndSortedData.length} of ${data.length}`}
            size="small"
            color={searchQuery ? 'primary' : 'default'}
          />
        </Box>
      </Box>

      <TextField
        fullWidth
        placeholder="Search in all columns..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No results found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedData.map((row, index) => (
                <TableRow key={index} hover>
                  {columns.map((column) => (
                    <TableCell key={column.id}>{row[column.id]}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DataTableWithFilter;
