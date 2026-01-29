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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import type { Column, FetchParams } from '../../components/table/AdvancedDataTable';
import { adminEntityAPI, adminEntityTypeAPI } from '../../services/api';
import type { EntityAdmin, EntityType, SearchRequest } from '../../services/api';
import { useDateFormat } from '../../contexts/DateFormatContext';

const EntitiesPage = () => {
  const [data, setData] = useState<EntityAdmin[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const { formatTimestamp } = useDateFormat();

  // Entity Types for dropdown
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);

  // Refetch trigger
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const triggerRefetch = useCallback(() => setRefetchTrigger((prev) => prev + 1), []);

  // Create Entity Dialog
  const [createEntityOpen, setCreateEntityOpen] = useState(false);
  const [newEntity, setNewEntity] = useState({
    name: '',
    type: 'WEB',
    description: '',
  });

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
      const response = await adminEntityAPI.searchEntities(searchRequest);
      setData(response.data.content);
      setTotalRecords(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch entities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEntityTypes = useCallback(async () => {
    try {
      const response = await adminEntityTypeAPI.getAllEntityTypes();
      setEntityTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch entity types:', error);
    }
  }, []);

  useEffect(() => {
    fetchEntityTypes();
  }, [fetchEntityTypes]);

  const handleSave = useCallback(async (row: EntityAdmin) => {
    try {
      await adminEntityAPI.updateEntity(row.id, {
        name: row.name,
        type: row.type,
        description: row.description,
      });
      triggerRefetch();
    } catch (error) {
      console.error('Failed to update entity:', error);
      throw error;
    }
  }, [triggerRefetch]);

  const handleCreateEntity = async () => {
    try {
      await adminEntityAPI.createEntity(newEntity);
      setSnackbar({
        open: true,
        message: 'Entity created successfully',
        severity: 'success',
      });
      setCreateEntityOpen(false);
      setNewEntity({ name: '', type: 'WEB', description: '' });
      triggerRefetch();
    } catch (error: any) {
      console.error('Failed to create entity:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create entity',
        severity: 'error',
      });
    }
  };

  const handleDeleteEntity = useCallback(async (id: string) => {
    if (confirm(`Are you sure you want to delete entity ${id}? This action cannot be undone.`)) {
      try {
        await adminEntityAPI.deleteEntity(id);
        setSnackbar({ open: true, message: 'Entity deleted successfully', severity: 'success' });
        triggerRefetch();
      } catch (error: any) {
        console.error('Failed to delete entity:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to delete entity',
          severity: 'error',
        });
      }
    }
  }, [triggerRefetch]);

  // Convert entity types to dropdown options
  const typeOptions = useMemo(() => {
    return entityTypes.map((et) => ({
      label: `${et.description} (${et.type})`,
      value: et.type,
    }));
  }, [entityTypes]);

  const columns: Column<EntityAdmin>[] = useMemo(
    () => [
      {
        id: 'id',
        label: 'Entity ID',
        editable: false,
        minWidth: 150,
      },
      {
        id: 'name',
        label: 'Name',
        editable: true,
        minWidth: 200,
      },
      {
        id: 'type',
        label: 'Type',
        editable: true,
        editType: 'select',
        filterType: 'select',
        filterOptions: typeOptions,
        minWidth: 120,
        render: (row: EntityAdmin) => {
          const option = typeOptions.find((o) => o.value === row.type);
          return option?.label || row.type;
        },
      },
      {
        id: 'description',
        label: 'Description',
        editable: true,
        minWidth: 250,
      },
      {
        id: 'createDate',
        label: 'Created',
        editable: false,
        minWidth: 180,
        render: (row: EntityAdmin) => formatTimestamp(row.createDate),
      },
      {
        id: 'createUser',
        label: 'Created By',
        editable: false,
        minWidth: 150,
      },
    ],
    [formatTimestamp, typeOptions]
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box />
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setCreateEntityOpen(true)}>
          Add New Entity
        </Button>
      </Box>

      <AdvancedDataTable
        columns={columns}
        data={data}
        loading={loading}
        onFetchData={fetchData}
        totalRecords={totalRecords}
        onSave={handleSave}
        title="Application Entities"
        showExport={true}
        enableSelection={true}
        enableBulkEdit={false}
        rowIdField="id"
        key={refetchTrigger}
        renderActions={(row: EntityAdmin) => (
          <Tooltip title="Delete Entity">
            <IconButton
              size="small"
              onClick={() => handleDeleteEntity(row.id)}
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

      {/* Create Entity Dialog */}
      <Dialog open={createEntityOpen} onClose={() => setCreateEntityOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Entity</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Name"
              value={newEntity.name}
              onChange={(e) => setNewEntity({ ...newEntity, name: e.target.value })}
              required
              helperText="Entity ID will be auto-generated from the name"
            />
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={newEntity.type}
                label="Type"
                onChange={(e) => setNewEntity({ ...newEntity, type: e.target.value })}
              >
                {entityTypes.map((et) => (
                  <MenuItem key={et.type} value={et.type}>
                    {et.description} ({et.type})
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select the entity type</FormHelperText>
            </FormControl>
            <TextField
              label="Description"
              value={newEntity.description}
              onChange={(e) => setNewEntity({ ...newEntity, description: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateEntityOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateEntity}
            variant="contained"
            disabled={!newEntity.name || !newEntity.type}
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

export default EntitiesPage;
