import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Skeleton,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';

interface LoadingSkeletonProps {
  title: string;
}

const LoadingSkeleton = ({ title }: LoadingSkeletonProps) => {
  const [loading, setLoading] = useState(true);

  const toggleLoading = () => {
    setLoading(!loading);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Button variant="outlined" onClick={toggleLoading}>
          {loading ? 'Show Content' : 'Show Loading'}
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
          },
          gap: 2,
        }}
      >
        {[1, 2].map((item) => (
          <Card key={item}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {loading ? (
                  <Skeleton variant="circular" width={40} height={40} />
                ) : (
                  <Avatar sx={{ bgcolor: 'primary.main' }}>U</Avatar>
                )}
                <Box sx={{ ml: 2, flex: 1 }}>
                  {loading ? (
                    <>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="40%" />
                    </>
                  ) : (
                    <>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        User Name {item}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        user{item}@example.com
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>

              {loading ? (
                <>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="80%" />
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  This is the actual content that appears after loading is complete. It
                  demonstrates how the skeleton gives users a preview of the content structure.
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Paper>
  );
};

export default LoadingSkeleton;
