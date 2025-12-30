import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BarChartIcon from '@mui/icons-material/BarChart';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import WidgetsIcon from '@mui/icons-material/Widgets';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import TableChartIcon from '@mui/icons-material/TableChart';

interface ComponentCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const categories: ComponentCategory[] = [
  {
    id: 'data-visualization',
    title: 'Data Visualization',
    description: 'Charts, graphs, progress indicators, and timeline components for displaying data insights.',
    icon: <BarChartIcon sx={{ fontSize: 48 }} />,
    path: '/components/data-visualization',
    color: '#2196f3',
  },
  {
    id: 'form-components',
    title: 'Form Components',
    description: 'Multi-step wizards, advanced search filters, form builders, and validation examples.',
    icon: <FormatListBulletedIcon sx={{ fontSize: 48 }} />,
    path: '/components/form-components',
    color: '#4caf50',
  },
  {
    id: 'ui-components',
    title: 'UI Components',
    description: 'Toast notifications, modals, breadcrumbs, empty states, and loading skeletons.',
    icon: <WidgetsIcon sx={{ fontSize: 48 }} />,
    path: '/components/ui-components',
    color: '#ff9800',
  },
  {
    id: 'advanced-features',
    title: 'Advanced Features',
    description: 'Data export, bulk actions, advanced filtering, drag & drop, and file upload functionality.',
    icon: <FlashOnIcon sx={{ fontSize: 48 }} />,
    path: '/components/advanced-features',
    color: '#9c27b0',
  },
  {
    id: 'business-specific',
    title: 'Business Specific',
    description: 'Invoice templates, email builders, calendars, kanban boards, and activity feeds.',
    icon: <BusinessCenterIcon sx={{ fontSize: 48 }} />,
    path: '/components/business-specific',
    color: '#f44336',
  },
  {
    id: 'comprehensive-demo',
    title: '⭐ All-in-One Demo',
    description: 'Complete demonstration: Bulk edit, filtering, sorting, date ranges, pagination, status indicators, and export - all in one powerful table!',
    icon: <TableChartIcon sx={{ fontSize: 48 }} />,
    path: '/components/comprehensive-demo',
    color: '#00bcd4',
  },
];

const Components = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
        Component Showcase
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Explore our collection of reusable components and advanced features
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {categories.map((category) => (
          <Card
            key={category.id}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
              },
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: `${category.color}15`,
                  color: category.color,
                  mb: 2,
                }}
              >
                {category.icon}
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {category.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {category.description}
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                variant="contained"
                onClick={() => navigate(category.path)}
                sx={{
                  backgroundColor: category.color,
                  '&:hover': {
                    backgroundColor: category.color,
                    filter: 'brightness(0.9)',
                  },
                }}
              >
                View Examples
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Components;
