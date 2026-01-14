import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import type { Column } from '../../components/table/AdvancedDataTable';
import { adminRoleAPI } from '../../services/api';
import type { RoleAdmin } from '../../services/api';
import { useDateFormat } from '../../context/DateFormatContext';

const RolesPage = () => {
  const [data, setData] = useState<RoleAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const { formatTimestamp } = useDateFormat();

  // Create Role Dialog
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    role: '',
    entity: '',
    roleLevel: '',
    description: '',
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminRoleAPI.getAllRoles();
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (row: RoleAdmin) => {
    try {
      await adminRoleAPI.updateRole(row.role, row.entity, {
        roleLevel: row.roleLevel,
        description: row.description,
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    }
  };

  const handleCreateRole = async () => {
    try {
      await adminRoleAPI.createRole(newRole);
      setSnackbar({
        open: true,
        message: 'Role created successfully',
        severity: 'success',
      });
      setCreateRoleOpen(false);
      setNewRole({ role: '', entity: '', roleLevel: '', description: '' });
      fetchData();
    } catch (error: any) {
      console.error('Failed to create role:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create role',
        severity: 'error',
      });
    }
  };

  const handleDeleteRole = async (role: string, entity: string) => {
    if (confirm(`Are you sure you want to delete role ${role} (${entity})? This action cannot be undone.`)) {
      try {
        await adminRoleAPI.deleteRole(role, entity);
        setSnackbar({ open: true, message: 'Role deleted successfully', severity: 'success' });
        fetchData();
      } catch (error: any) {
        console.error('Failed to delete role:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to delete role',
          severity: 'error',
        });
      }
    }
  };

  // Get unique entities from existing roles
  const uniqueEntities = useMemo(() => {
    return Array.from(new Set(data.map((role) => role.entity)));
  }, [data]);

  const columns: Column<RoleAdmin>[] = useMemo(
    () => [
      {
        id: 'role',
        label: 'Role',
        editable: false,
        minWidth: 150,
      },
      {
        id: 'entity',
        label: 'Entity',
        editable: false,
        minWidth: 120,
      },
      {
        id: 'roleLevel',
        label: 'Level',
        editable: true,
        minWidth: 120,
      },
      {
        id: 'description',
        label: 'Description',
        editable: true,
        minWidth: 250,
      },
      {
        id: 'userCount',
        label: 'Users',
        editable: false,
        minWidth: 100,
      },
      {
        id: 'createDate',
        label: 'Created',
        editable: false,
        minWidth: 180,
        render: (row: RoleAdmin) => formatTimestamp(row.createDate),
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
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setCreateRoleOpen(true)}>
          Add New Role
        </Button>
      </Box>

      <AdvancedDataTable
        columns={columns}
        data={data}
        loading={loading}
        onSave={handleSave}
        title="Roles"
        showExport={true}
        enableSelection={false}
        enableBulkEdit={false}
        renderActions={(row: RoleAdmin) => (
          <Tooltip title="Delete Role">
            <IconButton size="small" color="error" onClick={() => handleDeleteRole(row.role, row.entity)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      />

      {/* Create Role Dialog */}
      <Dialog open={createRoleOpen} onClose={() => setCreateRoleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Role</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Role Name"
              value={newRole.role}
              onChange={(e) => setNewRole({ ...newRole, role: e.target.value })}
              required
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Entity</InputLabel>
              <Select
                value={newRole.entity}
                onChange={(e) => setNewRole({ ...newRole, entity: e.target.value })}
                label="Entity"
              >
                {uniqueEntities.map((entity) => (
                  <MenuItem key={entity} value={entity}>
                    {entity}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Role Level"
              value={newRole.roleLevel}
              onChange={(e) => setNewRole({ ...newRole, roleLevel: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              required
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateRoleOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateRole} variant="contained" color="primary">
            Create Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default RolesPage;
