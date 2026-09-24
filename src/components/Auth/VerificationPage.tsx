import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiShield, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { AuthLayout } from './AuthLayout';
import { Button } from '../Form/Button';
import { colors, spacing, borderRadius } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';

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

const TextInput = styled.input<{ $hasError?: boolean; $code?: boolean }>`
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.6rem;
  border: 1px solid ${p => (p.$hasError ? colors.error : colors.border)};
  border-radius: ${borderRadius.md};
  font-size: ${p => (p.$code ? '1.25rem' : '0.95rem')};
  font-weight: ${p => (p.$code ? 700 : 400)};
  letter-spacing: ${p => (p.$code ? '0.5rem' : 'normal')};
  text-align: ${p => (p.$code ? 'center' : 'left')};
  color: ${colors.textPrimary};
  background: ${colors.surface};
  transition: border-color 150ms ease, box-shadow 150ms ease;

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.7;
    letter-spacing: normal;
    font-weight: 400;
    font-size: 0.95rem;
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

const FieldError = styled.span`
  font-size: 0.75rem;
  color: ${colors.error};
`;

const Alert = styled.div<{ $tone: 'error' | 'success' }>`
  padding: 0.8rem 1rem;
  border-radius: ${borderRadius.md};
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.45;
  background: ${p => (p.$tone === 'error' ? '#fef2f2' : '#ecfdf5')};
  color: ${p => (p.$tone === 'error' ? colors.error : colors.success)};
  border: 1px solid ${p => (p.$tone === 'error' ? '#fecaca' : '#a7f3d0')};
`;

const ResendRow = styled.div`
  text-align: center;
  font-size: 0.85rem;
  color: ${colors.textSecondary};
`;

const TextLink = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  cursor: pointer;
  padding: 0;
  font-size: 0.85rem;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }

  &:disabled {
    color: ${colors.textSecondary};
    cursor: not-allowed;
    text-decoration: none;
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

export const VerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { confirmLogin, resendCode } = useAuth();

    const stateEmail = (location.state as { email?: string } | null)?.email || '';
    const [email, setEmail] = useState(stateEmail);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [resendMessage, setResendMessage] = useState('');

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setEmailError('Email is required');
            return;
        }

        if (!code.trim()) {
            setError('Please enter the verification code');
            return;
        }

        setIsLoading(true);
        const result = await confirmLogin(email.trim().toLowerCase(), code.trim());
        setIsLoading(false);

        if (!result.success) {
            setError(result.error || 'Confirmation failed');
            return;
        }

        if (result.mustChangePassword) {
            navigate('/change-password', { replace: true });
        } else {
            navigate('/dashboard/overview', { replace: true });
        }
    };

    const handleResend = async () => {
        if (!email) {
            setEmailError('Email is required');
            return;
        }

        setError('');
        setResendMessage('');
        const result = await resendCode(email.trim().toLowerCase());
        if (result.success) {
            setResendTimer(60);
            setCode('');
            setResendMessage('A new code has been sent to your email.');
        } else {
            setError(result.error || 'Failed to resend code');
        }
    };

    return (
        <AuthLayout
          title="Vérification"
          subtitle={`Entrez le code à 6 chiffres envoyé à ${email || 'votre adresse email'}.`}
          footer={
            <BackLink onClick={() => navigate('/login')} type="button">
              <FiArrowLeft /> Retour à la connexion
            </BackLink>
          }
        >
          <Form onSubmit={handleSubmit}>
            {error && <Alert $tone="error">{error}</Alert>}
            {resendMessage && <Alert $tone="success">{resendMessage}</Alert>}

            {!stateEmail && (
              <Field>
                <Label htmlFor="email">Adresse email</Label>
                <InputWrap>
                  <FieldIcon><FiMail size={18} /></FieldIcon>
                  <TextInput
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                    disabled={isLoading}
                    $hasError={!!emailError}
                    autoComplete="email"
                  />
                </InputWrap>
                {emailError && <FieldError>{emailError}</FieldError>}
              </Field>
            )}

            <Field>
              <Label htmlFor="code">Code de vérification</Label>
              <InputWrap>
                <FieldIcon><FiShield size={18} /></FieldIcon>
                <TextInput
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={isLoading}
                  autoComplete="one-time-code"
                  $code
                  autoFocus
                />
              </InputWrap>
            </Field>

            <Button type="submit" fullWidth loading={isLoading} size="lg">
              <FiCheckCircle style={{ marginRight: '0.5rem' }} /> Confirmer
            </Button>

            <ResendRow>
              {resendTimer > 0 ? (
                <span>Renvoyer le code dans {resendTimer}s</span>
              ) : (
                <>
                  <span>Vous n'avez pas reçu le code ? </span>
                  <TextLink type="button" onClick={handleResend} disabled={isLoading}>
                    Renvoyer
                  </TextLink>
                </>
              )}
            </ResendRow>
          </Form>
        </AuthLayout>
    );
};

export default VerificationPage;
