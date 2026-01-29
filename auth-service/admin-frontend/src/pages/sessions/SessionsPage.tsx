import { useState, useMemo, useCallback } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import type { Column, FetchParams } from '../../components/table/AdvancedDataTable';
import { adminSessionAPI } from '../../services/api';
import type { SessionAdmin, SearchRequest } from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import { useDateFormat } from '../../contexts/DateFormatContext';

const SessionsPage = () => {
  const [data, setData] = useState<SessionAdmin[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const { formatTimestamp } = useDateFormat();

  // Refetch trigger
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const triggerRefetch = useCallback(() => setRefetchTrigger((prev) => prev + 1), []);

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
        triggerRefetch();
      } catch (error) {
        console.error('Failed to revoke session:', error);
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
      {
        id: 'actions',
        label: 'Actions',
        editable: false,
        minWidth: 100,
        render: (row: SessionAdmin) => (
          <Tooltip title="Revoke Session">
            <IconButton
              size="small"
              onClick={() => handleRevokeSession(row.sessionId)}
              disabled={row.revoked}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
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
      />
    </Box>
  );
};

export default SessionsPage;
