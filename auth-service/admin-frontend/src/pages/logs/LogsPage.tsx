import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import type { Column, FetchParams } from '../../components/table/AdvancedDataTable';
import { adminAppLogAPI, adminEntityAPI } from '../../services/api';
import type { AppLogAdmin, SearchRequest, LogStatusData, EntityAdmin } from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import { useDateFormat } from '../../hooks';

const LogsPage = () => {
  const [data, setData] = useState<AppLogAdmin[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [logStatuses, setLogStatuses] = useState<LogStatusData[]>([]);
  const [entities, setEntities] = useState<EntityAdmin[]>([]);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AppLogAdmin | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const { formatTimestamp } = useDateFormat();

  // Load log statuses and entities on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [statusResponse, entityResponse] = await Promise.all([
          adminAppLogAPI.getLogStatuses(),
          adminEntityAPI.getAllEntities(),
        ]);
        setLogStatuses(statusResponse.data);
        setEntities(entityResponse.data);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };
    loadFilterOptions();
  }, []);

  // Server-side fetch with pagination
  const fetchData = useCallback(async (params: FetchParams) => {
    try {
      setLoading(true);
      const searchRequest: SearchRequest = {
        filters: params.filters,
        dateRanges: Object.entries(params.dateRanges).reduce((acc, [key, value]) => {
          if (value.from || value.to) {
            acc[key] = { from: value.from || undefined, to: value.to || undefined };
          }
          return acc;
        }, {} as Record<string, { from?: string; to?: string }>),
        sort: params.sort,
        page: params.page,
        pageSize: params.pageSize,
      };
      const response = await adminAppLogAPI.searchLogs(searchRequest);
      setData(response.data.content);
      setTotalRecords(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle row click to show detail dialog
  const handleRowClick = useCallback(async (rowId: string | number, rowData: any) => {
    setDetailDialogOpen(true);
    setLoadingDetail(true);
    try {
      const response = await adminAppLogAPI.getLog(Number(rowId));
      setSelectedLog(response.data);
    } catch (error) {
      console.error('Failed to fetch log detail:', error);
      setSelectedLog(rowData); // Fall back to row data
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailDialogOpen(false);
    setSelectedLog(null);
  }, []);

  // Map status to StatusChip-compatible status
  const getStatusChipStatus = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'SUCCESS':
        return 'SUCCESS';
      case 'ERROR':
      case 'FAILED':
        return 'ERROR';
      case 'WARNING':
        return 'WARNING';
      case 'INFO':
        return 'INFO';
      case 'DEBUG':
        return 'PENDING';
      default:
        return status;
    }
  };

  // Format duration
  const formatDuration = (durationMs: number | null | undefined): string => {
    if (durationMs === null || durationMs === undefined) {
      return '-';
    }
    if (durationMs < 1000) {
      return `${durationMs}ms`;
    }
    if (durationMs < 60000) {
      return `${(durationMs / 1000).toFixed(2)}s`;
    }
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  };

  // Status options for filter
  const statusOptions = useMemo(() =>
    logStatuses.map(s => ({ label: s.status, value: s.status })),
    [logStatuses]
  );

  // Entity options for filter
  const entityOptions = useMemo(() =>
    entities.map(e => ({ label: e.name, value: e.id })),
    [entities]
  );

  const columns: Column<AppLogAdmin>[] = useMemo(
    () => [
      {
        id: 'id',
        label: 'ID',
        editable: false,
        minWidth: 80,
      },
      {
        id: 'entity',
        label: 'Entity',
        editable: false,
        minWidth: 120,
        filterType: 'select',
        filterOptions: entityOptions,
        render: (row: AppLogAdmin) => row.entityName || row.entity || '-',
      },
      {
        id: 'module',
        label: 'Module',
        editable: false,
        minWidth: 150,
      },
      {
        id: 'status',
        label: 'Status',
        editable: false,
        filterType: 'select',
        filterOptions: statusOptions,
        minWidth: 120,
        render: (row: AppLogAdmin) => (
          <StatusChip
            status={getStatusChipStatus(row.status)}
            label={row.status}
          />
        ),
      },
      {
        id: 'username',
        label: 'User',
        editable: false,
        minWidth: 120,
        render: (row: AppLogAdmin) => row.username || '-',
      },
      {
        id: 'startTime',
        label: 'Start Time',
        editable: false,
        filterType: 'date',
        minWidth: 160,
        render: (row: AppLogAdmin) => formatTimestamp(row.startTime),
      },
      {
        id: 'durationMs',
        label: 'Duration',
        editable: false,
        minWidth: 100,
        render: (row: AppLogAdmin) => formatDuration(row.durationMs),
      },
      {
        id: 'request',
        label: 'Request',
        editable: false,
        minWidth: 200,
        render: (row: AppLogAdmin) => (
          <Typography
            variant="body2"
            sx={{
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
            }}
          >
            {row.request || '-'}
          </Typography>
        ),
      },
      {
        id: 'createUser',
        label: 'Source',
        editable: false,
        minWidth: 130,
      },
    ],
    [formatTimestamp, statusOptions, entityOptions]
  );

  return (
    <Box sx={{ p: 3 }}>
      <AdvancedDataTable
        columns={columns}
        data={data}
        loading={loading}
        onFetchData={fetchData}
        totalRecords={totalRecords}
        title="Application Logs (Read-Only)"
        showExport={true}
        enableSelection={false}
        enableBulkEdit={false}
        rowIdField="id"
        onRowClick={handleRowClick}
        defaultSortColumn="startTime"
        defaultSortOrder="desc"
      />

      {/* Log Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetail}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Log Details {selectedLog ? `#${selectedLog.id}` : ''}
            </Typography>
            <IconButton onClick={handleCloseDetail} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {loadingDetail ? (
            <Typography>Loading...</Typography>
          ) : selectedLog ? (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Entity
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.entityName || selectedLog.entity || '-'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Module
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.module || '-'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusChip
                      status={getStatusChipStatus(selectedLog.status)}
                      label={selectedLog.status}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">
                    {formatDuration(selectedLog.durationMs)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Time
                  </Typography>
                  <Typography variant="body1">
                    {formatTimestamp(selectedLog.startTime)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    End Time
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.endTime ? formatTimestamp(selectedLog.endTime) : '-'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.username || '-'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Source (Create User)
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.createUser || '-'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Request
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      mt: 1,
                      p: 1,
                      backgroundColor: 'action.hover',
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: 200,
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    {selectedLog.request
                      ? (() => {
                          try {
                            return JSON.stringify(JSON.parse(selectedLog.request), null, 2);
                          } catch {
                            return selectedLog.request;
                          }
                        })()
                      : '-'}
                  </Box>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Response
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      mt: 1,
                      p: 1,
                      backgroundColor: 'action.hover',
                      borderRadius: 1,
                      overflow: 'auto',
                      maxHeight: 200,
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    {selectedLog.response
                      ? (() => {
                          try {
                            return JSON.stringify(JSON.parse(selectedLog.response), null, 2);
                          } catch {
                            return selectedLog.response;
                          }
                        })()
                      : '-'}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Typography>No log selected</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LogsPage;
