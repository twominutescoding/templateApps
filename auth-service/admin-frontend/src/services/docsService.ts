// Types for documentation system
export type DocType = 'md' | 'pdf';

export interface InstructionDoc {
  id: string;
  title: string;
  description: string;
  file: string;
  category: string;
  icon: string;
  type?: DocType; // 'md' (default) or 'pdf'
}

export interface ChangelogEntry {
  version: string;
  date: string;
  file: string;
}

export interface DocsManifest {
  version: string;
  appName: string;
  lastUpdated: string;
  instructions: InstructionDoc[];
  changelog: ChangelogEntry[];
}

const DOCS_BASE_PATH = '/docs';

/**
 * Fetch the documentation manifest
 */
export const fetchManifest = async (): Promise<DocsManifest> => {
  const response = await fetch(`${DOCS_BASE_PATH}/manifest.json`);
  if (!response.ok) {
    throw new Error('Failed to load documentation manifest');
  }
  return response.json();
};

/**
 * Fetch a markdown document
 */
export const fetchDocument = async (filePath: string): Promise<string> => {
  const response = await fetch(`${DOCS_BASE_PATH}/${filePath}`);
  if (!response.ok) {
    throw new Error(`Failed to load document: ${filePath}`);
  }
  return response.text();
};

/**
 * Get the full URL for a document (useful for PDFs)
 */
export const getDocumentUrl = (filePath: string): string => {
  return `${DOCS_BASE_PATH}/${filePath}`;
};

/**
 * Get all instruction documents
 */
export const getInstructions = async (): Promise<InstructionDoc[]> => {
  const manifest = await fetchManifest();
  // Add default type based on file extension if not specified
  return manifest.instructions.map(doc => ({
    ...doc,
    type: doc.type || (doc.file.endsWith('.pdf') ? 'pdf' : 'md'),
  }));
};

/**
 * Get all changelog entries
 */
export const getChangelog = async (): Promise<ChangelogEntry[]> => {
  const manifest = await fetchManifest();
  return manifest.changelog;
};

/**
 * Get app info from manifest
 */
export const getAppInfo = async (): Promise<{ version: string; appName: string; lastUpdated: string }> => {
  const manifest = await fetchManifest();
  return {
    version: manifest.version,
    appName: manifest.appName,
    lastUpdated: manifest.lastUpdated,
  };
};
