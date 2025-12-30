import { Box, Typography } from '@mui/material';
import InvoiceTemplate from '../../components/business/InvoiceTemplate';
import ActivityFeed from '../../components/business/ActivityFeed';
import KanbanBoard from '../../components/business/KanbanBoard';

const BusinessSpecific = () => {
  const invoiceItems = [
    { description: 'Website Design & Development', quantity: 1, rate: 2500 },
    { description: 'Monthly Hosting & Maintenance', quantity: 3, rate: 150 },
    { description: 'SEO Optimization', quantity: 1, rate: 800 },
  ];

  const activities = [
    {
      id: 1,
      type: 'user' as const,
      title: 'New user registered',
      description: 'John Doe created a new account',
      time: '2 hours ago',
    },
    {
      id: 2,
      type: 'order' as const,
      title: 'New order received',
      description: 'Order #1234 placed by Jane Smith',
      time: '4 hours ago',
    },
    {
      id: 3,
      type: 'email' as const,
      title: 'Email campaign sent',
      description: 'Monthly newsletter sent to 1,234 subscribers',
      time: '6 hours ago',
    },
    {
      id: 4,
      type: 'task' as const,
      title: 'Task completed',
      description: 'Website redesign project marked as complete',
      time: '1 day ago',
    },
  ];

  const kanbanColumns = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        {
          id: 1,
          title: 'Update homepage design',
          description: 'Redesign the landing page with new branding',
          priority: 'high' as const,
          assignee: 'John D.',
        },
        {
          id: 2,
          title: 'Fix mobile responsiveness',
          description: 'Address layout issues on mobile devices',
          priority: 'medium' as const,
          assignee: 'Sarah M.',
        },
      ],
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      tasks: [
        {
          id: 3,
          title: 'Implement payment gateway',
          description: 'Integrate Stripe payment processing',
          priority: 'high' as const,
          assignee: 'Mike R.',
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        {
          id: 4,
          title: 'Setup CI/CD pipeline',
          description: 'Configure automated deployment',
          priority: 'low' as const,
          assignee: 'Emily K.',
        },
        {
          id: 5,
          title: 'Database optimization',
          description: 'Improve query performance',
          priority: 'medium' as const,
          assignee: 'Tom H.',
        },
      ],
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
        Business Specific
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Business-focused components for invoices, activity tracking, and project management
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <InvoiceTemplate
          invoiceNumber="INV-2024-001"
          date="January 15, 2024"
          dueDate="February 15, 2024"
          clientName="Acme Corporation"
          clientAddress="456 Client Street, City, State 54321"
          items={invoiceItems}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 3,
          }}
        >
          <ActivityFeed title="Activity Timeline" activities={activities} />

          <Box>
            <KanbanBoard title="Project Board" columns={kanbanColumns} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BusinessSpecific;
