import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending' | 'cancelled';

interface StatusChipProps {
  status: StatusType;
  label: string;
  size?: 'small' | 'medium';
}

const StatusChip = ({ status, label, size = 'small' }: StatusChipProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          color: '#4caf50',
          bgColor: 'rgba(76, 175, 80, 0.1)',
          icon: <CheckCircleIcon />,
        };
      case 'error':
        return {
          color: '#f44336',
          bgColor: 'rgba(244, 67, 54, 0.1)',
          icon: <ErrorIcon />,
        };
      case 'warning':
        return {
          color: '#ff9800',
          bgColor: 'rgba(255, 152, 0, 0.1)',
          icon: <WarningIcon />,
        };
      case 'info':
        return {
          color: '#2196f3',
          bgColor: 'rgba(33, 150, 243, 0.1)',
          icon: <InfoIcon />,
        };
      case 'pending':
        return {
          color: '#9e9e9e',
          bgColor: 'rgba(158, 158, 158, 0.1)',
          icon: <HourglassEmptyIcon />,
        };
      case 'cancelled':
        return {
          color: '#607d8b',
          bgColor: 'rgba(96, 125, 139, 0.1)',
          icon: <CancelIcon />,
        };
      default:
        return {
          color: '#9e9e9e',
          bgColor: 'rgba(158, 158, 158, 0.1)',
          icon: <InfoIcon />,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      icon={config.icon}
      label={label}
      size={size}
      sx={{
        backgroundColor: config.bgColor,
        color: config.color,
        borderColor: config.color,
        border: '1px solid',
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: config.color,
        },
        // Subtle shadow for depth
        boxShadow: `0 1px 3px ${config.color}20`,
        // Very subtle glow animation
        animation: 'subtleGlow 3s ease-in-out infinite',
        '@keyframes subtleGlow': {
          '0%, 100%': {
            boxShadow: `0 1px 3px ${config.color}20, 0 0 0px ${config.color}00`,
          },
          '50%': {
            boxShadow: `0 1px 3px ${config.color}20, 0 0 4px ${config.color}15`,
          },
        },
        // Smooth transitions
        transition: 'all 0.3s ease',
        // Hover effect for interactivity
        '&:hover': {
          boxShadow: `0 2px 6px ${config.color}30, 0 0 8px ${config.color}20`,
          transform: 'translateY(-1px)',
        },
      }}
    />
  );
};

export default StatusChip;
