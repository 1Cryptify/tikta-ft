import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiMail, FiArrowLeft, FiSend, FiCheckCircle } from 'react-icons/fi';
import { AuthLayout } from './AuthLayout';
import { colors, borderRadius } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

const InputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const FieldIcon = styled.span`
  position: absolute;
  left: 0.9rem;
  color: ${colors.textSecondary};
  display: flex;
  pointer-events: none;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.6rem;
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  font-size: 0.95rem;
  color: ${colors.textPrimary};
  background: ${colors.surface};
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.7;
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.12);
  }

  &:disabled {
    background: #f5f6f8;
    cursor: not-allowed;
  }
`;

const Alert = styled.div<{ $tone: 'error' | 'success' }>`
  padding: 0.85rem 1rem;
  border-radius: ${borderRadius.md};
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.5;
  background: ${p => (p.$tone === 'error' ? '#fef2f2' : '#ecfdf5')};
  color: ${p => (p.$tone === 'error' ? colors.error : colors.success)};
  border: 1px solid ${p => (p.$tone === 'error' ? '#fecaca' : '#a7f3d0')};
`;

const SuccessPanel = styled.div`
  text-align: center;
  padding: 0.5rem 0;

  svg {
    color: ${colors.success};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.9rem;
  background: linear-gradient(135deg, ${colors.primaryLight}, ${colors.primary});
  color: #fff;
  border: none;
  border-radius: ${borderRadius.md};
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease, opacity 150ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 20px rgba(30, 58, 95, 0.25);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

export const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Veuillez saisir une adresse email valide');
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await forgotPassword(email);

        setIsLoading(false);

        if (result.success) {
            setSuccess('Un mot de passe temporaire vous a été envoyé par email. Connectez-vous avec celui-ci, vous serez invité à le changer.');
        } else {
            setError(result.error || "Échec de l'envoi de l'email");
        }
    };

    return (
        <AuthLayout
            title="Mot de passe oublié"
            subtitle="Saisissez votre email et nous vous enverrons un mot de passe temporaire."
            footer={
                <BackLink onClick={() => navigate('/login')}>
                    <FiArrowLeft /> Retour à la connexion
                </BackLink>
            }
        >
            {success ? (
                <SuccessPanel>
                    <FiCheckCircle size={40} />
                    <Alert $tone="success" style={{ marginTop: '1rem', textAlign: 'left' }}>{success}</Alert>
                </SuccessPanel>
            ) : (
                <Form onSubmit={handleSubmit}>
                    {error && <Alert $tone="error">{error}</Alert>}

                    <Field>
                        <Label htmlFor="reset-email">Adresse email</Label>
                        <InputWrap>
                            <FieldIcon><FiMail size={18} /></FieldIcon>
                            <TextInput
                                id="reset-email"
                                type="email"
                                placeholder="vous@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                                autoComplete="email"
                            />
                        </InputWrap>
                    </Field>

                    <SubmitButton type="submit" disabled={isLoading}>
                        <FiSend /> {isLoading ? 'Envoi...' : 'Envoyer'}
                    </SubmitButton>
                </Form>
            )}
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
