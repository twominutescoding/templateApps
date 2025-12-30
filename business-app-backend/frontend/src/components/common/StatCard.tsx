import { Card, CardContent, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  color?: string;
}

const StatCard = ({ title, value, icon, trend, color = '#1976d2' }: StatCardProps) => {
  const isPositiveTrend = trend !== undefined && trend >= 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 600, mb: 1 }}>
              {value}
            </Typography>
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isPositiveTrend ? (
                  <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: isPositiveTrend ? 'success.main' : 'error.main',
                    fontWeight: 500,
                  }}
                >
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color + '20',
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
