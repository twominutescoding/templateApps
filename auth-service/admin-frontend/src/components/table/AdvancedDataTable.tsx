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
  Popover,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDateFormat } from '../../hooks';
import { useThemeContext } from '../../theme/ThemeContext';

type Order = 'asc' | 'desc';

export interface Column<T = Record<string, unknown>> {
  id: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'number' | 'date';
  filterOptions?: { label: string; value: string }[];
  render?: (row: T) => React.ReactNode;
  editable?: boolean;
  editType?: 'text' | 'select' | 'number' | 'date';
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: 'left' | 'right' | 'center';  // Defaults to 'right' when filterType='number'
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
  columns: Column<any>[];
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

  // Bulk edit always-on mode — fields are always visible as inputs, no Edit All/Cancel All toggle
  defaultBulkEditMode?: boolean;
  // Auto-save: called on field blur when value changed; parent refreshes data after API call
  onAutoSave?: (row: Record<string, any>) => Promise<void>;

  // Row interaction props
  onRowClick?: (rowId: string | number, rowData: Record<string, any>) => void;  // Callback when row is clicked
  onRowDoubleClick?: (rowId: string | number, rowData: Record<string, any>) => void;  // Callback when row is double-clicked

  // Actions column props
  renderActions?: (row: Record<string, any>) => React.ReactNode;  // Custom actions renderer (e.g., delete, custom buttons)
  showEditAction?: boolean;  // Show/hide built-in edit button (default: true if onSave provided)
  actionsLabel?: string;  // Custom label for actions column (default: 'Actions')
  actionsWidth?: number;  // Custom width for actions column (default: 120 for edit only, 200 with custom actions)
  showExport?: boolean;  // Show export button (default: false)
  enableSelection?: boolean;  // Enable row selection (default: true)
  refetchTrigger?: number;  // Increment to trigger a refetch without remounting (preserves filters)
}

function DateRangeFilterPopover({
  value,
  onChange,
}: {
  value: { from: Dayjs | null; to: Dayjs | null };
  onChange: (field: 'from' | 'to', val: Dayjs | null) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const fromStr = value.from ? value.from.format('DD.MM.YY') : null;
  const toStr = value.to ? value.to.format('DD.MM.YY') : null;
  const hasValue = value.from || value.to;
  const label = hasValue ? `${fromStr ?? '–'} — ${toStr ?? '–'}` : 'OD — DO';

  return (
    <>
      <Button
        size="small"
        variant={hasValue ? 'contained' : 'outlined'}
        startIcon={<CalendarMonthIcon sx={{ fontSize: '0.85rem !important' }} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          fontSize: '0.7rem',
          py: '2px',
          px: '6px',
          minWidth: 0,
          whiteSpace: 'nowrap',
          lineHeight: 1.4,
          textTransform: 'none',
        }}
      >
        {label}
      </Button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, minWidth: 160 }}>
          <TextField
            type="date"
            size="small"
            label="OD"
            value={value.from ? value.from.format('YYYY-MM-DD') : ''}
            onChange={(e) => onChange('from', e.target.value ? dayjs(e.target.value) : null)}
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem', py: '5px' } }}
          />
          <TextField
            type="date"
            size="small"
            label="DO"
            value={value.to ? value.to.format('YYYY-MM-DD') : ''}
            onChange={(e) => onChange('to', e.target.value ? dayjs(e.target.value) : null)}
            InputLabelProps={{ shrink: true }}
            sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem', py: '5px' } }}
          />
          {hasValue && (
            <Button
              size="small"
              color="inherit"
              sx={{ fontSize: '0.75rem', py: '2px' }}
              onClick={() => { onChange('from', null); onChange('to', null); }}
            >
              Obriši
            </Button>
          )}
        </Box>
      </Popover>
    </>
  );
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
  defaultBulkEditMode = false,
  onAutoSave,
  onRowClick,
  onRowDoubleClick,
  renderActions,
  showEditAction = true,
  actionsLabel = 'Actions',
  actionsWidth,
  showExport = false,
  enableSelection = true,
  refetchTrigger,
}: AdvancedDataTableProps) => {
  const { formatDate, dateFormat } = useDateFormat();
  const { headerGradient } = useThemeContext();
  const [order, setOrder] = useState<Order>(defaultSortOrder);
  const [orderBy, setOrderBy] = useState<string>(defaultSortColumn || columns[0].id);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [dateRanges, setDateRanges] = useState<DateRanges>({});
  const [pendingColumnFilters, setPendingColumnFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterMode, setFilterMode] = useState<'panel' | 'inline'>('inline');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Editable mode state
  const [editingRowId, setEditingRowId] = useState<string | number | null>(null);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Bulk edit mode state
  const [bulkEditMode, setBulkEditMode] = useState(defaultBulkEditMode);
  const [bulkEditedData, setBulkEditedData] = useState<Record<string | number, Record<string, any>>>({});

  // Selection state
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // Auto-detect modes
  const isServerSide = !!onFetchData;
  const isEditable = !!onSave || !!onBulkSave || !!onAutoSave;
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
  }, [isServerSide, onFetchData, columnFilters, dateRanges, orderBy, order, page, rowsPerPage, refetchTrigger]);

  // When defaultBulkEditMode, keep bulkEditedData in sync with incoming data
  useEffect(() => {
    if (defaultBulkEditMode && data.length > 0) {
      const initialData: Record<string | number, Record<string, any>> = {};
      data.forEach((row) => {
        const rowId = row[rowIdField];
        initialData[rowId] = { ...row };
      });
      setBulkEditedData(initialData);
      setBulkEditMode(true);
    }
  }, [defaultBulkEditMode, data, rowIdField]);

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

      if (!defaultBulkEditMode) {
        setBulkEditMode(false);
        setBulkEditedData({});
      }

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

  // immediate=true for select filters; false (default) for text/number — pending until Enter
  const handleColumnFilterChange = useCallback((columnId: string, value: string, immediate = false) => {
    if (immediate) {
      setColumnFilters((prev) => ({ ...prev, [columnId]: value }));
      setPendingColumnFilters((prev) => ({ ...prev, [columnId]: value }));
      setPage(0);
    } else {
      setPendingColumnFilters((prev) => ({ ...prev, [columnId]: value }));
    }
  }, []);

  // Applies pending text/number filters (called on Enter)
  const applyFilters = useCallback(() => {
    setColumnFilters((prev) => ({ ...prev, ...pendingColumnFilters }));
    setPage(0);
  }, [pendingColumnFilters]);

  const handleFilterKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyFilters();
  }, [applyFilters]);

  const handleClearFilters = () => {
    setColumnFilters({});
    setDateRanges({});
    setPendingColumnFilters({});
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Dates always fire immediately
  const handleDateChange = useCallback((columnId: string, field: 'from' | 'to', value: Dayjs | null) => {
    setDateRanges((prev) => ({
      ...prev,
      [columnId]: { ...(prev[columnId] || { from: null, to: null }), [field]: value },
    }));
    setPage(0);
  }, []);

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

    const handleAutoSaveBlur = defaultBulkEditMode && onAutoSave
      ? async (e: React.FocusEvent<HTMLInputElement>) => {
          // Read from DOM directly — bulkEditedData may be stale (onChange and onBlur
          // fire in the same browser task before React flushes the state update)
          const currentValue = e.target.value;
          const original = row[column.id];
          if (String(currentValue) !== String(original ?? '')) {
            const fullRow = {
              ...row,
              ...(bulkEditedData[rowId] || {}),
              [column.id]: editType === 'number' && currentValue !== ''
                ? Number(currentValue)
                : (currentValue || null),
            };
            await onAutoSave(fullRow);
          }
        }
      : undefined;

    return (
      <TextField
        fullWidth
        size="small"
        value={value || ''}
        onChange={(e) => onChange(column.id, e.target.value)}
        onBlur={handleAutoSaveBlur}
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

    // Text filters show pending value; select shows applied value
    const currentFilters = pendingColumnFilters;
    const currentDateRanges = dateRanges;

    // Date column - compact popover with native date inputs
    if (filterType === 'date') {
      const columnDateRange = currentDateRanges[column.id] || { from: null, to: null };
      return (
        <DateRangeFilterPopover
          value={columnDateRange}
          onChange={(field, val) => handleDateChange(column.id, field, val)}
        />
      );
    }

    if (filterType === 'select' && column.filterOptions) {
      return (
        <FormControl fullWidth size="small" sx={{ minWidth: 80 }}>
          <Select
            value={currentFilters[column.id] || ''}
            onChange={(e) => handleColumnFilterChange(column.id, e.target.value, true)}
            displayEmpty
            sx={{ fontSize: '0.75rem', '& .MuiSelect-select': { py: '3px', px: '8px' } }}
          >
            <MenuItem value="" sx={{ fontSize: '0.75rem' }}>
              <em>Sve</em>
            </MenuItem>
            {column.filterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.75rem' }}>
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
        placeholder="Filter..."
        value={currentFilters[column.id] || ''}
        onChange={(e) => handleColumnFilterChange(column.id, e.target.value)}
        onKeyPress={handleFilterKeyPress}
        type={filterType === 'number' ? 'number' : 'text'}
        sx={{
          '& .MuiInputBase-input': { fontSize: '0.75rem', py: '3px', px: '6px' },
          '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
          '& input[type=number]': { MozAppearance: 'textfield' },
        }}
      />
    );
  };

  return (
    <Paper sx={{ p: 1.5, position: 'relative', overflow: 'hidden', isolation: 'isolate', '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: headerGradient, zIndex: 1 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isServerSide && loading && data.length > 0 && (
              <CircularProgress size={20} thickness={4} />
            )}
          </Box>
          {isServerSide && (
            <Tooltip title="Refresh">
              <IconButton
                size="small"
                onClick={() => onFetchData?.({
                  filters: columnFilters,
                  dateRanges: Object.entries(dateRanges).reduce((acc, [key, value]) => {
                    acc[key] = {
                      from: value.from ? value.from.format('YYYY-MM-DD') : null,
                      to: value.to ? value.to.format('YYYY-MM-DD') : null,
                    };
                    return acc;
                  }, {} as Record<string, { from: string | null; to: string | null }>),
                  sort: { column: orderBy, order },
                  page,
                  pageSize: rowsPerPage,
                })}
                disabled={loading}
                sx={{
                  color: 'action.active',
                  '&:hover': {
                    backgroundColor: 'rgba(66, 165, 245, 0.15)',
                    color: '#42a5f5',
                  },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
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
                  {!onAutoSave && (
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
                      Spremi sve
                    </Button>
                  )}
                  {!defaultBulkEditMode && (
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
                  )}
                </>
              ) : (
                !defaultBulkEditMode && (
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
                )
              )}
            </>
          )}

          {filterMode === 'panel' && (
            <Button
              size="small"
              variant="contained"
              onClick={applyFilters}
              sx={{
                backgroundColor: '#42a5f5',
                '&:hover': { backgroundColor: '#1e88e5' },
              }}
            >
              Primijeni filtere
            </Button>
          )}

          {showExport && (
            <>
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
            </>
          )}

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
        <Box sx={{ mb: 1.5, p: 1.5, backgroundColor: 'action.hover', borderRadius: 1 }}>
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
        <Table
          size="small"
          sx={{
            '& .MuiTableCell-root': { fontSize: '0.78rem' },
            '& .MuiTableCell-head': { py: '5px', px: '8px', fontWeight: 600, lineHeight: 1.3 },
            '& .MuiTableCell-body': { py: '2px', px: '8px', lineHeight: 1.4 },
            '& .MuiTableSortLabel-root': { fontSize: '0.78rem' },
            '& .MuiTableSortLabel-icon': { fontSize: '0.9rem !important' },
          }}
        >
          <TableHead>
            <TableRow>
              {enableSelection && (
                <TableCell padding="checkbox">
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
                  align={column.align ?? (column.filterType === 'number' ? 'right' : 'left')}
                  sx={{
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
                <TableCell sx={{ width: calculatedActionsWidth }}>
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
                      py: '3px',
                      px: '4px',
                      ...(column.width && { width: column.width }),
                      ...(column.minWidth && { minWidth: column.minWidth }),
                      ...(column.maxWidth && { maxWidth: column.maxWidth }),
                    }}
                  >
                    {renderFilter(column)}
                  </TableCell>
                ))}
                {showActionsColumn && (
                  <TableCell sx={{ py: '3px', px: '4px' }} />
                )}
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showActionsColumn ? 1 : 0) + 1} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nema rezultata
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
                    onDoubleClick={onRowDoubleClick ? () => onRowDoubleClick(rowId, row) : undefined}
                    sx={{
                      cursor: (onRowClick || onRowDoubleClick) ? 'pointer' : 'default',
                      '&:hover': (onRowClick || onRowDoubleClick) ? { backgroundColor: 'action.hover' } : {}
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
                        align={column.align ?? (column.filterType === 'number' ? 'right' : 'left')}
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
        rowsPerPageOptions={[15, 25, 50, 100]}
        component="div"
        count={isServerSide ? (totalRecords || 0) : filteredAndSortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          '& .MuiTablePagination-toolbar': { minHeight: 36, fontSize: '0.78rem' },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.78rem' },
          '& .MuiTablePagination-select': { fontSize: '0.78rem' },
          '& .MuiTablePagination-actions .MuiIconButton-root': { padding: '4px' },
        }}
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
