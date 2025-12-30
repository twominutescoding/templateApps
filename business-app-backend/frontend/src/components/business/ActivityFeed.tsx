import { Paper, Typography } from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Activity {
  id: number;
  type: 'user' | 'order' | 'email' | 'task';
  title: string;
  description: string;
  time: string;
}

interface ActivityFeedProps {
  title: string;
  activities: Activity[];
}

const ActivityFeed = ({ title, activities }: ActivityFeedProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <PersonIcon />;
      case 'order':
        return <ShoppingCartIcon />;
      case 'email':
        return <EmailIcon />;
      case 'task':
        return <CheckCircleIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'primary';
      case 'order':
        return 'success';
      case 'email':
        return 'info';
      case 'task':
        return 'warning';
      default:
        return 'grey';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        {title}
      </Typography>

      <Timeline position="right">
        {activities.map((activity, index) => (
          <TimelineItem key={activity.id}>
            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.2 }}>
              <Typography variant="caption">{activity.time}</Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color={getColor(activity.type) as any}>
                {getIcon(activity.type)}
              </TimelineDot>
              {index < activities.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {activity.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activity.description}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
};

export default ActivityFeed;
