import { Paper, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useThemeContext } from '../../theme/ThemeContext';

interface DataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface PieChartCardProps {
  title: string;
  data: DataPoint[];
  colors: string[];
  height?: number;
}

const PieChartCard = ({ title, data, colors, height = 300 }: PieChartCardProps) => {
  const { mode } = useThemeContext();
  const gridColor = mode === 'light' ? '#e0e0e0' : '#333';

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: mode === 'light' ? '#fff' : '#1e1e1e',
                border: `1px solid ${gridColor}`,
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default PieChartCard;
