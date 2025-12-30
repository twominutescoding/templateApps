import {
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';

interface DataExportProps {
  title: string;
  data: Record<string, any>[];
}

const DataExport = ({ title, data }: DataExportProps) => {
  const exportToCSV = () => {
    if (data.length === 0) return;

    // Dynamically get headers from first row
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) => headers.map((key) => {
        const value = row[key];
        // Handle values with commas by wrapping in quotes
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    alert('PDF export would be implemented using a library like jsPDF');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<TableChartIcon />}
            onClick={exportToCSV}
          >
            CSV
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={exportToJSON}
          >
            JSON
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PictureAsPdfIcon />}
            onClick={exportToPDF}
          >
            PDF
          </Button>
        </Box>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {data.length > 0 && Object.keys(data[0]).map((key) => (
                <TableCell key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={row.id || index}>
                {Object.values(row).map((value, i) => (
                  <TableCell key={i}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default DataExport;
