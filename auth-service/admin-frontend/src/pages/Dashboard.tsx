import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import DevicesIcon from '@mui/icons-material/Devices';
import SecurityIcon from '@mui/icons-material/Security';
import { adminDashboardAPI } from '../services/api';
import type { DashboardStats } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await adminDashboardAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* User Statistics */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">Users</Typography>
              </Box>
              <Typography variant="h3">{stats?.userStats.totalUsers || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active: {stats?.userStats.activeUsers || 0} | Inactive: {stats?.userStats.inactiveUsers || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Session Statistics */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DevicesIcon sx={{ fontSize: 40, mr: 2, color: 'success.main' }} />
                <Typography variant="h6">Active Sessions</Typography>
              </Box>
              <Typography variant="h3">{stats?.sessionStats.totalActiveSessions || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Last 24h: {stats?.sessionStats.sessionsLast24Hours || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Refresh Tokens */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon sx={{ fontSize: 40, mr: 2, color: 'warning.main' }} />
                <Typography variant="h6">Refresh Tokens</Typography>
              </Box>
              <Typography variant="h3">{stats?.sessionStats.totalRefreshTokens || 0}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total stored tokens
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sessions by Entity */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Sessions by Entity
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {stats?.sessionsByEntity && stats.sessionsByEntity.length > 0 ? (
                stats.sessionsByEntity.map((entityStat, index) => (
                  <Card key={index} sx={{ minWidth: 200, flex: '1 1 200px' }}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {entityStat.entity}
                      </Typography>
                      <Typography variant="h4">{entityStat.activeSessions}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Sessions
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {entityStat.totalUsers} unique users
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography color="text.secondary">No active sessions</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ mt: 2 }}>
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      mb: 1,
                      borderBottom: index < stats.recentActivity.length - 1 ? '1px solid #eee' : 'none',
                    }}
                  >
                    <Typography variant="body1">
                      <strong>{activity.username}</strong> - {activity.action}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.ipAddress} | {activity.timestamp}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No recent activity</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
