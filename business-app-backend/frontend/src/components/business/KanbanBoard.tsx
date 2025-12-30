import { Paper, Typography, Box, Card, CardContent, Chip } from '@mui/material';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignee: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

interface KanbanBoardProps {
  title: string;
  columns: Column[];
}

const KanbanBoard = ({ title, columns }: KanbanBoardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        {title}
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}
      >
        {columns.map((column) => (
          <Box key={column.id}>
            <Box
              sx={{
                p: 2,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {column.title}
              </Typography>
              <Typography variant="caption">{column.tasks.length} tasks</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {column.tasks.map((task) => (
                <Card key={task.id} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {task.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={task.priority.toUpperCase()}
                        size="small"
                        color={getPriorityColor(task.priority) as any}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {task.assignee}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default KanbanBoard;
