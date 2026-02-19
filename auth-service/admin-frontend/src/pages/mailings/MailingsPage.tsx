import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReplayIcon from '@mui/icons-material/Replay';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import type { Column, FetchParams } from '../../components/table/AdvancedDataTable';
import { adminMailingAPI, adminMailingListAPI } from '../../services/api';
import type { MailingAdmin, MailingListAdmin, SearchRequest } from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import { useDateFormat } from '../../hooks';

const MailingsPage = () => {
  const [data, setData] = useState<MailingAdmin[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const { formatTimestamp } = useDateFormat();

  // Refetch trigger
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const triggerRefetch = useCallback(() => setRefetchTrigger((prev) => prev + 1), []);

  // Create Dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [mailingLists, setMailingLists] = useState<MailingListAdmin[]>([]);
  const [newMailing, setNewMailing] = useState({
    subject: '',
    body: '',
    mailingList: '',
    mailType: 'HTML',
    notBefore: '',
    attachment: '',
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  // Load mailing lists for the create dialog dropdown
  useEffect(() => {
    if (createOpen && mailingLists.length === 0) {
      adminMailingListAPI.getAllMailingLists().then((res) => {
        setMailingLists(res.data);
      }).catch((err) => {
        console.error('Failed to load mailing lists:', err);
      });
    }
  }, [createOpen, mailingLists.length]);

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

  const handleCreate = async () => {
    try {
      await adminMailingAPI.createMailing({
        subject: newMailing.subject,
        body: newMailing.body,
        mailingList: newMailing.mailingList,
        mailType: newMailing.mailType,
        notBefore: newMailing.notBefore || undefined,
        attachment: newMailing.attachment || undefined,
      });
      setSnackbar({ open: true, message: 'Mailing created successfully', severity: 'success' });
      setCreateOpen(false);
      setNewMailing({ subject: '', body: '', mailingList: '', mailType: 'HTML', notBefore: '', attachment: '' });
      triggerRefetch();
    } catch (error: any) {
      console.error('Failed to create mailing:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create mailing',
        severity: 'error',
      });
    }
  };

  const handleResend = useCallback(async (id: number) => {
    if (!confirm(`Are you sure you want to resend mailing ID ${id}? This will reset it to 'New' status.`)) return;
    try {
      await adminMailingAPI.resendMailing(id);
      setSnackbar({ open: true, message: `Mailing ${id} queued for resend`, severity: 'success' });
      triggerRefetch();
    } catch (error: any) {
      console.error('Failed to resend mailing:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to resend mailing',
        severity: 'error',
      });
    }
  }, [triggerRefetch]);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box />
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Create Mailing
        </Button>
      </Box>

      <AdvancedDataTable
        columns={columns}
        data={data}
        loading={loading}
        onFetchData={fetchData}
        totalRecords={totalRecords}
        title="Mailings"
        showExport={true}
        enableSelection={false}
        enableBulkEdit={false}
        rowIdField="id"
        defaultSortColumn="createDate"
        defaultSortOrder="desc"
        refetchTrigger={refetchTrigger}
        renderActions={(row: any) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Resend">
              <IconButton
                size="small"
                onClick={() => handleResend(row.id)}
                sx={{ color: 'primary.main' }}
              >
                <ReplayIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />

      {/* Create Mailing Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Mailing</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Subject"
              value={newMailing.subject}
              onChange={(e) => setNewMailing({ ...newMailing, subject: e.target.value })}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Mailing List</InputLabel>
              <Select
                value={newMailing.mailingList}
                label="Mailing List"
                onChange={(e) => setNewMailing({ ...newMailing, mailingList: e.target.value })}
              >
                {mailingLists.map((ml) => (
                  <MenuItem key={ml.name} value={ml.name}>
                    {ml.name} {ml.description ? `- ${ml.description}` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Mail Type</InputLabel>
              <Select
                value={newMailing.mailType}
                label="Mail Type"
                onChange={(e) => setNewMailing({ ...newMailing, mailType: e.target.value })}
              >
                <MenuItem value="HTML">HTML</MenuItem>
                <MenuItem value="TEXT">Plain Text</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Body"
              value={newMailing.body}
              onChange={(e) => setNewMailing({ ...newMailing, body: e.target.value })}
              multiline
              rows={8}
              helperText={newMailing.mailType === 'HTML' ? 'HTML content supported' : 'Plain text content'}
            />
            <TextField
              label="Scheduled For (Not Before)"
              type="datetime-local"
              value={newMailing.notBefore}
              onChange={(e) => setNewMailing({ ...newMailing, notBefore: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="Leave empty to send immediately (next scheduler run)"
            />
            <TextField
              label="Attachment"
              value={newMailing.attachment}
              onChange={(e) => setNewMailing({ ...newMailing, attachment: e.target.value })}
              multiline
              rows={2}
              helperText="Optional attachment content"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!newMailing.subject.trim() || !newMailing.mailingList}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

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

export default MailingsPage;
