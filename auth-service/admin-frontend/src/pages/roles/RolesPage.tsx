import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box } from '@mui/material';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import type { Column } from '../../components/table/AdvancedDataTable';
import { adminRoleAPI } from '../../services/api';
import type { RoleAdmin } from '../../services/api';
import { useDateFormat } from '../../context/DateFormatContext';

const RolesPage = () => {
  const [data, setData] = useState<RoleAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const { formatTimestamp } = useDateFormat();

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
      <AdvancedDataTable
        columns={columns}
        data={data}
        loading={loading}
        onSave={handleSave}
        title="Roles"
        showExport={true}
        enableSelection={false}
        enableBulkEdit={false}
      />
    </Box>
  );
};

export default RolesPage;
