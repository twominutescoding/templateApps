import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        My Profile
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '350px 1fr',
          },
          gap: 3,
        }}
      >
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              margin: '0 auto',
              mb: 2,
              bgcolor: 'primary.main',
              fontSize: '3rem',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>

          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            {user.name}
          </Typography>

          <Chip
            label={user.role.toUpperCase()}
            color={getRoleColor(user.role)}
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Account Information
          </Typography>

          <List>
            <ListItem>
              <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText
                primary="Full Name"
                secondary={user.name}
                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
              />
            </ListItem>

            <Divider />

            <ListItem>
              <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText
                primary="Email Address"
                secondary={user.email}
                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
              />
            </ListItem>

            <Divider />

            <ListItem>
              <AdminPanelSettingsIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText
                primary="Role"
                secondary={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
              />
            </ListItem>

            <Divider />

            <ListItem>
              <BusinessIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText
                primary="Department"
                secondary={user.department || 'Not specified'}
                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
              />
            </ListItem>

            <Divider />

            <ListItem>
              <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText
                primary="Phone Number"
                secondary={user.phone || 'Not specified'}
                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
              />
            </ListItem>

            <Divider />

            <ListItem>
              <CalendarTodayIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText
                primary="Member Since"
                secondary={new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
              />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default Profile;
