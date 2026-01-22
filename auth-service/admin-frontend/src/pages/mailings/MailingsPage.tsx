import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Chip } from '@mui/material';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import type { Column } from '../../components/table/AdvancedDataTable';
import { adminMailingAPI } from '../../services/api';
import type { MailingAdmin } from '../../services/api';
import { useDateFormat } from '../../contexts/DateFormatContext';

const MailingsPage = () => {
  const [data, setData] = useState<MailingAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const { formatTimestamp } = useDateFormat();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminMailingAPI.getAllMailings();
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch mailings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sent status options for filtering
  const sentOptions = [
    { label: 'Sent', value: 'Y' },
    { label: 'Not Sent', value: 'N' },
  ];

  const columns: Column<MailingAdmin>[] = useMemo(
    () => [
      {
        id: 'id',
        label: 'ID',
        editable: false,
        minWidth: 80,
      },
      {
        id: 'subject',
        label: 'Subject',
        editable: false,
        minWidth: 250,
      },
      {
        id: 'mailingList',
        label: 'Mailing List',
        editable: false,
        minWidth: 180,
      },
      {
        id: 'mailType',
        label: 'Type',
        editable: false,
        minWidth: 120,
      },
      {
        id: 'sent',
        label: 'Status',
        editable: false,
        filterType: 'select',
        filterOptions: sentOptions,
        minWidth: 100,
        render: (row: MailingAdmin) => (
          <Chip
            label={row.sent === 'Y' ? 'Sent' : 'Not Sent'}
            size="small"
            color={row.sent === 'Y' ? 'success' : 'warning'}
          />
        ),
      },
      {
        id: 'notBefore',
        label: 'Scheduled For',
        editable: false,
        minWidth: 160,
        render: (row: MailingAdmin) => formatTimestamp(row.notBefore),
      },
      {
        id: 'createDate',
        label: 'Created',
        editable: false,
        minWidth: 160,
        render: (row: MailingAdmin) => formatTimestamp(row.createDate),
      },
      {
        id: 'createUser',
        label: 'Created By',
        editable: false,
        minWidth: 130,
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
        title="Mailings (Read-Only)"
        showExport={true}
        enableSelection={false}
        enableBulkEdit={false}
        rowIdField="id"
      />
    </Box>
  );
};

export default MailingsPage;
