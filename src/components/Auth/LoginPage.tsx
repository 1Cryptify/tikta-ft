import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
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

const TextInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.6rem;
  border: 1px solid ${p => (p.$hasError ? colors.error : colors.border)};
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

const ToggleBtn = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: ${colors.textSecondary};
  cursor: pointer;
  display: flex;
  padding: 0.25rem;

  &:hover {
    color: ${colors.primary};
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

const LinkRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  margin-top: 0.25rem;
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
`;

interface LoginPageProps {
    onSuccess?: (email: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { isLoading, error, login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard/overview', { replace: true });
    }
  }, [isAuthenticated, navigate]);

    const validateForm = () => {
        setEmailError('');
        setPasswordError('');
        let isValid = true;

        if (!email) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        }

        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      const result = await login(email, password);

      if (result.success) {
        // Email verified within the trust window: logged in directly.
        navigate('/dashboard/overview', { replace: true });
        return;
      }

      if (result.requiresVerification || result.notVerified) {
        setSuccessMessage(result.error || 'A verification code was sent to your email.');
        setPassword('');
        setTimeout(() => {
          onSuccess?.(email);
          navigate('/verify', { state: { email } });
        }, 1200);
      }
    };

    return (
        <AuthLayout
          title="Bon retour"
          subtitle="Connectez-vous pour accéder à votre tableau de bord Tikta."
          footer={
            <LinkRow>
              <TextLink onClick={() => navigate('/register')} type="button">
                Créer un compte
              </TextLink>
              <TextLink onClick={() => navigate('/forgot-password')} type="button">
                Mot de passe oublié ?
              </TextLink>
            </LinkRow>
          }
        >
          <Form onSubmit={handleSubmit}>
            {error && !successMessage && <Alert $tone="error">{error}</Alert>}
            {successMessage && <Alert $tone="success">{successMessage}</Alert>}

            <Field>
              <Label htmlFor="email">Adresse email</Label>
              <InputWrap>
                <FieldIcon><FiMail size={18} /></FieldIcon>
                <TextInput
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoading}
                  $hasError={!!emailError}
                  autoComplete="email"
                />
              </InputWrap>
              {emailError && <FieldError>{emailError}</FieldError>}
            </Field>

            <Field>
              <Label htmlFor="password">Mot de passe</Label>
              <InputWrap>
                <FieldIcon><FiLock size={18} /></FieldIcon>
                <TextInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoading}
                  $hasError={!!passwordError}
                  autoComplete="current-password"
                />
                <ToggleBtn
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </ToggleBtn>
              </InputWrap>
              {passwordError && <FieldError>{passwordError}</FieldError>}
            </Field>

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              size="lg"
            >
              Se connecter
            </Button>
          </Form>
        </AuthLayout>
    );
};

export default LoginPage;
