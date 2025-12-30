import { Box, Typography, Paper } from '@mui/material';
import StatCard from '../components/common/StatCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { mockAnalytics } from '../data/mock';

const Analytics = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Analytics
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
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

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Performance Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Revenue Growth: {mockAnalytics.revenueGrowth}% increase from last period
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Orders Growth: {mockAnalytics.ordersGrowth}% increase from last period
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your business is performing well with steady growth across key metrics.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Analytics;
