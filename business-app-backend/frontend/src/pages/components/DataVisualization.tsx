import { Box, Typography } from '@mui/material';
import LineChartCard from '../../components/charts/LineChartCard';
import BarChartCard from '../../components/charts/BarChartCard';
import PieChartCard from '../../components/charts/PieChartCard';
import ProgressCard from '../../components/charts/ProgressCard';

const DataVisualization = () => {
  // Sample data for line chart
  const salesData = [
    { name: 'Jan', revenue: 4000, expenses: 2400, profit: 1600 },
    { name: 'Feb', revenue: 3000, expenses: 1398, profit: 1602 },
    { name: 'Mar', revenue: 2000, expenses: 9800, profit: -7800 },
    { name: 'Apr', revenue: 2780, expenses: 3908, profit: -1128 },
    { name: 'May', revenue: 1890, expenses: 4800, profit: -2910 },
    { name: 'Jun', revenue: 2390, expenses: 3800, profit: -1410 },
    { name: 'Jul', revenue: 3490, expenses: 4300, profit: -810 },
  ];

  // Sample data for bar chart
  const performanceData = [
    { name: 'Product A', sales: 4000, target: 3500 },
    { name: 'Product B', sales: 3000, target: 3200 },
    { name: 'Product C', sales: 2000, target: 2800 },
    { name: 'Product D', sales: 2780, target: 2500 },
    { name: 'Product E', sales: 1890, target: 2000 },
  ];

  // Sample data for pie chart
  const marketShareData = [
    { name: 'Product A', value: 400 },
    { name: 'Product B', value: 300 },
    { name: 'Product C', value: 200 },
    { name: 'Product D', value: 278 },
    { name: 'Product E', value: 189 },
  ];

  // Sample data for progress indicators
  const projectProgress = [
    { label: 'Project Alpha', value: 75, color: 'success' as const },
    { label: 'Project Beta', value: 45, color: 'primary' as const },
    { label: 'Project Gamma', value: 90, color: 'success' as const },
    { label: 'Project Delta', value: 30, color: 'warning' as const },
    { label: 'Project Epsilon', value: 15, color: 'error' as const },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
        Data Visualization
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Reusable chart components for displaying data insights
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
          },
          gap: 3,
          mb: 3,
        }}
      >
        <LineChartCard
          title="Sales Overview"
          data={salesData}
          lines={[
            { dataKey: 'revenue', color: '#2196f3', name: 'Revenue' },
            { dataKey: 'expenses', color: '#ff9800', name: 'Expenses' },
            { dataKey: 'profit', color: '#4caf50', name: 'Profit' },
          ]}
        />

        <BarChartCard
          title="Product Performance"
          data={performanceData}
          bars={[
            { dataKey: 'sales', color: '#2196f3', name: 'Sales' },
            { dataKey: 'target', color: '#ff9800', name: 'Target' },
          ]}
        />

        <PieChartCard
          title="Market Share Distribution"
          data={marketShareData}
          colors={['#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#f44336']}
        />

        <ProgressCard
          title="Project Completion Status"
          items={projectProgress}
        />
      </Box>
    </Box>
  );
};

export default DataVisualization;
