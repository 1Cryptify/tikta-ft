import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
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
  margin-bottom: ${spacing.xl};

  h2 {
    font-size: 1.5rem;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.sm};
  }

  p {
    color: ${colors.textSecondary};
    font-size: 0.875rem;
    line-height: 1.5;
  }
`;

const CodeInputContainer = styled.div`
  display: flex;
  gap: ${spacing.md};
  margin: ${spacing.xl} 0;
  justify-content: center;
`;

const CodeInput = styled.input`
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border: 2px solid ${colors.border};
  border-radius: ${borderRadius.md};
  transition: all 150ms ease-in-out;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
  }

  &:disabled {
    background-color: #f3f4f6;
    color: ${colors.disabled};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
  margin-top: ${spacing.xl};
`;

const ResendContainer = styled.div`
  text-align: center;
  margin-top: ${spacing.lg};
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: ${colors.primary};
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: underline;
  transition: color 150ms ease-in-out;

  &:hover {
    color: ${colors.primaryDark};
  }

  &:disabled {
    color: ${colors.disabled};
    cursor: not-allowed;
  }
`;

const Timer = styled.span`
  color: ${colors.textSecondary};
  font-size: 0.875rem;
  font-weight: 500;
`;

const ErrorAlert = styled.div`
  padding: ${spacing.md} ${spacing.lg};
  background-color: #fee;
  border: 1px solid ${colors.error};
  border-radius: ${borderRadius.md};
  color: ${colors.error};
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: ${spacing.lg};
`;

const CodeError = styled.span`
  color: ${colors.error};
  font-size: 0.75rem;
  display: block;
  text-align: center;
  margin-top: ${spacing.sm};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${colors.textSecondary};
  cursor: pointer;
  font-size: 0.875rem;
  padding: ${spacing.sm};
  margin: -${spacing.sm} -${spacing.sm} 0 -${spacing.sm};
  transition: color 150ms ease-in-out;

  &:hover {
    color: ${colors.primary};
  }
`;

interface ConfirmationPageProps {
    email: string;
    onSuccess?: () => void;
    onBack?: () => void;
}

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
    email: propEmail,
    onSuccess,
    onBack,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [codeError, setCodeError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [codeError2, setCodeError2] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { isLoading, error, confirmLogin, resendCode, isAuthenticated } = useAuth();

    // Get email from location state or props
    const email = (location.state?.email as string) || propEmail;

    // Redirect if already authenticated
    useEffect(() => {
      if (isAuthenticated) {
        console.log('ConfirmationPage: User already authenticated, redirecting to dashboard');
        navigate('/dashboard/overview', { replace: true });
      }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
      console.log('ConfirmationPage mount:', { email, propEmail, locationState: location.state });
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleCodeChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setCodeError('');
        setCodeError2('');

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      const codeString = code.join('');
      if (codeString.length !== 6) {
        setCodeError('Please enter all 6 digits');
        return;
      }

      console.log('ConfirmationPage handleSubmit:', { email, code: codeString });
      const result = await confirmLogin(email, codeString);
      console.log('ConfirmationPage confirmLogin result:', result);

      if (!result.success) {
        setCodeError2(result.error || 'Confirmation failed');
      } else {
        console.log('Confirmation success, navigating to /dashboard/overview');
        onSuccess?.();
        navigate('/dashboard/overview');
      }
    };

    const handleResend = async () => {
        const result = await resendCode(email);
        if (result.success) {
            setResendTimer(60);
            setCode(['', '', '', '', '', '']);
            setCodeError('');
            setCodeError2('');
        }
    };

    return (
        <Container>
            <Card>
                <BackButton onClick={() => navigate(-1)}>← Back</BackButton>

                <Header>
                    <h2>Verify Your Identity</h2>
                    <p>Enter the 6-digit code sent to {email}</p>
                </Header>

                <form onSubmit={handleSubmit}>
                    {codeError2 && <ErrorAlert>{codeError2}</ErrorAlert>}

                    <CodeInputContainer>
                        {code.map((digit, index) => (
                            <CodeInput
                                key={index}
                                ref={el => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleCodeChange(index, e.target.value)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                disabled={isLoading}
                            />
                        ))}
                    </CodeInputContainer>

                    {codeError && <CodeError>{codeError}</CodeError>}

                    <ActionButtons>
                        <Button
                            type="submit"
                            fullWidth
                            loading={isLoading}
                            size="lg"
                        >
                            Confirm
                        </Button>
                    </ActionButtons>
                </form>

                <ResendContainer>
                    {resendTimer > 0 ? (
                        <Timer>Resend code in {resendTimer}s</Timer>
                    ) : (
                        <>
                            <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                                Didn't receive the code?{' '}
                            </span>
                            <ResendButton onClick={handleResend} disabled={isLoading || resendTimer > 0}>
                                Resend
                            </ResendButton>
                        </>
                    )}
                </ResendContainer>
            </Card>
        </Container>
    );
};
