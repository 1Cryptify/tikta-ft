import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiUserPlus, FiMail, FiLock, FiUser, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { AuthLayout } from './AuthLayout';
import { colors, spacing, borderRadius } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
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

const StrengthTrack = styled.div`
  height: 5px;
  border-radius: 999px;
  background: ${colors.border};
  overflow: hidden;
  margin-top: 0.15rem;
`;

const StrengthBar = styled.div<{ $pct: number; $tone: string }>`
  height: 100%;
  width: ${p => p.$pct}%;
  background: ${p => p.$tone};
  transition: width 200ms ease, background 200ms ease;
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

const scorePassword = (pwd: string): { pct: number; tone: string; label: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
        { pct: 0, tone: colors.border, label: '' },
        { pct: 25, tone: colors.error, label: 'Faible' },
        { pct: 50, tone: colors.warning, label: 'Moyen' },
        { pct: 75, tone: colors.info, label: 'Bon' },
        { pct: 100, tone: colors.success, label: 'Excellent' },
    ];
    return map[score];
};

export const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const strength = scorePassword(formData.password);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await register({
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
            last_name: formData.last_name,
        });

        setIsLoading(false);

        if (result.success) {
            setSuccess('Account created successfully. Please check your email to verify your account.');
            setTimeout(() => {
                navigate('/verify', { state: { email: formData.email } });
            }, 2000);
        } else {
            setError(result.error || 'Failed to create account');
        }
    };

    return (
        <AuthLayout
            title="Créer un compte"
            subtitle="Rejoignez Tikta et commencez à vendre vos tickets WiFi en quelques minutes."
            footer={
                <BackLink onClick={() => navigate('/login')}>
                    <FiArrowLeft /> Déjà un compte ? Se connecter
                </BackLink>
            }
        >
            {error && <Alert $tone="error" style={{ marginBottom: '1rem' }}>{error}</Alert>}
            {success && <Alert $tone="success" style={{ marginBottom: '1rem' }}>{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Row>
                    <Field>
                        <Label htmlFor="first_name">Prénom</Label>
                        <InputWrap>
                            <FieldIcon><FiUser size={18} /></FieldIcon>
                            <TextInput
                                id="first_name"
                                type="text"
                                name="first_name"
                                placeholder="Jean"
                                value={formData.first_name}
                                onChange={handleChange}
                                disabled={isLoading}
                                autoComplete="given-name"
                            />
                        </InputWrap>
                    </Field>
                    <Field>
                        <Label htmlFor="last_name">Nom</Label>
                        <InputWrap>
                            <FieldIcon><FiUser size={18} /></FieldIcon>
                            <TextInput
                                id="last_name"
                                type="text"
                                name="last_name"
                                placeholder="Dupont"
                                value={formData.last_name}
                                onChange={handleChange}
                                disabled={isLoading}
                                autoComplete="family-name"
                            />
                        </InputWrap>
                    </Field>
                </Row>

                <Field>
                    <Label htmlFor="email">Adresse email</Label>
                    <InputWrap>
                        <FieldIcon><FiMail size={18} /></FieldIcon>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            placeholder="vous@exemple.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                            autoComplete="email"
                        />
                    </InputWrap>
                </Field>

                <Field>
                    <Label htmlFor="password">Mot de passe</Label>
                    <InputWrap>
                        <FieldIcon><FiLock size={18} /></FieldIcon>
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Au moins 8 caractères"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                            autoComplete="new-password"
                        />
                        <ToggleBtn
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? 'Masquer' : 'Afficher'}
                        >
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </ToggleBtn>
                    </InputWrap>
                    {formData.password && (
                        <StrengthTrack>
                            <StrengthBar $pct={strength.pct} $tone={strength.tone} />
                        </StrengthTrack>
                    )}
                </Field>

                <Field>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <InputWrap>
                        <FieldIcon><FiLock size={18} /></FieldIcon>
                        <TextInput
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Répétez le mot de passe"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                            autoComplete="new-password"
                        />
                    </InputWrap>
                </Field>

                <SubmitButton type="submit" disabled={isLoading}>
                    <FiUserPlus /> {isLoading ? 'Création...' : 'Créer mon compte'}
                </SubmitButton>
            </Form>
        </AuthLayout>
    );
};

export default RegisterPage;
