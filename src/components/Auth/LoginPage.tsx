import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Input } from '../Form/Input';
import { Button } from '../Form/Button';
import { colors, spacing, borderRadius, shadows } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
`;

const Card = styled.div`
  background: ${colors.surface};
  padding: ${spacing.xxl};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.lg};
  width: 100%;
  max-width: 400px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${spacing.xxl};

  h1 {
    font-size: 1.75rem;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.sm};
  }

  p {
    color: ${colors.textSecondary};
    font-size: 0.875rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
`;

const ErrorAlert = styled.div`
  padding: ${spacing.md} ${spacing.lg};
  background-color: #fee;
  border: 1px solid ${colors.error};
  border-radius: ${borderRadius.md};
  color: ${colors.error};
  font-size: 0.875rem;
  font-weight: 500;
`;

const SuccessAlert = styled.div`
  padding: ${spacing.md} ${spacing.lg};
  background-color: #efe;
  border: 1px solid ${colors.success};
  border-radius: ${borderRadius.md};
  color: ${colors.success};
  font-size: 0.875rem;
  font-weight: 500;
`;

const Footer = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: ${colors.textSecondary};
`;

interface LoginPageProps {
    onSuccess?: (email: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const { isLoading, error, login } = useAuth();
    const [successMessage, setSuccessMessage] = useState('');

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
            setSuccessMessage('Confirmation code sent to your email. Please check your inbox.');
            setPassword('');
            setTimeout(() => {
                onSuccess?.(email);
                navigate('/confirm', { state: { email } });
            }, 1500);
        }
    };

    return (
        <Container>
            <Card>
                <Header>
                    <h1>Tikta</h1>
                    <p>Payment Management Platform</p>
                </Header>

                <Form onSubmit={handleSubmit}>
                    {error && <ErrorAlert>{error}</ErrorAlert>}
                    {successMessage && <SuccessAlert>{successMessage}</SuccessAlert>}

                    <Input
                        id="email"
                        label="Email Address"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        error={emailError}
                        disabled={isLoading}
                    />

                    <div style={{ position: 'relative' }}>
                        <Input
                            id="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            error={passwordError}
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '33px',
                                background: 'none',
                                border: 'none',
                                color: colors.textSecondary,
                                cursor: 'pointer',
                                padding: 0,
                            }}
                            title={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? '[–]' : '[o]'}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        fullWidth
                        loading={isLoading}
                        size="lg"
                    >
                        Sign In
                    </Button>
                </Form>

                <Footer>
                    © 2024 Tikta. All rights reserved.
                </Footer>
            </Card>
        </Container>
    );
};
