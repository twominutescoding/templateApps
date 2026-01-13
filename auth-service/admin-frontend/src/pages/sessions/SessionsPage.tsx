import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import type { Column } from '../../components/table/AdvancedDataTable';
import { adminSessionAPI } from '../../services/api';
import type { SessionInfo } from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import { useDateFormat } from '../../context/DateFormatContext';

const SessionsPage = () => {
  const [data, setData] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const { formatTimestamp } = useDateFormat();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminSessionAPI.getAllSessions();
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRevokeSession = async (sessionId: number) => {
    if (confirm('Are you sure you want to revoke this session?')) {
      try {
        await adminSessionAPI.revokeSession(sessionId);
        fetchData();
      } catch (error) {
        console.error('Failed to revoke session:', error);
      }
    }
  };

  const columns: Column<SessionInfo>[] = useMemo(
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
      },
      {
        id: 'createdAt',
        label: 'Created',
        editable: false,
        minWidth: 180,
        render: (row: SessionInfo) => formatTimestamp(row.createdAt),
      },
      {
        id: 'lastUsedAt',
        label: 'Last Used',
        editable: false,
        minWidth: 180,
        render: (row: SessionInfo) => formatTimestamp(row.lastUsedAt),
      },
      {
        id: 'revoked',
        label: 'Status',
        editable: false,
        minWidth: 120,
        render: (row: SessionInfo) => (
          <StatusChip status={row.revoked ? 'REVOKED' : 'ACTIVE'} />
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        editable: false,
        minWidth: 100,
        render: (row: SessionInfo) => (
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
        title="Active Sessions"
        showExport={true}
        enableSelection={false}
        enableBulkEdit={false}
      />
    </Box>
  );
};

export default SessionsPage;
