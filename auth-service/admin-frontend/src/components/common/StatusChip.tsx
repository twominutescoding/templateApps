import { Chip, Menu, MenuItem } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useState } from 'react';

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending' | 'cancelled';

interface StatusChipProps {
  status: string; // Can be any string: ACTIVE, INACTIVE, REVOKED, etc.
  label?: string; // Optional label override
  size?: 'small' | 'medium';
  onStatusChange?: (newStatus: string) => void;
  allowedStatuses?: string[];
}

const StatusChip = ({ status, label, size = 'small', onStatusChange, allowedStatuses }: StatusChipProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (onStatusChange && allowedStatuses && allowedStatuses.length > 1) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusSelect = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    handleClose();
  };
  const getStatusConfig = () => {
    const statusUpper = status?.toUpperCase();

    switch (statusUpper) {
      case 'ACTIVE':
      case 'SUCCESS':
        return {
          color: '#4caf50',
          bgColor: 'rgba(76, 175, 80, 0.1)',
          icon: <CheckCircleIcon />,
        };
      case 'INACTIVE':
      case 'ERROR':
        return {
          color: '#f44336',
          bgColor: 'rgba(244, 67, 54, 0.1)',
          icon: <ErrorIcon />,
        };
      case 'REVOKED':
      case 'CANCELLED':
        return {
          color: '#607d8b',
          bgColor: 'rgba(96, 125, 139, 0.1)',
          icon: <CancelIcon />,
        };
      case 'WARNING':
        return {
          color: '#ff9800',
          bgColor: 'rgba(255, 152, 0, 0.1)',
          icon: <WarningIcon />,
        };
      case 'INFO':
        return {
          color: '#2196f3',
          bgColor: 'rgba(33, 150, 243, 0.1)',
          icon: <InfoIcon />,
        };
      case 'PENDING':
        return {
          color: '#9e9e9e',
          bgColor: 'rgba(158, 158, 158, 0.1)',
          icon: <HourglassEmptyIcon />,
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
  const displayLabel = label || status;
  const isClickable = onStatusChange && allowedStatuses && allowedStatuses.length > 1;

  return (
    <>
      <Chip
        icon={config.icon}
        label={displayLabel}
        size={size}
        onClick={handleClick}
        sx={{
          backgroundColor: config.bgColor,
          color: config.color,
          borderColor: config.color,
          border: '1px solid',
          fontWeight: 600,
          cursor: isClickable ? 'pointer' : 'default',
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
            transform: isClickable ? 'translateY(-1px)' : 'none',
          },
        }}
      />

      {isClickable && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {allowedStatuses.map((allowedStatus) => (
            <MenuItem
              key={allowedStatus}
              onClick={() => handleStatusSelect(allowedStatus)}
              selected={allowedStatus === status}
            >
              {allowedStatus}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};

export default StatusChip;
