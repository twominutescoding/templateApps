import { useState, useMemo, useEffect, useCallback } from 'react';
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
  FormControl,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Collapse,
  ToggleButtonGroup,
  ToggleButton,
  TablePagination,
  CircularProgress,
  Backdrop,
  Button,
  Checkbox,
  Menu,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import FilterListIcon from '@mui/icons-material/FilterList';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useDateFormat } from '../../contexts/DateFormatContext';

type Order = 'asc' | 'desc';

interface Column {
  id: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'number' | 'date';
  filterOptions?: { label: string; value: string }[];
  render?: (row: Record<string, any>) => React.ReactNode;
  editable?: boolean;  // Can this column be edited?
  editType?: 'text' | 'select' | 'number' | 'date';  // Input type for editing
  width?: string | number;  // Fixed width for column (e.g., '100px', 100, '10%')
  minWidth?: string | number;  // Minimum width for column
  maxWidth?: string | number;  // Maximum width for column
}

interface DateRange {
  from: Dayjs | null;
  to: Dayjs | null;
}

interface DateRanges {
  [columnId: string]: DateRange;
}

export interface FetchParams {
  filters: Record<string, string>;
  dateRanges: Record<string, { from: string | null; to: string | null }>;
  sort: {
    column: string;
    order: Order;
  };
  page: number;
  pageSize: number;
}

interface AdvancedDataTableProps {
  title: string;
  columns: Column[];
  data: Record<string, any>[];
  defaultSortColumn?: string;
  defaultSortOrder?: Order;
  dateColumn?: string; // Deprecated: kept for backward compatibility

  // Server-side props
  onFetchData?: (params: FetchParams) => Promise<void>;
  totalRecords?: number;
  loading?: boolean;

  // Editable mode props
  onSave?: (row: Record<string, any>) => Promise<void>;
  onBulkSave?: (rows: Record<string, any>[]) => Promise<void>;
  rowIdField?: string;  // Field name for row ID (default: 'id')
  enableBulkEdit?: boolean;  // Enable bulk edit mode (default: false)

  // Filter mode props
  filterTrigger?: 'auto' | 'manual';  // 'auto' = filter on every change, 'manual' = filter on Enter/button click (default: 'auto')

  // Row interaction props
  onRowClick?: (rowId: string | number, rowData: Record<string, any>) => void;  // Callback when row is clicked

  // Actions column props
  renderActions?: (row: Record<string, any>) => React.ReactNode;  // Custom actions renderer (e.g., delete, custom buttons)
  showEditAction?: boolean;  // Show/hide built-in edit button (default: true if onSave provided)
  actionsLabel?: string;  // Custom label for actions column (default: 'Actions')
  actionsWidth?: number;  // Custom width for actions column (default: 120 for edit only, 200 with custom actions)
  showExport?: boolean;  // Show export button (default: false)
  enableSelection?: boolean;  // Enable row selection (default: true)
}

const AdvancedDataTable = ({
  title,
  columns,
  data,
  defaultSortColumn,
  defaultSortOrder = 'asc',
  onFetchData,
  totalRecords,
  loading = false,
  onSave,
  onBulkSave,
  rowIdField = 'id',
  enableBulkEdit = false,
  filterTrigger = 'auto',
  onRowClick,
  renderActions,
  showEditAction = true,
  actionsLabel = 'Actions',
  actionsWidth,
  showExport = false,
  enableSelection = true,
}: AdvancedDataTableProps) => {
  const { formatDate, dateFormat } = useDateFormat();
  const [order, setOrder] = useState<Order>(defaultSortOrder);
  const [orderBy, setOrderBy] = useState<string>(defaultSortColumn || columns[0].id);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [dateRanges, setDateRanges] = useState<DateRanges>({});
  const [pendingColumnFilters, setPendingColumnFilters] = useState<Record<string, string>>({});
  const [pendingDateRanges, setPendingDateRanges] = useState<DateRanges>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterMode, setFilterMode] = useState<'panel' | 'inline'>('inline');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Editable mode state
  const [editingRowId, setEditingRowId] = useState<string | number | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Bulk edit mode state
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEditedData, setBulkEditedData] = useState<Record<string | number, Record<string, any>>>({});

  // Selection state
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // Auto-detect modes
  const isServerSide = !!onFetchData;
  const isEditable = !!onSave || !!onBulkSave;
  const hasEditAction = isEditable && showEditAction && !enableBulkEdit;
  const hasCustomActions = !!renderActions;
  const showActionsColumn = hasEditAction || hasCustomActions;

  // Calculate actions column width
  const calculatedActionsWidth = actionsWidth || (hasEditAction && hasCustomActions ? 250 : hasEditAction ? 120 : 200);

  // Server-side: Trigger fetch when filters/sort/page changes
  useEffect(() => {
    if (isServerSide && onFetchData) {
      const fetchParams: FetchParams = {
        filters: columnFilters,
        dateRanges: Object.entries(dateRanges).reduce((acc, [key, value]) => {
          acc[key] = {
            from: value.from ? value.from.format('YYYY-MM-DD') : null,
            to: value.to ? value.to.format('YYYY-MM-DD') : null,
          };
          return acc;
        }, {} as Record<string, { from: string | null; to: string | null }>),
        sort: {
          column: orderBy,
          order: order,
        },
        page: page,
        pageSize: rowsPerPage,
      };

      onFetchData(fetchParams);
    }
  }, [isServerSide, onFetchData, columnFilters, dateRanges, orderBy, order, page, rowsPerPage]);

  // Editable mode handlers
  const handleEditRow = (row: Record<string, any>) => {
    const rowId = row[rowIdField];
    setEditingRowId(rowId);
    setEditedData({ ...row });
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditedData({});
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveRow = async () => {
    if (!onSave || !editedData) return;

    setSaving(true);
    try {
      await onSave(editedData);
      setEditingRowId(null);
      setEditedData({});

      // If server-side mode, refetch data
      if (isServerSide && onFetchData) {
        const fetchParams: FetchParams = {
          filters: columnFilters,
          dateRanges: Object.entries(dateRanges).reduce((acc, [key, value]) => {
            acc[key] = {
              from: value.from ? value.from.format('YYYY-MM-DD') : null,
              to: value.to ? value.to.format('YYYY-MM-DD') : null,
            };
            return acc;
          }, {} as Record<string, { from: string | null; to: string | null }>),
          sort: {
            column: orderBy,
            order: order,
          },
          page: page,
          pageSize: rowsPerPage,
        };
        await onFetchData(fetchParams);
      }
    } catch (error) {
      console.error('Failed to save row:', error);
      // You can add error handling/notification here
    } finally {
      setSaving(false);
    }
  };

  // Bulk edit mode handlers
  const handleBulkEditStart = () => {
    setBulkEditMode(true);
    // Initialize bulk edit data with current paginated data
    const initialData: Record<string | number, Record<string, any>> = {};
    paginatedData.forEach((row) => {
      const rowId = row[rowIdField];
      initialData[rowId] = { ...row };
    });
    setBulkEditedData(initialData);
  };

  const handleBulkEditCancel = () => {
    setBulkEditMode(false);
    setBulkEditedData({});
  };

  const handleBulkFieldChange = (rowId: string | number, field: string, value: any) => {
    setBulkEditedData((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [field]: value,
      },
    }));
  };

  const handleBulkSaveAll = async () => {
    if (!onBulkSave && !onSave) return;

    setSaving(true);
    try {
      const rowsToSave = Object.values(bulkEditedData);

      if (onBulkSave) {
        // Use bulk save callback if provided
        await onBulkSave(rowsToSave);
      } else if (onSave) {
        // Fall back to saving individually
        await Promise.all(rowsToSave.map((row) => onSave(row)));
      }

      setBulkEditMode(false);
      setBulkEditedData({});

      // If server-side mode, refetch data
      if (isServerSide && onFetchData) {
        const fetchParams: FetchParams = {
          filters: columnFilters,
          dateRanges: Object.entries(dateRanges).reduce((acc, [key, value]) => {
            acc[key] = {
              from: value.from ? value.from.format('YYYY-MM-DD') : null,
              to: value.to ? value.to.format('YYYY-MM-DD') : null,
            };
            return acc;
          }, {} as Record<string, { from: string | null; to: string | null }>),
          sort: {
            column: orderBy,
            order: order,
          },
          page: page,
          pageSize: rowsPerPage,
        };
        await onFetchData(fetchParams);
      }
    } catch (error) {
      console.error('Failed to save rows:', error);
      // You can add error handling/notification here
    } finally {
      setSaving(false);
    }
  };

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Selection handlers
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = new Set(paginatedData.map((row) => row[rowIdField]));
      setSelected(newSelected);
    } else {
      setSelected(new Set());
    }
  };

  const handleSelectClick = (id: string | number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const isSelected = (id: string | number) => selected.has(id);

  // Row click handler
  const handleRowClick = (rowId: string | number, rowData: Record<string, any>) => {
    if (onRowClick) {
      onRowClick(rowId, rowData);
    }
  };

  // Export handlers
  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const exportToCSV = () => {
    const dataToExport = selected.size > 0
      ? paginatedData.filter((row) => selected.has(row[rowIdField]))
      : paginatedData;

    if (dataToExport.length === 0) {
      alert('No data to export');
      return;
    }

    // Get headers from columns
    const headers = columns.map((col) => col.label).join(',');

    // Convert data to CSV rows
    const csvRows = dataToExport.map((row) => {
      return columns
        .map((col) => {
          let value = row[col.id];
          // Handle dates
          if (col.filterType === 'date' && value) {
            value = formatDate(new Date(value));
          }
          // Escape quotes and wrap in quotes if contains comma
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',');
    });

    const csv = [headers, ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    handleExportClose();
  };

  const exportToJSON = () => {
    const dataToExport = selected.size > 0
      ? paginatedData.filter((row) => selected.has(row[rowIdField]))
      : paginatedData;

    if (dataToExport.length === 0) {
      alert('No data to export');
      return;
    }

    const json = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    handleExportClose();
  };

  const handleColumnFilterChange = useCallback((columnId: string, value: string) => {
    if (filterTrigger === 'manual') {
      // In manual mode, update pending filters only
      setPendingColumnFilters((prev) => ({
        ...prev,
        [columnId]: value,
      }));
    } else {
      // In auto mode, update actual filters immediately
      setColumnFilters((prev) => ({
        ...prev,
        [columnId]: value,
      }));
    }
  }, [filterTrigger]);

  const applyFilters = useCallback(() => {
    // Apply pending filters to actual filters
    setColumnFilters(pendingColumnFilters);
    setDateRanges(pendingDateRanges);
    setPage(0); // Reset to first page when applying filters
  }, [pendingColumnFilters, pendingDateRanges]);

  const handleFilterKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filterTrigger === 'manual') {
      applyFilters();
    }
  }, [filterTrigger, applyFilters]);

  const handleClearFilters = () => {
    setColumnFilters({});
    setDateRanges({});
    setPendingColumnFilters({});
    setPendingDateRanges({});
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateChange = useCallback((columnId: string, field: 'from' | 'to', value: Dayjs | null) => {
    if (filterTrigger === 'manual') {
      // In manual mode, update pending date ranges only
      setPendingDateRanges((prev) => ({
        ...prev,
        [columnId]: {
          ...(prev[columnId] || { from: null, to: null }),
          [field]: value,
        },
      }));
    } else {
      // In auto mode, update actual date ranges immediately
      setDateRanges((prev) => ({
        ...prev,
        [columnId]: {
          ...(prev[columnId] || { from: null, to: null }),
          [field]: value,
        },
      }));
      setPage(0);
    }
  }, [filterTrigger]);

  const activeFilterCount = useMemo(() => {
    let count = Object.values(columnFilters).filter((v) => v).length;
    // Count date range filters
    Object.values(dateRanges).forEach((range) => {
      if (range.from || range.to) count++;
    });
    return count;
  }, [columnFilters, dateRanges]);

  const filteredAndSortedData = useMemo(() => {
    // Server-side mode: data is already filtered/sorted by backend
    if (isServerSide) {
      return data;
    }

    // Client-side mode: filter and sort data locally
    let filtered = [...data];

    // Apply column filters
    Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter((row) => {
          const cellValue = String(row[columnId]).toLowerCase();
          return cellValue.includes(filterValue.toLowerCase());
        });
      }
    });

    // Apply date range filters for all date columns
    Object.entries(dateRanges).forEach(([columnId, dateRange]) => {
      if (dateRange.from || dateRange.to) {
        filtered = filtered.filter((row) => {
          const rowDate = dayjs(row[columnId]);
          const fromDate = dateRange.from;
          const toDate = dateRange.to;

          if (fromDate && toDate) {
            return (rowDate.isAfter(fromDate.subtract(1, 'day')) && rowDate.isBefore(toDate.add(1, 'day')));
          } else if (fromDate) {
            return rowDate.isAfter(fromDate.subtract(1, 'day'));
          } else if (toDate) {
            return rowDate.isBefore(toDate.add(1, 'day'));
          }
          return true;
        });
      }
    });

    // Sort data
    const sorted = filtered.sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue === bValue) return 0;

      // Check if the current column is a date column
      const currentColumn = columns.find(col => col.id === orderBy);
      const isDateColumn = currentColumn?.filterType === 'date';

      // Handle dates
      if (isDateColumn) {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        return order === 'asc' ? aDate - bDate : bDate - aDate;
      }

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
  }, [isServerSide, data, columnFilters, dateRanges, order, orderBy, columns]);

  // Paginated data
  const paginatedData = useMemo(() => {
    // Server-side mode: data is already paginated by backend
    if (isServerSide) {
      return filteredAndSortedData;
    }

    // Client-side mode: paginate locally
    const startIndex = page * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [isServerSide, filteredAndSortedData, page, rowsPerPage]);

  const renderEditableCell = (row: Record<string, any>, column: Column) => {
    const rowId = row[rowIdField];
    const isEditing = editingRowId === rowId || bulkEditMode;

    // If not editing this row, show regular content
    if (!isEditing) {
      return column.render
        ? column.render(row)
        : column.filterType === 'date'
        ? formatDate(new Date(row[column.id]))
        : row[column.id];
    }

    // If column is not editable, show regular content even in edit mode
    if (!column.editable) {
      return column.render
        ? column.render(row)
        : column.filterType === 'date'
        ? formatDate(new Date(row[column.id]))
        : row[column.id];
    }

    // Show edit controls
    const editType = column.editType || column.filterType || 'text';
    const value = bulkEditMode
      ? bulkEditedData[rowId]?.[column.id]
      : editedData[column.id];

    const onChange = bulkEditMode
      ? (field: string, val: any) => handleBulkFieldChange(rowId, field, val)
      : handleFieldChange;

    if (editType === 'date') {
      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={value ? dayjs(value) : null}
            onChange={(newValue) => onChange(column.id, newValue?.format('YYYY-MM-DD'))}
            format={dateFormat}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
                InputLabelProps: {
                  style: {
                    fontSize: '0.813rem'
                  }
                },
                sx: {
                  fontSize: '0.813rem !important',
                  '& *': { fontSize: '0.813rem !important' },
                  '& .MuiInputBase-input': {
                    padding: '4px 8px'
                  }
                }
              }
            }}
            sx={{
              '& .MuiSvgIcon-root': { fontSize: '1rem' }
            }}
          />
        </LocalizationProvider>
      );
    }

    if (editType === 'select' && column.filterOptions) {
      return (
        <FormControl fullWidth size="small">
          <Select
            value={value || ''}
            onChange={(e) => onChange(column.id, e.target.value)}
            sx={{
              '& .MuiSelect-select': { fontSize: '0.813rem', padding: '4px 8px' }
            }}
          >
            {column.filterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.813rem' }}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    return (
      <TextField
        fullWidth
        size="small"
        value={value || ''}
        onChange={(e) => onChange(column.id, e.target.value)}
        type={editType === 'number' ? 'number' : 'text'}
        sx={{
          '& .MuiInputBase-input': { fontSize: '0.813rem', padding: '4px 8px' },
          // Hide number input spinners
          '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
          '& input[type=number]': {
            MozAppearance: 'textfield',
          },
        }}
      />
    );
  };

  const renderFilter = (column: Column) => {
    if (column.filterable === false) return null;

    const filterType = column.filterType || 'text';

    // Get current filter values based on filter trigger mode
    const currentFilters = filterTrigger === 'manual' ? pendingColumnFilters : columnFilters;
    const currentDateRanges = filterTrigger === 'manual' ? pendingDateRanges : dateRanges;

    // Date column - show from/to date pickers
    if (filterType === 'date') {
      const columnDateRange = currentDateRanges[column.id] || { from: null, to: null };

      // Convert date format to dayjs format
      const getDatePickerFormat = () => {
        switch (dateFormat) {
          case 'DD.MM.YYYY':
            return 'DD.MM.YYYY';
          case 'MM/DD/YYYY':
            return 'MM/DD/YYYY';
          case 'YYYY-MM-DD':
            return 'YYYY-MM-DD';
          default:
            return 'DD.MM.YYYY';
        }
      };

      return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, maxWidth: '140px' }}>
            <DatePicker
              label="From"
              value={columnDateRange.from}
              onChange={(newValue) => handleDateChange(column.id, 'from', newValue)}
              format={getDatePickerFormat()}
              slotProps={{
                textField: {
                  size: 'small',
                  InputLabelProps: {
                    style: {
                      fontSize: '0.813rem'
                    }
                  },
                  sx: {
                    fontSize: '0.813rem !important',
                    '& *': { fontSize: '0.813rem !important' },
                    '& .MuiInputBase-input': {
                      padding: '0'
                    }
                  }
                }
              }}
              sx={{
                '& .MuiSvgIcon-root': { fontSize: '1rem' }
              }}
            />
            <DatePicker
              label="To"
              value={columnDateRange.to}
              onChange={(newValue) => handleDateChange(column.id, 'to', newValue)}
              format={getDatePickerFormat()}
              slotProps={{
                textField: {
                  size: 'small',
                  InputLabelProps: {
                    style: {
                      fontSize: '0.813rem'
                    }
                  },
                  sx: {
                    fontSize: '0.813rem !important',
                    '& *': { fontSize: '0.813rem !important' },
                    '& .MuiInputBase-input': {
                      padding: '0'
                    }
                  }
                }
              }}
              sx={{
                '& .MuiSvgIcon-root': { fontSize: '1rem' }
              }}
            />
          </Box>
        </LocalizationProvider>
      );
    }

    if (filterType === 'select' && column.filterOptions) {
      return (
        <FormControl fullWidth size="small" sx={{ minWidth: 100 }}>
          <Select
            value={currentFilters[column.id] || ''}
            onChange={(e) => handleColumnFilterChange(column.id, e.target.value)}
            displayEmpty
            sx={{ fontSize: '0.875rem', '& .MuiSelect-select': { py: 0.5 } }}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {column.filterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    return (
      <TextField
        fullWidth
        size="small"
        placeholder={`Filter...`}
        value={currentFilters[column.id] || ''}
        onChange={(e) => handleColumnFilterChange(column.id, e.target.value)}
        onKeyPress={handleFilterKeyPress}
        type={filterType === 'number' ? 'number' : 'text'}
        sx={{
          '& .MuiInputBase-input': { fontSize: '0.875rem', py: 0.5 },
          // Hide number input spinners
          '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
          '& input[type=number]': {
            MozAppearance: 'textfield',
          },
        }}
      />
    );
  };

  return (
    <Paper sx={{ p: 3, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isServerSide && loading && data.length > 0 && (
              <CircularProgress size={20} thickness={4} />
            )}
          </Box>
          {activeFilterCount > 0 && (
            <Chip
              label={`${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
              size="small"
              onDelete={handleClearFilters}
              sx={{
                backgroundColor: '#42a5f5',
                color: '#fff',
                '& .MuiChip-deleteIcon': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    color: '#fff',
                  },
                },
              }}
            />
          )}
          <Chip
            label={`${isServerSide ? (totalRecords || 0) : filteredAndSortedData.length} ${isServerSide ? 'total' : `of ${data.length}`} rows`}
            size="small"
            variant="outlined"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Bulk Edit Buttons */}
          {isEditable && enableBulkEdit && (
            <>
              {bulkEditMode ? (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleBulkSaveAll}
                    disabled={saving}
                    sx={{
                      backgroundColor: '#66bb6a',
                      '&:hover': {
                        backgroundColor: '#43a047',
                      },
                    }}
                  >
                    Save All
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleBulkEditCancel}
                    disabled={saving}
                    sx={{
                      color: '#bdbdbd',
                      borderColor: '#bdbdbd',
                      '&:hover': {
                        backgroundColor: 'rgba(189, 189, 189, 0.15)',
                        borderColor: '#9e9e9e',
                      },
                    }}
                  >
                    Cancel All
                  </Button>
                </>
              ) : (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleBulkEditStart}
                  disabled={editingRowId !== null}
                  sx={{
                    color: '#42a5f5',
                    borderColor: '#42a5f5',
                    '&:hover': {
                      backgroundColor: 'rgba(66, 165, 245, 0.15)',
                      borderColor: '#64b5f6',
                    },
                  }}
                >
                  Edit All
                </Button>
              )}
            </>
          )}

          {filterTrigger === 'manual' && (
            <Button
              size="small"
              variant="contained"
              onClick={applyFilters}
              sx={{
                backgroundColor: '#42a5f5',
                '&:hover': {
                  backgroundColor: '#1e88e5',
                },
              }}
            >
              Apply Filters
            </Button>
          )}

          <Button
            size="small"
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportClick}
          >
            Export {selected.size > 0 ? `(${selected.size})` : ''}
          </Button>
          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={handleExportClose}
          >
            <MenuItem onClick={exportToCSV}>Export to CSV</MenuItem>
            <MenuItem onClick={exportToJSON}>Export to JSON</MenuItem>
          </Menu>

          <ToggleButtonGroup
            value={filterMode}
            exclusive
            onChange={(_e, newMode) => newMode && setFilterMode(newMode)}
            size="small"
          >
            <ToggleButton value="inline" aria-label="inline filters">
              <ViewHeadlineIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="panel" aria-label="panel filters">
              <ViewAgendaIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          {filterMode === 'panel' && (
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                color: showFilters ? '#42a5f5' : 'action.active',
                '&:hover': {
                  backgroundColor: 'rgba(66, 165, 245, 0.15)',
                },
              }}
            >
              <FilterListIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      <Collapse in={filterMode === 'panel' && showFilters}>
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            Column Filters
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {columns.map((column) => (
              <Box key={column.id}>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                  {column.label}
                </Typography>
                {renderFilter(column)}
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {enableSelection && (
                <TableCell padding="checkbox" sx={{ py: 1 }}>
                  <Checkbox
                    indeterminate={selected.size > 0 && selected.size < paginatedData.length}
                    checked={paginatedData.length > 0 && selected.size === paginatedData.length}
                    onChange={handleSelectAllClick}
                    size="small"
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{
                    py: 1,
                    fontWeight: 600,
                    ...(column.width && { width: column.width }),
                    ...(column.minWidth && { minWidth: column.minWidth }),
                    ...(column.maxWidth && { maxWidth: column.maxWidth }),
                  }}
                >
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
              {showActionsColumn && (
                <TableCell sx={{ py: 1, fontWeight: 600, width: calculatedActionsWidth }}>
                  {actionsLabel}
                </TableCell>
              )}
            </TableRow>
            {filterMode === 'inline' && (
              <TableRow>
                {enableSelection && <TableCell padding="checkbox" />}
                {columns.map((column) => (
                  <TableCell
                    key={`filter-${column.id}`}
                    sx={{
                      py: 0.5,
                      px: 1,
                      ...(column.width && { width: column.width }),
                      ...(column.minWidth && { minWidth: column.minWidth }),
                      ...(column.maxWidth && { maxWidth: column.maxWidth }),
                    }}
                  >
                    {renderFilter(column)}
                  </TableCell>
                ))}
                {showActionsColumn && (
                  <TableCell sx={{ py: 0.5, px: 1 }} />
                )}
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showActionsColumn ? 1 : 0) + 1} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No results found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const rowId = row[rowIdField];
                const isEditing = editingRowId === rowId;
                const isItemSelected = isSelected(rowId);

                return (
                  <TableRow
                    key={index}
                    hover
                    selected={isItemSelected}
                    onClick={() => handleRowClick(rowId, row)}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      '&:hover': onRowClick ? { backgroundColor: 'action.hover' } : {}
                    }}
                  >
                    {enableSelection && (
                      <TableCell
                        padding="checkbox"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isItemSelected}
                          onChange={() => handleSelectClick(rowId)}
                          size="small"
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        sx={{
                          ...(column.width && { width: column.width }),
                          ...(column.minWidth && { minWidth: column.minWidth }),
                          ...(column.maxWidth && { maxWidth: column.maxWidth }),
                        }}
                        onClick={(e) => (isEditing || bulkEditMode) ? e.stopPropagation() : undefined}
                      >
                        {isEditable ? renderEditableCell(row, column) : (
                          column.render
                            ? column.render(row)
                            : column.filterType === 'date'
                            ? formatDate(new Date(row[column.id]))
                            : row[column.id]
                        )}
                      </TableCell>
                    ))}
                    {showActionsColumn && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                          {hasEditAction && (
                            <>
                              {isEditing ? (
                                <>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSaveRow}
                                    disabled={saving}
                                    sx={{
                                      backgroundColor: '#66bb6a',
                                      '&:hover': {
                                        backgroundColor: '#43a047',
                                      },
                                    }}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<CancelIcon />}
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                    sx={{
                                      color: '#bdbdbd',
                                      borderColor: '#bdbdbd',
                                      '&:hover': {
                                        backgroundColor: 'rgba(189, 189, 189, 0.15)',
                                        borderColor: '#9e9e9e',
                                      },
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditRow(row)}
                                    disabled={editingRowId !== null}
                                    sx={{
                                      color: '#42a5f5',
                                      '&:hover': {
                                        backgroundColor: 'rgba(66, 165, 245, 0.15)',
                                        color: '#64b5f6',
                                      },
                                      '&.Mui-disabled': {
                                        color: 'action.disabled',
                                      },
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          )}
                          {hasCustomActions && !isEditing && renderActions && renderActions(row)}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={isServerSide ? (totalRecords || 0) : filteredAndSortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Loading indicator for server-side mode - only show for initial load or when no data */}
      {isServerSide && loading && data.length === 0 && (
        <Backdrop
          open={loading}
          sx={{
            position: 'absolute',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'transparent',
          }}
        >
          <CircularProgress />
        </Backdrop>
      )}
    </Paper>
  );
};

export default AdvancedDataTable;
