import { useState, useMemo, useCallback } from 'react';
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
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Autocomplete,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import type { Column, FetchParams } from '../../components/table/AdvancedDataTable';
import StatusChip from '../../components/common/StatusChip';
import { adminMailingListAPI, adminUserAPI } from '../../services/api';
import type { MailingListAdmin, MailingListUserAdmin, UserAdmin, SearchRequest } from '../../services/api';
import { useDateFormat } from '../../hooks';

const statusOptions = [
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'INACTIVE', value: 'INACTIVE' },
];

const MailingListsPage = () => {
  const [data, setData] = useState<MailingListAdmin[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const { formatTimestamp } = useDateFormat();

  // Refetch trigger
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const triggerRefetch = useCallback(() => setRefetchTrigger((prev) => prev + 1), []);

  // Create Dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newMailingList, setNewMailingList] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
  });

  // User Management Dialog
  const [usersDialogOpen, setUsersDialogOpen] = useState(false);
  const [selectedListName, setSelectedListName] = useState('');
  const [listUsers, setListUsers] = useState<MailingListUserAdmin[]>([]);
  const [listUsersLoading, setListUsersLoading] = useState(false);

  // Add User
  const [availableUsers, setAvailableUsers] = useState<UserAdmin[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

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
      const response = await adminMailingListAPI.searchMailingLists(searchRequest);
      setData(response.data.content);
      setTotalRecords(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch mailing lists:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = useCallback(async (row: any) => {
    try {
      await adminMailingListAPI.updateMailingList(row.name, {
        description: row.description,
        status: row.status,
      });
      triggerRefetch();
    } catch (error) {
      console.error('Failed to update mailing list:', error);
      throw error;
    }
  }, [triggerRefetch]);

  const handleCreate = async () => {
    try {
      await adminMailingListAPI.createMailingList(newMailingList);
      setSnackbar({ open: true, message: 'Mailing list created successfully', severity: 'success' });
      setCreateOpen(false);
      setNewMailingList({ name: '', description: '', status: 'ACTIVE' });
      triggerRefetch();
    } catch (error: any) {
      console.error('Failed to create mailing list:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create mailing list',
        severity: 'error',
      });
    }
  };

  const handleDelete = useCallback(async (name: string) => {
    if (confirm(`Are you sure you want to delete mailing list "${name}"? This will also remove all user assignments.`)) {
      try {
        await adminMailingListAPI.deleteMailingList(name);
        setSnackbar({ open: true, message: 'Mailing list deleted successfully', severity: 'success' });
        triggerRefetch();
      } catch (error: any) {
        console.error('Failed to delete mailing list:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to delete mailing list',
          severity: 'error',
        });
      }
    }
  }, [triggerRefetch]);

  // User management
  const openUsersDialog = useCallback(async (name: string) => {
    setSelectedListName(name);
    setUsersDialogOpen(true);
    setListUsersLoading(true);
    try {
      const response = await adminMailingListAPI.getMailingListUsers(name);
      setListUsers(response.data);
    } catch (error) {
      console.error('Failed to load mailing list users:', error);
      setSnackbar({ open: true, message: 'Failed to load users', severity: 'error' });
    } finally {
      setListUsersLoading(false);
    }
  }, []);

  const handleSearchUsers = useCallback(async (query: string) => {
    if (query.length < 1) {
      setAvailableUsers([]);
      return;
    }
    setUserSearchLoading(true);
    try {
      // Search by username, firstName, and lastName in parallel (OR logic)
      const [byUsername, byFirstName, byLastName] = await Promise.all([
        adminUserAPI.searchUsers({ filters: { username: query }, page: 0, pageSize: 10 }),
        adminUserAPI.searchUsers({ filters: { firstName: query }, page: 0, pageSize: 10 }),
        adminUserAPI.searchUsers({ filters: { lastName: query }, page: 0, pageSize: 10 }),
      ]);
      // Merge and deduplicate
      const allUsers = [...byUsername.data.content, ...byFirstName.data.content, ...byLastName.data.content];
      const seen = new Set<string>();
      const unique = allUsers.filter((u) => {
        if (seen.has(u.username)) return false;
        seen.add(u.username);
        return true;
      });
      // Filter out users already in the list
      const existingUsernames = new Set(listUsers.map((u) => u.username));
      setAvailableUsers(unique.filter((u) => !existingUsernames.has(u.username)));
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setUserSearchLoading(false);
    }
  }, [listUsers]);

  const handleAddUser = async () => {
    if (!selectedUser) return;
    try {
      await adminMailingListAPI.addUserToMailingList(selectedListName, selectedUser.username);
      setSnackbar({ open: true, message: `User ${selectedUser.username} added successfully`, severity: 'success' });
      setSelectedUser(null);
      // Reload users
      const response = await adminMailingListAPI.getMailingListUsers(selectedListName);
      setListUsers(response.data);
      triggerRefetch();
    } catch (error: any) {
      console.error('Failed to add user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add user',
        severity: 'error',
      });
    }
  };

  const handleRemoveUser = async (username: string) => {
    if (!confirm(`Remove user "${username}" from mailing list "${selectedListName}"?`)) return;
    try {
      await adminMailingListAPI.removeUserFromMailingList(selectedListName, username);
      setSnackbar({ open: true, message: `User ${username} removed successfully`, severity: 'success' });
      setListUsers((prev) => prev.filter((u) => u.username !== username));
      triggerRefetch();
    } catch (error: any) {
      console.error('Failed to remove user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to remove user',
        severity: 'error',
      });
    }
  };

  const columns: Column<MailingListAdmin>[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        editable: false,
        minWidth: 200,
      },
      {
        id: 'description',
        label: 'Description',
        editable: true,
        minWidth: 300,
      },
      {
        id: 'status',
        label: 'Status',
        editable: true,
        editType: 'select',
        filterType: 'select',
        filterOptions: statusOptions,
        minWidth: 130,
        render: (row: MailingListAdmin) => <StatusChip status={row.status} />,
      },
      {
        id: 'userCount',
        label: 'Users',
        editable: false,
        minWidth: 80,
        render: (row: MailingListAdmin) => (
          <Chip label={row.userCount} size="small" color="primary" variant="outlined" />
        ),
      },
      {
        id: 'createDate',
        label: 'Created',
        editable: false,
        filterType: 'date',
        minWidth: 180,
        render: (row: MailingListAdmin) => formatTimestamp(row.createDate),
      },
      {
        id: 'createUser',
        label: 'Created By',
        editable: false,
        minWidth: 150,
      },
    ],
    [formatTimestamp]
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box />
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
          Add Mailing List
        </Button>
      </Box>

      <AdvancedDataTable
        columns={columns}
        data={data}
        loading={loading}
        onFetchData={fetchData}
        totalRecords={totalRecords}
        onSave={handleSave}
        title="Mailing Lists"
        showExport={true}
        enableSelection={true}
        enableBulkEdit={false}
        rowIdField="name"
        refetchTrigger={refetchTrigger}
        renderActions={(row: any) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Manage Users">
              <IconButton
                size="small"
                onClick={() => openUsersDialog(row.name)}
                sx={{ color: 'primary.main' }}
              >
                <GroupIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Mailing List">
              <IconButton
                size="small"
                onClick={() => handleDelete(row.name)}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'error.contrastText',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />

      {/* Create Mailing List Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Mailing List</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={newMailingList.name}
              onChange={(e) => setNewMailingList({ ...newMailingList, name: e.target.value })}
              required
              helperText="Unique identifier for the mailing list (e.g., ALL_USERS)"
            />
            <TextField
              label="Description"
              value={newMailingList.description}
              onChange={(e) => setNewMailingList({ ...newMailingList, description: e.target.value })}
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newMailingList.status}
                label="Status"
                onChange={(e) => setNewMailingList({ ...newMailingList, status: e.target.value })}
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!newMailingList.name.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Management Dialog */}
      <Dialog
        open={usersDialogOpen}
        onClose={() => {
          setUsersDialogOpen(false);
          setSelectedUser(null);
          setAvailableUsers([]);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Manage Users - {selectedListName}
        </DialogTitle>
        <DialogContent>
          {/* Add User Section */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 3, mt: 1 }}>
            <Autocomplete
              sx={{ flex: 1 }}
              options={availableUsers}
              getOptionLabel={(option) =>
                `${option.username} (${option.firstName} ${option.lastName})`
              }
              value={selectedUser}
              onChange={(_, newValue) => setSelectedUser(newValue)}
              onInputChange={(_, value) => handleSearchUsers(value)}
              loading={userSearchLoading}
              renderInput={(params) => (
                <TextField {...params} label="Search users to add" size="small" />
              )}
              noOptionsText="Type to search users..."
              isOptionEqualToValue={(option, value) => option.username === value.username}
            />
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleAddUser}
              disabled={!selectedUser}
            >
              Add
            </Button>
          </Box>

          {/* Current Members */}
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Members ({listUsers.length})
          </Typography>

          {listUsersLoading ? (
            <Typography color="text.secondary">Loading...</Typography>
          ) : listUsers.length === 0 ? (
            <Typography color="text.secondary">No users in this mailing list.</Typography>
          ) : (
            <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
              {listUsers.map((user) => (
                <ListItem key={user.username} divider>
                  <ListItemText
                    primary={`${user.username}`}
                    secondary={`${user.firstName || ''} ${user.lastName || ''} ${user.email ? `- ${user.email}` : ''}`}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Remove from list">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleRemoveUser(user.username)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setUsersDialogOpen(false);
              setSelectedUser(null);
              setAvailableUsers([]);
            }}
          >
            Close
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

export default MailingListsPage;
