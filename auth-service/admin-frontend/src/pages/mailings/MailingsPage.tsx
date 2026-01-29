import { useState, useMemo, useCallback } from 'react';
import { Box, Chip } from '@mui/material';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import type { Column, FetchParams } from '../../components/table/AdvancedDataTable';
import { adminMailingAPI } from '../../services/api';
import type { MailingAdmin, SearchRequest } from '../../services/api';
import { useDateFormat } from '../../contexts/DateFormatContext';

const MailingsPage = () => {
  const [data, setData] = useState<MailingAdmin[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const { formatTimestamp } = useDateFormat();

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
      const response = await adminMailingAPI.searchMailings(searchRequest);
      setData(response.data.content);
      setTotalRecords(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch mailings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
        onFetchData={fetchData}
        totalRecords={totalRecords}
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
