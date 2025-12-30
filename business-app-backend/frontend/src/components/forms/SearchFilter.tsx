import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  name: string;
  label: string;
  options: FilterOption[];
}

interface SearchFilterProps {
  title: string;
  searchPlaceholder?: string;
  filters: FilterConfig[];
  onSearch: (query: string, filters: Record<string, string>) => void;
}

const SearchFilter = ({
  title,
  searchPlaceholder = 'Search...',
  filters,
  onSearch,
}: SearchFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  const handleFilterChange = (name: string, value: string) => {
    setSelectedFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onSearch(searchQuery, selectedFilters);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedFilters({});
  };

  const activeFilterCount = Object.keys(selectedFilters).filter(
    (key) => selectedFilters[key]
  ).length;

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
          {title}
        </Typography>
        {activeFilterCount > 0 && (
          <Chip
            label={`${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
            color="primary"
            size="small"
          />
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        {filters.map((filter) => (
          <FormControl key={filter.name} fullWidth size="small">
            <InputLabel>{filter.label}</InputLabel>
            <Select
              value={selectedFilters[filter.name] || ''}
              onChange={(e) => handleFilterChange(filter.name, e.target.value)}
              label={filter.label}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {filter.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<FilterListIcon />}
          onClick={handleSearch}
        >
          Apply Filters
        </Button>
        <Button variant="outlined" onClick={handleClearFilters}>
          Clear All
        </Button>
      </Box>
    </Paper>
  );
};

export default SearchFilter;
