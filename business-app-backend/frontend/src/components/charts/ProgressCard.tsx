import { Paper, Typography, Box, LinearProgress } from '@mui/material';

interface ProgressItem {
  label: string;
  value: number;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

interface ProgressCardProps {
  title: string;
  items: ProgressItem[];
}

const ProgressCard = ({ title, items }: ProgressCardProps) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {items.map((item, index) => (
          <Box key={index}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.value}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={item.value}
              color={item.color || 'primary'}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default ProgressCard;
