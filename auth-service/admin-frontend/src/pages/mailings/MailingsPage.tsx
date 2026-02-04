import { useState, useMemo, useCallback } from 'react';
import { Box } from '@mui/material';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import type { Column, FetchParams } from '../../components/table/AdvancedDataTable';
import { adminMailingAPI } from '../../services/api';
import type { MailingAdmin, SearchRequest } from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import { useDateFormat } from '../../hooks';

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

  // Mailing status options for filtering
  const statusOptions = [
    { label: 'New', value: 'N' },
    { label: 'Sent', value: 'Y' },
    { label: 'Skip', value: 'S' },
    { label: 'Error', value: 'E' },
  ];

  // Map status code to display info
  const getStatusInfo = (code: string) => {
    switch (code) {
      case 'Y':
        return { status: 'SENT', label: 'Sent' };
      case 'N':
        return { status: 'NEW', label: 'New' };
      case 'S':
        return { status: 'SKIP', label: 'Skip' };
      case 'E':
        return { status: 'ERROR', label: 'Error' };
      default:
        return { status: 'PENDING', label: code };
    }
  };

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
        filterOptions: statusOptions,
        minWidth: 100,
        render: (row: MailingAdmin) => {
          const statusInfo = getStatusInfo(row.sent);
          return (
            <StatusChip
              status={statusInfo.status}
              label={statusInfo.label}
            />
          );
        },
      },
      {
        id: 'notBefore',
        label: 'Scheduled For',
        editable: false,
        filterType: 'date',
        minWidth: 160,
        render: (row: MailingAdmin) => formatTimestamp(row.notBefore),
      },
      {
        id: 'createDate',
        label: 'Created',
        editable: false,
        filterType: 'date',
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
        defaultSortColumn="createDate"
        defaultSortOrder="desc"
      />
    </Box>
  );
};

export default MailingsPage;
