import { Box, Typography } from '@mui/material';
import StatCard from '../components/common/StatCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { mockAnalytics } from '../data/mock';

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Dashboard
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <StatCard
          title="Total Revenue"
          value={`$${mockAnalytics.totalRevenue.toLocaleString()}`}
          icon={<AttachMoneyIcon sx={{ fontSize: 32, color: '#1976d2' }} />}
          trend={mockAnalytics.revenueGrowth}
          color="#1976d2"
        />

        <StatCard
          title="Total Orders"
          value={mockAnalytics.totalOrders}
          icon={<ShoppingCartIcon sx={{ fontSize: 32, color: '#9c27b0' }} />}
          trend={mockAnalytics.ordersGrowth}
          color="#9c27b0"
        />

        <StatCard
          title="Total Customers"
          value={mockAnalytics.totalCustomers}
          icon={<PeopleIcon sx={{ fontSize: 32, color: '#2e7d32' }} />}
          color="#2e7d32"
        />

        <StatCard
          title="Avg Order Value"
          value={`$${mockAnalytics.averageOrderValue.toLocaleString()}`}
          icon={<TrendingUpIcon sx={{ fontSize: 32, color: '#ed6c02' }} />}
          color="#ed6c02"
        />
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
          Welcome to Your Business Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is a modern business application template built with React, TypeScript, and Material-UI.
          Navigate through the sidebar to explore different sections including Customers, Orders, Products, and Analytics.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
