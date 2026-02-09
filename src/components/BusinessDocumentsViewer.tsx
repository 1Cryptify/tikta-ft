import React, { useState } from 'react';
import { Business } from '../hooks/useBusiness';
import DocumentViewer from './DocumentViewer';

interface BusinessDocumentsViewerProps {
    business: Business;
    getDocumentPreviewUrl: (path: string) => string;
}

type DocumentKey = 'nui_document' | 'commerce_register_document' | 'website_document' | 'creation_document';

const DOCUMENT_LABELS: Record<DocumentKey, string> = {
    nui_document: 'Numéro Unique d\'Identification',
    commerce_register_document: 'Registre de Commerce',
    website_document: 'Document Site Web',
    creation_document: 'Document de Création',
};

/**
 * Composant pour afficher tous les documents d'une entreprise
 * Permet de visualiser PDF, DOCX et images sans télécharger
 */
export const BusinessDocumentsViewer: React.FC<BusinessDocumentsViewerProps> = ({
    business,
    getDocumentPreviewUrl,
}) => {
    const [selectedDocument, setSelectedDocument] = useState<DocumentKey | null>(null);

    // Récupère les documents disponibles
    const availableDocuments = (Object.keys(DOCUMENT_LABELS) as DocumentKey[]).filter(
        key => business[key]
    );

    if (availableDocuments.length === 0) {
        return (
            <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
                <p style={{ color: '#666' }}>Aucun document disponible pour cette entreprise</p>
            </div>
        );
    }

    const selectedDoc = selectedDocument ? business[selectedDocument] : null;
    const selectedLabel = selectedDocument ? DOCUMENT_LABELS[selectedDocument] : '';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', height: '700px' }}>
            {/* Sidebar avec liste des documents */}
            <div style={{
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                overflow: 'auto',
                padding: '12px',
                borderRight: '1px solid #e0e0e0',
            }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', textTransform: 'uppercase', color: '#666' }}>
                    Documents
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {availableDocuments.map((docKey) => (
                        <button
                            key={docKey}
                            onClick={() => setSelectedDocument(docKey)}
                            style={{
                                padding: '10px 12px',
                                border: selectedDocument === docKey ? '2px solid #1976d2' : '1px solid #ddd',
                                backgroundColor: selectedDocument === docKey ? '#e3f2fd' : 'white',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '12px',
                                fontWeight: selectedDocument === docKey ? 'bold' : 'normal',
                                color: selectedDocument === docKey ? '#1976d2' : '#333',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => {
                                if (selectedDocument !== docKey) {
                                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fafafa';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (selectedDocument !== docKey) {
                                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white';
                                }
                            }}
                        >
                            {DOCUMENT_LABELS[docKey]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Zone d'affichage du document */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedDoc ? (
                    <>
                        <div style={{ padding: '0 12px' }}>
                            <h3 style={{ margin: '0', fontSize: '16px', color: '#333' }}>
                                {selectedLabel}
                            </h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                                {selectedDoc}
                            </p>
                        </div>
                        <DocumentViewer
                            documentUrl={getDocumentPreviewUrl(selectedDoc)}
                            type="auto"
                            title={selectedLabel}
                            height="100%"
                            width="100%"
                            showControls={true}
                            onError={(error) => {
                                console.error('Erreur de chargement du document:', error);
                            }}
                            onLoad={() => {
                                console.log('Document chargé:', selectedLabel);
                            }}
                        />
                    </>
                ) : (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1,
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        color: '#999',
                    }}>
                        Sélectionnez un document pour le visualiser
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .business-documents-viewer {
                        grid-template-columns: 1fr !important;
                    }

                    .document-list {
                        display: flex;
                        gap: 8px;
                        overflow-x: auto;
                        padding-bottom: 8px;
                    }

                    .document-list button {
                        white-space: nowrap;
                        flex-shrink: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default BusinessDocumentsViewer;
