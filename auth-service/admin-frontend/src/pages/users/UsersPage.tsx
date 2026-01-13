import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box } from '@mui/material';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import type { Column } from '../../components/table/AdvancedDataTable';
import { adminUserAPI } from '../../services/api';
import type { UserAdmin } from '../../services/api';
import StatusChip from '../../components/common/StatusChip';
import { useDateFormat } from '../../context/DateFormatContext';

const UsersPage = () => {
  const [data, setData] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const { formatTimestamp } = useDateFormat();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminUserAPI.getAllUsers();
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (row: UserAdmin) => {
    try {
      await adminUserAPI.updateUser(row.username, {
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        company: row.company,
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const handleStatusChange = async (username: string, newStatus: string) => {
    try {
      await adminUserAPI.updateUserStatus(username, newStatus);
      fetchData();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const columns: Column<UserAdmin>[] = useMemo(
    () => [
      {
        id: 'username',
        label: 'Username',
        editable: false,
        minWidth: 150,
      },
      {
        id: 'firstName',
        label: 'First Name',
        editable: true,
        minWidth: 150,
      },
      {
        id: 'lastName',
        label: 'Last Name',
        editable: true,
        minWidth: 150,
      },
      {
        id: 'email',
        label: 'Email',
        editable: true,
        minWidth: 200,
      },
      {
        id: 'company',
        label: 'Company',
        editable: true,
        minWidth: 150,
      },
      {
        id: 'status',
        label: 'Status',
        editable: false,
        minWidth: 120,
        render: (row: UserAdmin) => (
          <StatusChip
            status={row.status}
            onStatusChange={(newStatus) => handleStatusChange(row.username, newStatus)}
            allowedStatuses={['ACTIVE', 'INACTIVE']}
          />
        ),
      },
      {
        id: 'roles',
        label: 'Roles',
        editable: false,
        minWidth: 200,
        render: (row: UserAdmin) =>
          row.roles?.map((r) => `${r.role} (${r.entity})`).join(', ') || 'No roles',
      },
      {
        id: 'createDate',
        label: 'Created',
        editable: false,
        minWidth: 180,
        render: (row: UserAdmin) => formatTimestamp(row.createDate),
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
        title="Users"
        showExport={true}
        enableSelection={false}
        enableBulkEdit={false}
      />
    </Box>
  );
};

export default UsersPage;
