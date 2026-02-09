/**
 * Utilities for document handling and type detection
 */

export type DocumentType = 'pdf' | 'image' | 'word' | 'unknown';

/**
 * Detect document type from URL/filename
 */
export const detectDocumentType = (url: string): DocumentType => {
  try {
    const extension = url.split('.').pop()?.toLowerCase() || '';

    if (['pdf'].includes(extension)) {
      return 'pdf';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)) {
      return 'image';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'word';
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * Check if document type is supported
 */
export const isSupportedDocumentType = (type: DocumentType): boolean => {
  return type !== 'unknown';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Format date for display
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Download document from URL
 */
export const downloadDocument = (url: string, filename: string): void => {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download document');
  }
};

/**
 * Validate document URL
 */
export const isValidDocumentUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get icon background color based on document type
 */
export const getDocumentIconBackground = (type: DocumentType): string => {
  switch (type) {
    case 'pdf':
      return '#ffe0e0';
    case 'image':
      return '#e0f2f1';
    case 'word':
      return '#e3f2fd';
    default:
      return '#f5f5f5';
  }
};

/**
 * Get icon color based on document type
 */
export const getDocumentIconColor = (type: DocumentType): string => {
  switch (type) {
    case 'pdf':
      return '#d32f2f';
    case 'image':
      return '#00796b';
    case 'word':
      return '#1565c0';
    default:
      return '#616161';
  }
};
