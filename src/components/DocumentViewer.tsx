import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
// Note: Import CSS files if available in your react-pdf version
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configuration du worker PDF
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export type DocumentType = 'pdf' | 'docx' | 'image' | 'auto';

export interface DocumentViewerProps {
    /**
     * URL ou chemin du document à afficher
     */
    documentUrl: string;
    /**
     * Type de document: 'pdf', 'docx', 'image' ou 'auto' pour détection automatique
     */
    type?: DocumentType;
    /**
     * Titre optionnel du document
     */
    title?: string;
    /**
     * Hauteur du conteneur (par défaut: 600px)
     */
    height?: string | number;
    /**
     * Largeur du conteneur (par défaut: 100%)
     */
    width?: string | number;
    /**
     * Afficher les contrôles de zoom et pagination
     */
    showControls?: boolean;
    /**
     * Callback en cas d'erreur
     */
    onError?: (error: Error) => void;
    /**
     * Callback au chargement réussi
     */
    onLoad?: () => void;
}

/**
 * Composant DocumentViewer - Affiche PDF, DOCX et images sans téléchargement
 * Supporte zoom, pagination, et gestion d'erreurs
 */
export const DocumentViewer: React.FC<DocumentViewerProps> = ({
    documentUrl,
    type = 'auto',
    title,
    height = 600,
    width = '100%',
    showControls = true,
    onError,
    onLoad,
}) => {
    const [docType, setDocType] = useState<DocumentType>(type);
    const [numPages, setNumPages] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState<string>('');

    // Détecte automatiquement le type de document
    useEffect(() => {
        if (type === 'auto' && documentUrl) {
            const ext = documentUrl.split('.').pop()?.toLowerCase();
            if (ext === 'pdf') {
                setDocType('pdf');
            } else if (ext === 'docx') {
                setDocType('docx');
            } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
                setDocType('image');
            }
        }
    }, [documentUrl, type]);

    // Charge et convertit les DOCX en HTML
    useEffect(() => {
        if (docType === 'docx') {
            loadDocxDocument();
        }
    }, [documentUrl, docType]);

    const loadDocxDocument = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(documentUrl);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();

            // Import dynamique de mammoth pour réduire la taille du bundle
            const mammoth = await import('mammoth');
            const result = await mammoth.convertToHtml({ arrayBuffer });

            setHtmlContent(result.value);
            onLoad?.();
            setLoading(false);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du DOCX';
            setError(errorMessage);
            onError?.(err instanceof Error ? err : new Error(errorMessage));
            setLoading(false);
        }
    };

    const handlePdfLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setCurrentPage(1);
        onLoad?.();
        setLoading(false);
    };

    const handleError = (error: Error) => {
        const errorMessage = `Erreur PDF: ${error.message}`;
        setError(errorMessage);
        onError?.(error);
        setLoading(false);
    };

    const handleImageError = () => {
        const errorMessage = 'Impossible de charger l\'image';
        setError(errorMessage);
        onError?.(new Error(errorMessage));
        setLoading(false);
    };

    const handleImageLoad = () => {
        onLoad?.();
        setLoading(false);
    };

    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
    const resetZoom = () => setScale(1);

    const goToNextPage = () => {
        if (numPages && currentPage < numPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const heightStyle = typeof height === 'number' ? `${height}px` : height;
    const widthStyle = typeof width === 'number' ? `${width}px` : width;

    return (
        <div className="document-viewer" style={{ width: widthStyle, height: heightStyle, display: 'flex', flexDirection: 'column' }}>
            {/* Header avec titre et contrôles */}
            {(title || showControls) && (
                <div className="document-viewer-header" style={{ padding: '12px', borderBottom: '1px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {title && <h3 style={{ margin: '0', fontSize: '16px' }}>{title}</h3>}
                        {showControls && docType === 'pdf' && (
                            <div className="pdf-controls" style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={zoomOut} title="Réduire">−</button>
                                <span style={{ padding: '4px 8px', minWidth: '60px', textAlign: 'center' }}>
                                    {Math.round(scale * 100)}%
                                </span>
                                <button onClick={resetZoom} title="Réinitialiser">●</button>
                                <button onClick={zoomIn} title="Agrandir">+</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Zone de contenu */}
            <div
                className="document-viewer-content"
                style={{
                    flex: 1,
                    overflow: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: '12px',
                    backgroundColor: '#ffffff',
                }}
            >
                {loading && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        <div style={{ fontSize: '14px' }}>Chargement du document...</div>
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        borderRadius: '4px',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '14px', marginBottom: '8px' }}>Erreur de chargement</div>
                        <div style={{ fontSize: '12px' }}>{error}</div>
                    </div>
                )}

                {!loading && !error && docType === 'pdf' && (
                    <div style={{ width: '100%' }}>
                        <Document
                            file={documentUrl}
                            onLoadSuccess={handlePdfLoadSuccess}
                            onError={handleError}
                            loading={<div>Chargement du PDF...</div>}
                        >
                            <Page
                                pageNumber={currentPage}
                                scale={scale}
                                renderAnnotationLayer={true}
                                renderTextLayer={true}
                            />
                        </Document>
                    </div>
                )}

                {!loading && !error && docType === 'docx' && htmlContent && (
                    <div
                        className="docx-content"
                        style={{
                            width: '100%',
                            maxWidth: '800px',
                            padding: '20px',
                            backgroundColor: '#fafafa',
                            borderRadius: '4px',
                        }}
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                )}

                {!loading && !error && docType === 'image' && (
                    <img
                        src={documentUrl}
                        alt={title || 'Document image'}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                        }}
                    />
                )}
            </div>

            {/* Footer avec pagination */}
            {!loading && !error && showControls && docType === 'pdf' && numPages && (
                <div className="document-viewer-footer" style={{
                    padding: '12px',
                    borderTop: '1px solid #e0e0e0',
                    backgroundColor: '#f5f5f5',
                    textAlign: 'center',
                }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                        <button onClick={goToPreviousPage} disabled={currentPage === 1} title="Page précédente">
                            ← Précédent
                        </button>
                        <span style={{ minWidth: '100px' }}>
                            Page {currentPage} / {numPages}
                        </span>
                        <button onClick={goToNextPage} disabled={currentPage === numPages} title="Page suivante">
                            Suivant →
                        </button>
                    </div>
                </div>
            )}

            {/* Styles intégrés */}
            <style>{`
                .document-viewer button {
                    padding: 6px 12px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                }

                .document-viewer button:hover:not(:disabled) {
                    background: #f0f0f0;
                    border-color: #999;
                }

                .document-viewer button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .docx-content {
                    font-family: Calibri, Arial, sans-serif;
                    line-height: 1.5;
                }

                .docx-content p {
                    margin: 0.5rem 0;
                }

                .docx-content table {
                    border-collapse: collapse;
                    width: 100%;
                }

                .docx-content table, 
                .docx-content th, 
                .docx-content td {
                    border: 1px solid #ddd;
                }

                .docx-content th, 
                .docx-content td {
                    padding: 8px;
                }
            `}</style>
        </div>
    );
};

export default DocumentViewer;
