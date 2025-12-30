import { Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useThemeContext } from '../../theme/ThemeContext';

interface DataPoint {
  name: string;
  [key: string]: string | number;
}

interface LineConfig {
  dataKey: string;
  color: string;
  name?: string;
}

interface LineChartCardProps {
  title: string;
  data: DataPoint[];
  lines: LineConfig[];
  height?: number;
}

const LineChartCard = ({ title, data, lines, height = 300 }: LineChartCardProps) => {
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
          <LineChart data={data}>
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
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                strokeWidth={2}
                name={line.name || line.dataKey}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default LineChartCard;
