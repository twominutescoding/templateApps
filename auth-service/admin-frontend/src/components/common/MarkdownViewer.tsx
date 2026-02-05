import React, { useMemo } from 'react';
import { Box, Typography, Divider, Paper, List, ListItem, ListItemText } from '@mui/material';

interface MarkdownViewerProps {
  content: string;
}

/**
 * Simple Markdown viewer component
 * Supports: headers, paragraphs, lists, blockquotes, code blocks, bold, italic
 */
const MarkdownViewer = ({ content }: MarkdownViewerProps) => {
  const elements = useMemo(() => {
    // Strip frontmatter (--- ... --- block at start of file)
    const stripFrontmatter = (text: string): string => {
      const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/;
      return text.replace(frontmatterRegex, '');
    };

    const processedContent = stripFrontmatter(content);
    const lines = processedContent.split('\n');
    const result: React.ReactElement[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let listItems: string[] = [];

    const processInlineFormatting = (text: string): React.ReactNode => {
      // Process bold and italic
      const parts: React.ReactNode[] = [];
      let remaining = text;
      let key = 0;

      while (remaining.length > 0) {
        // Check for bold (**text**)
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        // Check for italic (*text*)
        const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
        // Check for inline code (`code`)
        const codeMatch = remaining.match(/`([^`]+)`/);

        const matches = [
          boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
          italicMatch ? { type: 'italic', match: italicMatch, index: italicMatch.index! } : null,
          codeMatch ? { type: 'code', match: codeMatch, index: codeMatch.index! } : null,
        ].filter(Boolean).sort((a, b) => a!.index - b!.index);

        if (matches.length === 0) {
          parts.push(remaining);
          break;
        }

        const first = matches[0]!;
        if (first.index > 0) {
          parts.push(remaining.substring(0, first.index));
        }

        if (first.type === 'bold') {
          parts.push(<strong key={key++}>{first.match[1]}</strong>);
        } else if (first.type === 'italic') {
          parts.push(<em key={key++}>{first.match[1]}</em>);
        } else if (first.type === 'code') {
          parts.push(
            <Box
              component="code"
              key={key++}
              sx={{
                backgroundColor: 'action.hover',
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
                fontFamily: 'monospace',
                fontSize: '0.875em',
              }}
            >
              {first.match[1]}
            </Box>
          );
        }

        remaining = remaining.substring(first.index + first.match[0].length);
      }

      return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
    };

    const flushList = () => {
      if (listItems.length > 0) {
        result.push(
          <List key={result.length} dense sx={{ pl: 2 }}>
            {listItems.map((item, idx) => (
              <ListItem key={idx} sx={{ py: 0.25 }}>
                <ListItemText
                  primary={processInlineFormatting(item)}
                  sx={{ '& .MuiTypography-root': { fontSize: '0.95rem' } }}
                />
              </ListItem>
            ))}
          </List>
        );
        listItems = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          result.push(
            <Paper
              key={result.length}
              elevation={0}
              sx={{
                p: 2,
                my: 2,
                backgroundColor: 'grey.900',
                borderRadius: 1,
                overflow: 'auto',
              }}
            >
              <Box
                component="pre"
                sx={{
                  m: 0,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: 'grey.100',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {codeContent.join('\n')}
              </Box>
            </Paper>
          );
          codeContent = [];
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        flushList();
        result.push(
          <Typography key={result.length} variant="h4" gutterBottom sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
            {line.substring(2)}
          </Typography>
        );
        continue;
      }

      if (line.startsWith('## ')) {
        flushList();
        result.push(
          <Typography key={result.length} variant="h5" gutterBottom sx={{ mt: 3, mb: 1.5, fontWeight: 600 }}>
            {line.substring(3)}
          </Typography>
        );
        continue;
      }

      if (line.startsWith('### ')) {
        flushList();
        result.push(
          <Typography key={result.length} variant="h6" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
            {line.substring(4)}
          </Typography>
        );
        continue;
      }

      // Horizontal rule
      if (line.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
        flushList();
        result.push(<Divider key={result.length} sx={{ my: 3 }} />);
        continue;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        flushList();
        result.push(
          <Paper
            key={result.length}
            elevation={0}
            sx={{
              p: 2,
              my: 2,
              borderLeft: 4,
              borderColor: 'primary.main',
              backgroundColor: 'action.hover',
            }}
          >
            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
              {processInlineFormatting(line.substring(2))}
            </Typography>
          </Paper>
        );
        continue;
      }

      // Unordered list
      if (line.match(/^[-*+]\s/)) {
        listItems.push(line.substring(2));
        continue;
      }

      // Ordered list
      if (line.match(/^\d+\.\s/)) {
        listItems.push(line.replace(/^\d+\.\s/, ''));
        continue;
      }

      // Empty line - flush list and add spacing
      if (line.trim() === '') {
        flushList();
        continue;
      }

      // Regular paragraph
      flushList();
      result.push(
        <Typography key={result.length} variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
          {processInlineFormatting(line)}
        </Typography>
      );
    }

    flushList();

    return result;
  }, [content]);

  return <Box sx={{ maxWidth: '100%' }}>{elements}</Box>;
};

export default MarkdownViewer;
