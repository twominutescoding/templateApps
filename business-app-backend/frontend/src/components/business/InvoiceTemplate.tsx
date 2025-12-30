import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Button,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceTemplateProps {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientAddress: string;
  items: InvoiceItem[];
}

const InvoiceTemplate = ({
  invoiceNumber,
  date,
  dueDate,
  clientName,
  clientAddress,
  items,
}: InvoiceTemplateProps) => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            INVOICE
          </Typography>
          <Typography variant="body2" color="text.secondary">
            #{invoiceNumber}
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<PrintIcon />} size="small">
          Print
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, mb: 4 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            FROM
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Your Company Name
          </Typography>
          <Typography variant="body2" color="text.secondary">
            123 Business Street
            <br />
            City, State 12345
            <br />
            contact@company.com
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            BILL TO
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {clientName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {clientAddress}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Invoice Date
          </Typography>
          <Typography variant="body2">{date}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Due Date
          </Typography>
          <Typography variant="body2">{dueDate}</Typography>
        </Box>
      </Box>

      <TableContainer sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCell align="right">{item.quantity}</TableCell>
                <TableCell align="right">${item.rate.toFixed(2)}</TableCell>
                <TableCell align="right">${(item.quantity * item.rate).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Box sx={{ width: 300 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Subtotal:
            </Typography>
            <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Tax (10%):
            </Typography>
            <Typography variant="body2">${tax.toFixed(2)}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Total:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              ${total.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default InvoiceTemplate;
