import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors, spacing, borderRadius, shadows } from '../config/theme';
import { useContract, ContractTemplate } from '../hooks/useContract';
import {
    FiUpload,
    FiDownload,
    FiCheckCircle,
    FiTrash2,
    FiFileText,
    FiAlertCircle,
    FiRefreshCw,
    FiEdit3,
} from 'react-icons/fi';

const transitionsFast = '150ms ease-in-out';

const ContentSection = styled.div`
  padding: ${spacing.xl};
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
`;

const PageHeader = styled.div`
  margin-bottom: ${spacing.xxl};

  h1 {
    font-size: 2rem;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.sm};
  }

  p {
    color: ${colors.textSecondary};
    font-size: 0.9rem;
    max-width: 720px;
  }
`;

const Card = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.lg};
  padding: ${spacing.xl};
  box-shadow: ${shadows.sm};
  margin-bottom: ${spacing.xl};
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.md};
  margin-bottom: ${spacing.lg};
  flex-wrap: wrap;

  h2 {
    font-size: 1.15rem;
    color: ${colors.textPrimary};
    margin: 0;
    display: flex;
    align-items: center;
    gap: ${spacing.sm};

    svg {
      color: ${colors.primary};
    }
  }
`;

const CurrentBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.lg};
  padding: ${spacing.lg};
  background: ${colors.neutral};
  border-radius: ${borderRadius.md};
  flex-wrap: wrap;
`;

const CurrentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.md};

  .icon {
    width: 48px;
    height: 48px;
    border-radius: ${borderRadius.md};
    background: #e3f2fd;
    color: ${colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    flex-shrink: 0;
  }

  strong {
    display: block;
    color: ${colors.textPrimary};
    font-size: 1rem;
  }

  small {
    color: ${colors.textSecondary};
    font-size: 0.85rem;
  }
`;

const Badge = styled.span<{ tone?: 'active' | 'archived' }>`
  display: inline-block;
  padding: 2px 10px;
  border-radius: ${borderRadius.full};
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: ${(props) => (props.tone === 'archived' ? '#eef1f4' : '#d4edda')};
  color: ${(props) => (props.tone === 'archived' ? colors.textSecondary : '#155724')};
`;

const FormGrid = styled.div`
  display: grid;
  gap: ${spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.sm};
`;

const Label = styled.label`
  font-weight: 600;
  color: ${colors.textPrimary};
  font-size: 0.9rem;
`;

const FileInputBox = styled.label`
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.lg};
  border: 2px dashed ${colors.border};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  color: ${colors.textSecondary};
  transition: all ${transitionsFast};

  &:hover {
    border-color: ${colors.primary};
    background: #f0f6ff;
    color: ${colors.primary};
  }

  input {
    display: none;
  }

  strong {
    color: ${colors.textPrimary};
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  padding: ${spacing.md};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: ${spacing.md};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
  }
`;

const Alert = styled.div<{ type: 'success' | 'error' | 'info' }>`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.md};
  margin-bottom: ${spacing.lg};
  font-size: 0.9rem;
  background: ${(props) =>
        props.type === 'success' ? '#d4edda' : props.type === 'error' ? '#f8d7da' : '#e7f3ff'};
  color: ${(props) =>
        props.type === 'success' ? '#155724' : props.type === 'error' ? '#721c24' : '#0b4a7a'};

  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'ghost' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.md};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${transitionsFast};
  border: 1px solid transparent;

  background: ${(props) =>
        props.variant === 'primary'
            ? colors.primary
            : props.variant === 'danger'
                ? '#fff5f5'
                : 'white'};
  color: ${(props) =>
        props.variant === 'primary'
            ? 'white'
            : props.variant === 'danger'
                ? colors.error
                : colors.textPrimary};
  border-color: ${(props) =>
        props.variant === 'primary' ? colors.primary : props.variant === 'danger' ? '#f5c6cb' : colors.border};

  &:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md} ${spacing.lg};
  border-radius: ${borderRadius.md};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${transitionsFast};
  background: white;
  color: ${colors.textPrimary};
  border: 1px solid ${colors.border};
  text-decoration: none;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    text-align: left;
    padding: ${spacing.md};
    border-bottom: 1px solid ${colors.border};
    font-size: 0.9rem;
    vertical-align: middle;
  }

  th {
    color: ${colors.textSecondary};
    text-transform: uppercase;
    font-size: 0.72rem;
    letter-spacing: 0.5px;
  }
`;

const RowActions = styled.div`
  display: flex;
  gap: ${spacing.sm};
  flex-wrap: wrap;
`;

const EmptyState = styled.div`
  color: ${colors.textSecondary};
  font-style: italic;
  padding: ${spacing.lg} 0;
`;

const formatDate = (value?: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleString();
};

const ContractPage: React.FC = () => {
    const {
        templates,
        current,
        isLoading,
        error,
        getTemplates,
        uploadTemplate,
        activateTemplate,
        deleteTemplate,
        getTemplateUrl,
    } = useContract();

    useEffect(() => {
        getTemplates();
    }, [getTemplates]);

    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setStatus({ type: 'error', message: 'Veuillez sélectionner un fichier Word (.docx ou .doc).' });
            return;
        }
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension !== 'docx' && extension !== 'doc') {
            setStatus({ type: 'error', message: 'Seuls les fichiers Word (.docx, .doc) sont acceptés.' });
            return;
        }

        setIsSubmitting(true);
        setStatus(null);
        const result = await uploadTemplate(file, title.trim(), notes.trim());
        setIsSubmitting(false);

        if (result) {
            setStatus({
                type: 'success',
                message: `Version v${result.version} publiée. Les entreprises devront re-signer le nouveau contrat.`,
            });
            setFile(null);
            setTitle('');
            setNotes('');
        } else {
            setStatus({ type: 'error', message: 'Échec de la publication du contrat.' });
        }
    };

    const handleActivate = async (template: ContractTemplate) => {
        if (!window.confirm(`Réactiver la version v${template.version} ? Toutes les entreprises devront re-signer cette version.`)) {
            return;
        }
        const ok = await activateTemplate(template.id);
        setStatus(
            ok
                ? { type: 'success', message: `Version v${template.version} réactivée.` }
                : { type: 'error', message: "Échec de l'activation de la version." }
        );
    };

    const handleDelete = async (template: ContractTemplate) => {
        if (!window.confirm(`Supprimer la version v${template.version} ?`)) {
            return;
        }
        const ok = await deleteTemplate(template.id);
        setStatus(
            ok
                ? { type: 'success', message: `Version v${template.version} supprimée.` }
                : { type: 'error', message: 'Échec de la suppression de la version.' }
        );
    };

    return (
        <ContentSection>
            <PageHeader>
                <h1>Contract</h1>
                <p>
                    Document souche unique du contrat Tikta. Toutes les entreprises le téléchargent, le
                    remplissent, le signent puis le re-uploadent. Publier une nouvelle version marque les
                    contrats existants comme « à re-signer ».
                </p>
            </PageHeader>

            {error && (
                <Alert type="error">
                    <FiAlertCircle size={18} />
                    <span>{error}</span>
                </Alert>
            )}
            {status && (
                <Alert type={status.type}>
                    {status.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
                    <span>{status.message}</span>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <h2>
                        <FiFileText /> Version courante
                    </h2>
                    {current && <Badge>v{current.version}</Badge>}
                </CardHeader>

                {current ? (
                    <CurrentBox>
                        <CurrentInfo>
                            <div className="icon">
                                <FiFileText />
                            </div>
                            <div>
                                <strong>{current.title || `Tikta Contract v${current.version}`}</strong>
                                <small>
                                    Version v{current.version} · publiée le {formatDate(current.created_at)}
                                    {current.uploaded_by_email ? ` par ${current.uploaded_by_email}` : ''}
                                </small>
                            </div>
                        </CurrentInfo>
                        {current.file && (
                            <LinkButton
                                href={getTemplateUrl(current.file)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FiDownload /> Télécharger
                            </LinkButton>
                        )}
                    </CurrentBox>
                ) : (
                    <Alert type="info">
                        <FiAlertCircle size={18} />
                        <span>Aucune souche de contrat publiée. Les entreprises ne peuvent pas créer de business.</span>
                    </Alert>
                )}
            </Card>

            <Card>
                <CardHeader>
                    <h2>
                        <FiUpload /> Publier une nouvelle version
                    </h2>
                </CardHeader>

                <form onSubmit={handleUpload}>
                    <FormGrid>
                        <FormGroup>
                            <Label>Fichier souche (Word) *</Label>
                            <FileInputBox>
                                <input
                                    type="file"
                                    accept=".docx,.doc"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <FiUpload size={22} />
                                <div>
                                    <strong>{file ? file.name : 'Cliquez pour sélectionner un .docx / .doc'}</strong>
                                    <div style={{ fontSize: '0.8rem' }}>Format Word uniquement</div>
                                </div>
                            </FileInputBox>
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="title">Titre (optionnel)</Label>
                            <Input
                                id="title"
                                value={title}
                                placeholder="Ex. Contrat de partenariat Tikta"
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label htmlFor="notes">Notes de version (optionnel)</Label>
                            <TextArea
                                id="notes"
                                value={notes}
                                placeholder="Ce qui a changé dans cette version..."
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </FormGroup>

                        <div>
                            <Button type="submit" variant="primary" disabled={isSubmitting || !file}>
                                {isSubmitting ? <FiRefreshCw /> : <FiUpload />}
                                {isSubmitting ? 'Publication...' : 'Publier la nouvelle version'}
                            </Button>
                        </div>
                    </FormGrid>
                </form>
            </Card>

            <Card>
                <CardHeader>
                    <h2>
                        <FiEdit3 /> Historique des versions
                    </h2>
                </CardHeader>

                {isLoading ? (
                    <EmptyState>Chargement...</EmptyState>
                ) : templates.length === 0 ? (
                    <EmptyState>Aucune version de contrat pour le moment.</EmptyState>
                ) : (
                    <Table>
                        <thead>
                            <tr>
                                <th>Version</th>
                                <th>Titre</th>
                                <th>Statut</th>
                                <th>Publiée le</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map((template) => (
                                <tr key={template.id}>
                                    <td>v{template.version}</td>
                                    <td>{template.title || `Tikta Contract v${template.version}`}</td>
                                    <td>
                                        <Badge tone={template.is_active ? 'active' : 'archived'}>
                                            {template.is_active ? 'Active' : 'Archivée'}
                                        </Badge>
                                    </td>
                                    <td>{formatDate(template.created_at)}</td>
                                    <td>
                                        <RowActions>
                                            {template.file && (
                                                <LinkButton
                                                    href={getTemplateUrl(template.file)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Télécharger"
                                                >
                                                    <FiDownload />
                                                </LinkButton>
                                            )}
                                            {!template.is_active && (
                                                <Button onClick={() => handleActivate(template)}>
                                                    <FiCheckCircle /> Activer
                                                </Button>
                                            )}
                                            <Button variant="danger" onClick={() => handleDelete(template)}>
                                                <FiTrash2 />
                                            </Button>
                                        </RowActions>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card>
        </ContentSection>
    );
};

export default ContractPage;
