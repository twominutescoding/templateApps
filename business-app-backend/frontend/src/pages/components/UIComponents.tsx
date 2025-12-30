import { Box, Typography } from '@mui/material';
import ToastNotification from '../../components/ui/ToastNotification';
import ModalExample from '../../components/ui/ModalExample';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';

const UIComponents = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
        UI Components
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Reusable UI components for better user experience
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <ToastNotification title="Toast / Snackbar Notifications" />

        <ModalExample title="Modal Dialogs" />

        <LoadingSkeleton title="Loading Skeletons" />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          <EmptyState
            title="No Items Found"
            icon="inbox"
            message="You don't have any items yet. Start by creating your first item."
            actionLabel="Create Item"
            onAction={() => alert('Create new item clicked!')}
          />

          <EmptyState
            title="No Results"
            icon="search"
            message="We couldn't find any results matching your search criteria."
            actionLabel="Clear Filters"
            onAction={() => alert('Clear filters clicked!')}
          />

          <EmptyState
            title="Empty Folder"
            icon="folder"
            message="This folder is empty. Upload files to get started."
            actionLabel="Upload Files"
            onAction={() => alert('Upload files clicked!')}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default UIComponents;
