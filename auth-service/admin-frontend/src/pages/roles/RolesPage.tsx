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
import type { Column, FetchParams } from '../../components/table/AdvancedDataTable';
import { adminRoleAPI, adminEntityAPI } from '../../services/api';
import type { RoleAdmin, SearchRequest, EntityAdmin } from '../../services/api';
import { useDateFormat } from '../../hooks';

const RolesPage = () => {
  const [data, setData] = useState<(RoleAdmin & { id: string })[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [allEntities, setAllEntities] = useState<EntityAdmin[]>([]);
  const { formatTimestamp } = useDateFormat();

  // Fetch all entities for dropdown filter
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const response = await adminEntityAPI.getAllEntities();
        setAllEntities(response.data);
      } catch (error) {
        console.error('Failed to fetch entities:', error);
      }
    };
    fetchEntities();
  }, []);

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
      const response = await adminRoleAPI.searchRoles(searchRequest);
      // Add computed id field (role + entity) for table row identification
      const dataWithIds = response.data.content.map(role => ({
        ...role,
        id: `${role.role}-${role.entity}`, // Composite key
      }));
      setData(dataWithIds);
      setTotalRecords(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch trigger
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const triggerRefetch = useCallback(() => setRefetchTrigger((prev) => prev + 1), []);

  const handleSave = useCallback(async (row: RoleAdmin & { id: string }) => {
    try {
      await adminRoleAPI.updateRole(row.role, row.entity, {
        roleLevel: row.roleLevel,
        description: row.description,
      });
      triggerRefetch();
    } catch (error) {
      console.error('Failed to update role:', error);
      throw error;
    }
  }, [triggerRefetch]);

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
      triggerRefetch();
    } catch (error: any) {
      console.error('Failed to create role:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create role',
        severity: 'error',
      });
    }
  };

  const handleDeleteRole = useCallback(async (role: string, entity: string) => {
    if (confirm(`Are you sure you want to delete role ${role} (${entity})? This action cannot be undone.`)) {
      try {
        await adminRoleAPI.deleteRole(role, entity);
        setSnackbar({ open: true, message: 'Role deleted successfully', severity: 'success' });
        triggerRefetch();
      } catch (error: any) {
        console.error('Failed to delete role:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to delete role',
          severity: 'error',
        });
      }
    }
  }, [triggerRefetch]);

  // Entity options for filter and create dialog
  const entityOptions = useMemo(() => {
    return allEntities.map((e) => ({
      label: e.name || e.id,
      value: e.id,
    }));
  }, [allEntities]);

  // Role level options
  const roleLevelOptions = [
    { label: '1 - Highest (Admin)', value: '1' },
    { label: '2 - Medium (Manager)', value: '2' },
    { label: '3 - Lowest (User)', value: '3' },
  ];

  const columns: Column<RoleAdmin & { id: string }>[] = useMemo(
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
        filterType: 'select',
        filterOptions: entityOptions,
        minWidth: 120,
        render: (row: RoleAdmin) => row.entityName || row.entity,
      },
      {
        id: 'roleLevel',
        label: 'Level',
        editable: true,
        editType: 'select',
        filterType: 'select',
        filterOptions: roleLevelOptions,
        minWidth: 120,
        render: (row: RoleAdmin) => {
          const option = roleLevelOptions.find((o) => o.value === row.roleLevel);
          return option?.label || row.roleLevel;
        },
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
        filterable: false,
        sortable: false,
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
    [formatTimestamp, entityOptions]
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
        onFetchData={fetchData}
        totalRecords={totalRecords}
        onSave={handleSave}
        title="Roles"
        showExport={true}
        enableSelection={true}
        enableBulkEdit={false}
        rowIdField="id"
        refetchTrigger={refetchTrigger}
        renderActions={(row: RoleAdmin & { id: string }) => (
          <Tooltip title="Delete Role">
            <IconButton
              size="small"
              onClick={() => handleDeleteRole(row.role, row.entity)}
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
                {entityOptions.map((entity) => (
                  <MenuItem key={entity.value} value={entity.value}>
                    {entity.label}
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
