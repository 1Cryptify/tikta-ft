import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiArrowLeft, FiCopy, FiCheckCircle, FiAlertCircle, FiShield, FiClock } from 'react-icons/fi';
import { AuthLayout } from '../components/Auth/AuthLayout';
import { Button } from '../components/Form/Button';
import { colors, spacing, borderRadius } from '../config/theme';
import { paymentService } from '../services/paymentService';
import { getCanvasFingerprint } from '../utils/fingerprint';

interface RecoveredTicket {
    ticket_id: string;
    password: string;
    offer_name?: string;
    valid_from?: string;
    valid_until?: string;
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.label`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${colors.textPrimary};
`;

const InputWrap = styled.div<{ $hasError?: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 1rem;
  border: 1px solid ${p => (p.$hasError ? colors.error : colors.border)};
  border-radius: ${borderRadius.md};
  background: ${p => (p.$disabled ? '#f5f6f8' : colors.surface)};
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &:focus-within {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12);
  }
`;

const FieldIcon = styled.span`
  color: ${colors.textSecondary};
  display: flex;
  flex: 0 0 auto;
  pointer-events: none;
`;

const TextInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0.8rem 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  color: ${colors.textPrimary};
  text-transform: uppercase;

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.7;
    text-transform: none;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const Alert = styled.div<{ $tone: 'error' | 'success' }>`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border-radius: ${borderRadius.md};
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.45;
  background: ${p => (p.$tone === 'error' ? '#fef2f2' : '#ecfdf5')};
  color: ${p => (p.$tone === 'error' ? colors.error : colors.success)};
  border: 1px solid ${p => (p.$tone === 'error' ? '#fecaca' : '#a7f3d0')};
`;

const TicketCard = styled.div`
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.lg};
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const TicketRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
`;

const TicketLabel = styled.span`
  color: ${colors.textSecondary};
  font-weight: 500;
`;

const TicketValue = styled.span`
  font-weight: 700;
  color: ${colors.textPrimary};
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  letter-spacing: 0.03em;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const CopyBtn = styled.button`
  background: none;
  border: none;
  color: ${colors.textSecondary};
  cursor: pointer;
  display: flex;
  padding: 0.15rem;

  &:hover {
    color: ${colors.primary};
  }
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  font-size: 0.85rem;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

export const RecoverTicketPage: React.FC = () => {
    const navigate = useNavigate();
    const [reference, setReference] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [tickets, setTickets] = useState<RecoveredTicket[]>([]);
    const [retryIn, setRetryIn] = useState(0);
    const [copied, setCopied] = useState('');

    useEffect(() => {
        if (retryIn > 0) {
            const timer = setTimeout(() => setRetryIn(retryIn - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [retryIn]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const value = reference.trim();
        if (!value) {
            setError('Veuillez saisir votre identifiant de transaction.');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');
        setTickets([]);

        try {
            const fingerprint = getCanvasFingerprint();
            const result: any = await paymentService.recoverTicket(value, fingerprint);

            if (result?.status === 'success') {
                setTickets(result.tickets || []);
                setMessage(result.message || 'Ticket(s) retrouvé(s).');
            } else if (result?.status === 'pending') {
                setMessage(result.message || 'Paiement en cours de traitement.');
            } else if (result?.status === 'rate_limited') {
                setError(result.message || 'Trop de tentatives.');
                setRetryIn(result.retryAfter || 60);
            } else {
                setError(result?.message || 'Aucun ticket trouvé pour cet identifiant.');
            }
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const copy = (value: string, key: string) => {
        navigator.clipboard?.writeText(value).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(''), 1500);
        });
    };

    return (
        <AuthLayout
          title="Récupérer mon ticket"
          subtitle="Saisissez l'identifiant de transaction reçu par SMS (opérateur Mobile Money) pour retrouver votre ticket WiFi."
          brandHeadline="Un ticket égaré ? Retrouvez-le en quelques secondes."
          brandLede="Saisissez l'identifiant de transaction reçu par SMS Mobile Money pour réafficher vos identifiants WiFi, même si vous avez fermé la page après le paiement."
          brandFeatures={[
            <><FiSearch size={18} /> Recherche par identifiant de transaction</>,
            <><FiCheckCircle size={18} /> Identifiant et mot de passe réaffichés aussitôt</>,
            <><FiClock size={18} /> Fonctionne même après un paiement interrompu</>,
            <><FiShield size={18} /> Accès sécurisé, protégé contre les abus</>,
          ]}
          footer={
            <BackLink onClick={() => navigate('/login')} type="button">
              <FiArrowLeft /> Retour à la connexion
            </BackLink>
          }
        >
          <Form onSubmit={handleSubmit}>
            {error && (
              <Alert $tone="error">
                <FiAlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  {error}
                  {retryIn > 0 ? ` Réessayez dans ${retryIn}s.` : ''}
                </span>
              </Alert>
            )}
            {message && !error && (
              <Alert $tone="success">
                <FiCheckCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{message}</span>
              </Alert>
            )}

            <Field>
              <Label htmlFor="reference">Identifiant de transaction</Label>
              <InputWrap $hasError={!!error} $disabled={isLoading || retryIn > 0}>
                <FieldIcon><FiSearch size={18} /></FieldIcon>
                <TextInput
                  id="reference"
                  type="text"
                  placeholder="ex. MP260924.2005.A80535"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  disabled={isLoading || retryIn > 0}
                  autoFocus
                />
              </InputWrap>
            </Field>

            <Button type="submit" fullWidth loading={isLoading} size="lg" disabled={retryIn > 0}>
              Retrouver mon ticket
            </Button>

            {tickets.map((t, i) => (
              <TicketCard key={`${t.ticket_id}-${i}`}>
                {t.offer_name && (
                  <TicketRow>
                    <TicketLabel>Offre</TicketLabel>
                    <TicketValue>{t.offer_name}</TicketValue>
                  </TicketRow>
                )}
                <TicketRow>
                  <TicketLabel>Identifiant</TicketLabel>
                  <TicketValue>
                    {t.ticket_id}
                    <CopyBtn type="button" title="Copier" onClick={() => copy(t.ticket_id, `id-${i}`)}>
                      {copied === `id-${i}` ? <FiCheckCircle color={colors.success} /> : <FiCopy />}
                    </CopyBtn>
                  </TicketValue>
                </TicketRow>
                <TicketRow>
                  <TicketLabel>Mot de passe</TicketLabel>
                  <TicketValue>
                    {t.password}
                    <CopyBtn type="button" title="Copier" onClick={() => copy(t.password, `pw-${i}`)}>
                      {copied === `pw-${i}` ? <FiCheckCircle color={colors.success} /> : <FiCopy />}
                    </CopyBtn>
                  </TicketValue>
                </TicketRow>
                {(t.valid_from || t.valid_until) && (
                  <TicketRow>
                    <TicketLabel>Validité</TicketLabel>
                    <TicketValue>{t.valid_from}{t.valid_until ? ` → ${t.valid_until}` : ''}</TicketValue>
                  </TicketRow>
                )}
              </TicketCard>
            ))}
          </Form>
        </AuthLayout>
    );
};

export default RecoverTicketPage;
