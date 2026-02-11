import { Box, Typography, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const Home = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Home
      </Typography>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <HomeIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Welcome to your application
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is the home page. Add your content here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Home;
