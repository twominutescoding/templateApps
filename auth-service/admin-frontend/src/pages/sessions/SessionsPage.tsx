import { useState, useMemo, useCallback } from 'react';
import { Box, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import type { Column, FetchParams } from '../../components/table/AdvancedDataTable';
import { adminSessionAPI } from '../../services/api';
import type { SessionAdmin, SearchRequest } from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import { useDateFormat } from '../../hooks';

const SessionsPage = () => {
  const [data, setData] = useState<SessionAdmin[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const { formatTimestamp } = useDateFormat();

  // Refetch trigger
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const triggerRefetch = useCallback(() => setRefetchTrigger((prev) => prev + 1), []);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

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
      const response = await adminSessionAPI.searchSessions(searchRequest);
      setData(response.data.content);
      setTotalRecords(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRevokeSession = useCallback(async (sessionId: number) => {
    if (confirm('Are you sure you want to revoke this session?')) {
      try {
        await adminSessionAPI.revokeSession(sessionId);
        setSnackbar({ open: true, message: 'Session revoked successfully', severity: 'success' });
        triggerRefetch();
      } catch (error: any) {
        console.error('Failed to revoke session:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to revoke session',
          severity: 'error',
        });
      }
    }
  }, [triggerRefetch]);

  const columns: Column<SessionAdmin>[] = useMemo(
    () => [
      {
        id: 'username',
        label: 'Username',
        editable: false,
        minWidth: 150,
      },
      {
        id: 'deviceName',
        label: 'Device',
        editable: false,
        minWidth: 180,
      },
      {
        id: 'ipAddress',
        label: 'IP Address',
        editable: false,
        minWidth: 140,
      },
      {
        id: 'entity',
        label: 'Entity',
        editable: false,
        minWidth: 120,
        render: (row: SessionAdmin) => row.entityName || row.entity,
      },
      {
        id: 'createdAt',
        label: 'Created',
        editable: false,
        minWidth: 180,
        render: (row: SessionAdmin) => formatTimestamp(row.createdAt),
      },
      {
        id: 'lastUsedAt',
        label: 'Last Used',
        editable: false,
        minWidth: 180,
        render: (row: SessionAdmin) => formatTimestamp(row.lastUsedAt),
      },
      {
        id: 'revoked',
        label: 'Status',
        editable: false,
        minWidth: 120,
        render: (row: SessionAdmin) => (
          <StatusChip status={row.revoked ? 'REVOKED' : 'ACTIVE'} />
        ),
      },
    ],
    [formatTimestamp]
  );

  return (
    <Box sx={{ p: 3 }}>
      <AdvancedDataTable
        columns={columns}
        data={data}
        loading={loading}
        onFetchData={fetchData}
        totalRecords={totalRecords}
        title="Active Sessions"
        showExport={true}
        enableSelection={true}
        enableBulkEdit={false}
        rowIdField="sessionId"
        key={refetchTrigger}
        renderActions={(row: SessionAdmin) => (
          <Tooltip title="Revoke Session">
            <IconButton
              size="small"
              onClick={() => handleRevokeSession(row.sessionId)}
              disabled={row.revoked}
              sx={{
                color: row.revoked ? 'text.disabled' : 'error.main',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'error.contrastText',
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SessionsPage;
