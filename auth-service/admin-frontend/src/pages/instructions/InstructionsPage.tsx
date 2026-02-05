import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  Divider,
  Chip,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import { getInstructions, fetchDocument, getDocumentUrl, type InstructionDoc } from '../../services/docsService';
import MarkdownViewer from '../../components/common/MarkdownViewer';

const getIconComponent = (iconName: string, isPdf: boolean = false) => {
  if (isPdf) return <PictureAsPdfIcon color="error" />;

  switch (iconName) {
    case 'book':
      return <MenuBookIcon />;
    case 'people':
      return <PeopleIcon />;
    case 'security':
      return <SecurityIcon />;
    case 'pdf':
      return <PictureAsPdfIcon color="error" />;
    default:
      return <DescriptionIcon />;
  }
};

const InstructionsPage = () => {
  const [instructions, setInstructions] = useState<InstructionDoc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<InstructionDoc | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInstructions = async () => {
      try {
        setLoading(true);
        const docs = await getInstructions();
        setInstructions(docs);
        setError(null);
      } catch (err) {
        setError('Failed to load instructions. Please try again later.');
        console.error('Error loading instructions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInstructions();
  }, []);

  const handleSelectDoc = async (doc: InstructionDoc) => {
    // For PDFs, open in new tab
    if (doc.type === 'pdf') {
      window.open(getDocumentUrl(doc.file), '_blank');
      return;
    }

    // For markdown, load and display
    try {
      setLoadingContent(true);
      setSelectedDoc(doc);
      const docContent = await fetchDocument(doc.file);
      setContent(docContent);
    } catch (err) {
      setError(`Failed to load document: ${doc.title}`);
      console.error('Error loading document:', err);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleDownloadPdf = (doc: InstructionDoc, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = getDocumentUrl(doc.file);
    link.download = doc.file.split('/').pop() || 'document.pdf';
    link.click();
  };

  const handleOpenPdf = (doc: InstructionDoc, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getDocumentUrl(doc.file), '_blank');
  };

  const handleBack = () => {
    setSelectedDoc(null);
    setContent('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !selectedDoc) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const renderDocItem = (doc: InstructionDoc, index: number, arr: InstructionDoc[]) => {
    const isPdf = doc.type === 'pdf';

    return (
      <Box key={doc.id}>
        <ListItemButton onClick={() => handleSelectDoc(doc)}>
          <ListItemIcon>{getIconComponent(doc.icon, isPdf)}</ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {doc.title}
                {isPdf && (
                  <Chip
                    label="PDF"
                    size="small"
                    color="error"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            }
            secondary={doc.description}
          />
          {isPdf && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Open in new tab">
                <IconButton size="small" onClick={(e) => handleOpenPdf(doc, e)}>
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton size="small" onClick={(e) => handleDownloadPdf(doc, e)}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </ListItemButton>
        {index < arr.length - 1 && <Divider />}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={handleBack}
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: selectedDoc ? 'primary.main' : 'text.primary',
            cursor: selectedDoc ? 'pointer' : 'default',
          }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Instructions
        </Link>
        {selectedDoc && (
          <Typography color="text.primary">{selectedDoc.title}</Typography>
        )}
      </Breadcrumbs>

      {!selectedDoc ? (
        // Document list view
        <>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Documentation & Instructions
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Select a document to view detailed instructions and guides. PDF files will open in a new tab.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Manuals */}
            <Paper elevation={1} sx={{ p: 0, overflow: 'hidden' }}>
              <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
                <Typography variant="h6">
                  <MenuBookIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  User Manuals
                </Typography>
              </Box>
              <List>
                {instructions
                  .filter(doc => doc.category === 'manual')
                  .map((doc, index, arr) => renderDocItem(doc, index, arr))}
                {instructions.filter(doc => doc.category === 'manual').length === 0 && (
                  <ListItemText
                    primary="No manuals available"
                    sx={{ p: 2, color: 'text.secondary' }}
                  />
                )}
              </List>
            </Paper>

            {/* Guides */}
            <Paper elevation={1} sx={{ p: 0, overflow: 'hidden' }}>
              <Box sx={{ p: 2, backgroundColor: 'secondary.main', color: 'secondary.contrastText' }}>
                <Typography variant="h6">
                  <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Feature Guides
                </Typography>
              </Box>
              <List>
                {instructions
                  .filter(doc => doc.category === 'guide')
                  .map((doc, index, arr) => renderDocItem(doc, index, arr))}
                {instructions.filter(doc => doc.category === 'guide').length === 0 && (
                  <ListItemText
                    primary="No guides available"
                    sx={{ p: 2, color: 'text.secondary' }}
                  />
                )}
              </List>
            </Paper>

            {/* PDF Documents */}
            {instructions.filter(doc => doc.category === 'pdf').length > 0 && (
              <Paper elevation={1} sx={{ p: 0, overflow: 'hidden', gridColumn: { md: 'span 2' } }}>
                <Box sx={{ p: 2, backgroundColor: 'error.main', color: 'error.contrastText' }}>
                  <Typography variant="h6">
                    <PictureAsPdfIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    PDF Documents
                  </Typography>
                </Box>
                <List>
                  {instructions
                    .filter(doc => doc.category === 'pdf')
                    .map((doc, index, arr) => renderDocItem(doc, index, arr))}
                </List>
              </Paper>
            )}
          </Box>
        </>
      ) : (
        // Document view (markdown only - PDFs open in new tab)
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Tooltip title="Back to list">
              <IconButton onClick={handleBack} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h5">{selectedDoc.title}</Typography>
          </Box>

          <Paper elevation={1} sx={{ p: 4 }}>
            {loadingContent ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <MarkdownViewer content={content} />
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default InstructionsPage;
