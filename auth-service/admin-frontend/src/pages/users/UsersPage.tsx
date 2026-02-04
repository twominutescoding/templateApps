import { useState, useEffect, useMemo, useCallback } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LockResetIcon from '@mui/icons-material/LockReset';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import type { Column, FetchParams } from '../../components/table/AdvancedDataTable';
import { adminUserAPI, adminRoleAPI, adminUserStatusAPI } from '../../services/api';
import type { UserAdmin, RoleAdmin, UserStatusData, SearchRequest } from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import { useDateFormat } from '../../hooks';
import { CreateUserDialog, AddRoleDialog, ResetPasswordDialog } from './UserManagementDialogs';

const UsersPage = () => {
  const [data, setData] = useState<UserAdmin[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<RoleAdmin[]>([]);
  const [userStatuses, setUserStatuses] = useState<UserStatusData[]>([]);
  const { formatTimestamp } = useDateFormat();

  // Create User Dialog
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    password: '',
  });

  // Reset Password Dialog
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordUsername, setResetPasswordUsername] = useState('');
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  // Add Role Dialog
  const [addRoleOpen, setAddRoleOpen] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('');

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
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
      const response = await adminUserAPI.searchUsers(searchRequest);
      setData(response.data.content);
      setTotalRecords(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Simple refresh that triggers the table to refetch
  const refreshData = useCallback(() => {
    // This will be called after mutations to trigger a refetch
    // The table will automatically call fetchData with current params
    setData([...data]);
  }, [data]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await adminRoleAPI.getAllRoles();
      setAvailableRoles(response.data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  }, []);

  const fetchUserStatuses = useCallback(async () => {
    try {
      const response = await adminUserStatusAPI.getAllUserStatuses();
      setUserStatuses(response.data);
    } catch (error) {
      console.error('Failed to fetch user statuses:', error);
    }
  }, []);

  // Refetch trigger - increment to force table refetch
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const triggerRefetch = useCallback(() => setRefetchTrigger((prev) => prev + 1), []);

  useEffect(() => {
    fetchRoles();
    fetchUserStatuses();
  }, [fetchRoles, fetchUserStatuses]);

  const handleSave = useCallback(async (row: UserAdmin) => {
    try {
      // Update user details
      await adminUserAPI.updateUser(row.username, {
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        company: row.company,
        theme: row.theme,
        paletteId: row.paletteId,
      });

      // If status changed, update it separately
      const originalUser = data.find((u) => u.username === row.username);
      if (originalUser && originalUser.status !== row.status) {
        await adminUserAPI.updateUserStatus(row.username, row.status);
      }

      triggerRefetch();
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  }, [data, triggerRefetch]);

  const handleStatusChange = async (username: string, newStatus: string) => {
    try {
      await adminUserAPI.updateUserStatus(username, newStatus);
      triggerRefetch();
      setSnackbar({ open: true, message: 'User status updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Failed to update user status:', error);
      setSnackbar({ open: true, message: 'Failed to update user status', severity: 'error' });
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await adminUserAPI.createUser(newUser);
      if (newUser.password) {
        setSnackbar({
          open: true,
          message: `User created successfully with custom password.`,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: `User created successfully. Check server logs for temporary password.`,
          severity: 'success',
        });
      }
      setCreateUserOpen(false);
      setNewUser({ username: '', firstName: '', lastName: '', email: '', company: '', password: '' });
      triggerRefetch();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create user',
        severity: 'error',
      });
    }
  };

  const handleOpenResetPassword = (username: string) => {
    setResetPasswordUsername(username);
    setResetPasswordValue('');
    setResetPasswordOpen(true);
  };

  const handleResetPassword = async () => {
    try {
      const response = await adminUserAPI.resetPassword(resetPasswordUsername, resetPasswordValue || undefined);
      if (resetPasswordValue) {
        setSnackbar({
          open: true,
          message: `Password set successfully for ${resetPasswordUsername}`,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: `Password reset. Temporary password: ${response.data}`,
          severity: 'info',
        });
      }
      setResetPasswordOpen(false);
      setResetPasswordValue('');
    } catch (error) {
      console.error('Failed to reset password:', error);
      setSnackbar({ open: true, message: 'Failed to reset password', severity: 'error' });
    }
  };

  const handleOpenAddRole = (username: string) => {
    setSelectedUsername(username);
    setSelectedRole('');
    setSelectedEntity('');
    setAddRoleOpen(true);
  };

  const handleAddRole = async () => {
    try {
      await adminUserAPI.assignRole(selectedUsername, selectedRole, selectedEntity);
      setSnackbar({ open: true, message: 'Role assigned successfully', severity: 'success' });
      setAddRoleOpen(false);
      triggerRefetch();
    } catch (error: any) {
      console.error('Failed to assign role:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to assign role',
        severity: 'error',
      });
    }
  };

  const handleRemoveRole = useCallback(async (username: string, role: string, entity: string) => {
    if (confirm(`Remove role ${role} (${entity}) from ${username}?`)) {
      try {
        await adminUserAPI.removeRole(username, role, entity);
        setSnackbar({ open: true, message: 'Role removed successfully', severity: 'success' });
        triggerRefetch();
      } catch (error: any) {
        console.error('Failed to remove role:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to remove role',
          severity: 'error',
        });
      }
    }
  }, [triggerRefetch]);

  const handleDeleteUser = useCallback(async (username: string) => {
    if (confirm(`Are you sure you want to delete user ${username}? This action cannot be undone.`)) {
      try {
        await adminUserAPI.deleteUser(username);
        setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
        triggerRefetch();
      } catch (error: any) {
        console.error('Failed to delete user:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to delete user',
          severity: 'error',
        });
      }
    }
  }, [triggerRefetch]);

  // Convert user statuses to dropdown options
  const statusOptions = useMemo(() => {
    return userStatuses.map((us) => ({
      label: us.description || us.status,  // Fall back to status if description is empty
      value: us.status,
    }));
  }, [userStatuses]);

  const columns: Column<UserAdmin>[] = useMemo(
    () => [
      {
        id: 'username',
        label: 'Username',
        editable: false,
        minWidth: 110,
      },
      {
        id: 'firstName',
        label: 'First Name',
        editable: true,
        minWidth: 100,
      },
      {
        id: 'lastName',
        label: 'Last Name',
        editable: true,
        minWidth: 100,
      },
      {
        id: 'email',
        label: 'Email',
        editable: true,
        minWidth: 180,
      },
      {
        id: 'company',
        label: 'Company',
        editable: true,
        minWidth: 100,
      },
      {
        id: 'status',
        label: 'Status',
        editable: true,
        editType: 'select',
        filterType: 'select',
        filterOptions: statusOptions,
        minWidth: 100,
        render: (row: UserAdmin) => {
          const option = statusOptions.find((o) => o.value === row.status);
          return (
            <StatusChip
              status={row.status}
              label={option?.label || row.status}
            />
          );
        },
      },
      {
        id: 'roles',
        label: 'Roles',
        editable: false,
        minWidth: 200,
        render: (row: UserAdmin) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {row.roles?.map((r) => (
              <Chip
                key={`${r.role}-${r.entity}`}
                label={`${r.role} (${r.entityName || r.entity})`}
                size="small"
                onDelete={() => handleRemoveRole(row.username, r.role, r.entity)}
                sx={{
                  '& .MuiChip-deleteIcon': {
                    color: 'error.main',
                    '&:hover': {
                      color: 'error.dark',
                    },
                  },
                }}
              />
            ))}
            {(!row.roles || row.roles.length === 0) && <span>No roles</span>}
          </Box>
        ),
      },
      {
        id: 'createDate',
        label: 'Created',
        editable: false,
        minWidth: 140,
        render: (row: UserAdmin) => formatTimestamp(row.createDate),
      },
    ],
    [formatTimestamp, statusOptions, handleRemoveRole]
  );

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box />
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setCreateUserOpen(true)}>
          Add New User
        </Button>
      </Box>

      <AdvancedDataTable
        columns={columns}
        data={data}
        loading={loading}
        onFetchData={fetchData}
        totalRecords={totalRecords}
        onSave={handleSave}
        title="Users"
        showExport={true}
        enableSelection={true}
        enableBulkEdit={false}
        rowIdField="username"
        refetchTrigger={refetchTrigger}
        renderActions={(row: UserAdmin) => (
          <>
            <Tooltip title="Reset Password">
              <IconButton
                size="small"
                onClick={() => handleOpenResetPassword(row.username)}
                sx={{
                  color: 'warning.main',
                  '&:hover': {
                    backgroundColor: 'warning.light',
                    color: 'warning.contrastText',
                  },
                }}
              >
                <LockResetIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Role">
              <IconButton
                size="small"
                onClick={() => handleOpenAddRole(row.username)}
                sx={{
                  color: '#42a5f5',
                  '&:hover': {
                    backgroundColor: 'rgba(66, 165, 245, 0.15)',
                    color: '#64b5f6',
                  },
                }}
              >
                <AddCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete User">
              <IconButton
                size="small"
                onClick={() => handleDeleteUser(row.username)}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'error.contrastText',
                  },
                }}
              >
                <PersonRemoveIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      />

      <CreateUserDialog
        open={createUserOpen}
        newUser={newUser}
        onClose={() => {
          setCreateUserOpen(false);
          setNewUser({ username: '', firstName: '', lastName: '', email: '', company: '', password: '' });
        }}
        onChange={(field, value) => setNewUser({ ...newUser, [field]: value })}
        onSubmit={handleCreateUser}
      />

      <ResetPasswordDialog
        open={resetPasswordOpen}
        username={resetPasswordUsername}
        newPassword={resetPasswordValue}
        onClose={() => setResetPasswordOpen(false)}
        onPasswordChange={setResetPasswordValue}
        onSubmit={handleResetPassword}
      />

      <AddRoleDialog
        open={addRoleOpen}
        username={selectedUsername}
        availableRoles={availableRoles}
        selectedRole={selectedRole}
        selectedEntity={selectedEntity}
        onClose={() => setAddRoleOpen(false)}
        onRoleChange={setSelectedRole}
        onEntityChange={setSelectedEntity}
        onSubmit={handleAddRole}
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

export default UsersPage;
