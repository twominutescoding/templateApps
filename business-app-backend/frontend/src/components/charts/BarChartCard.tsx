import { Paper, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useThemeContext } from '../../theme/ThemeContext';

interface DataPoint {
  name: string;
  [key: string]: string | number;
}

interface BarConfig {
  dataKey: string;
  color: string;
  name?: string;
}

interface BarChartCardProps {
  title: string;
  data: DataPoint[];
  bars: BarConfig[];
  height?: number;
}

const BarChartCard = ({ title, data, bars, height = 300 }: BarChartCardProps) => {
  const { mode } = useThemeContext();
  const textColor = mode === 'light' ? '#666' : '#aaa';
  const gridColor = mode === 'light' ? '#e0e0e0' : '#333';

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" stroke={textColor} />
            <YAxis stroke={textColor} />
            <Tooltip
              contentStyle={{
                backgroundColor: mode === 'light' ? '#fff' : '#1e1e1e',
                border: `1px solid ${gridColor}`,
              }}
            />
            <Legend />
            {bars.map((bar) => (
              <Bar
                key={bar.dataKey}
                dataKey={bar.dataKey}
                fill={bar.color}
                name={bar.name || bar.dataKey}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default BarChartCard;
