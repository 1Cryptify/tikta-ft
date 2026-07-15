import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiMail, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
  padding: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: #007bff;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0 0 1.5rem 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: left;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
  letter-spacing: 0.2rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 0.9rem;
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: left;
`;

const SuccessMessage = styled.div`
  padding: 0.9rem;
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: left;
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 1rem;

  &:hover {
    text-decoration: underline;
  }
`;

export const EmailVerificationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyEmail } = useAuth();
    const [email, setEmail] = useState<string>((location.state as any)?.email || '');
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !code) {
            setError('Please enter your email and verification code');
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await verifyEmail(email, code);

        setIsLoading(false);

        if (result.success) {
            setSuccess('Email verified successfully. Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(result.error || 'Verification failed');
        }
    };

    return (
        <Container>
            <Card>
                <IconWrapper>
                    <FiMail size={32} />
                </IconWrapper>

                <Title>Verify Your Email</Title>
                <Subtitle>
                    Enter the verification code sent to your email address.
                </Subtitle>

                {error && <ErrorMessage>{error}</ErrorMessage>}
                {success && <SuccessMessage>{success}</SuccessMessage>}

                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            disabled={isLoading}
                            required
                            style={{ textAlign: 'left', letterSpacing: 'normal' }}
                        />
                    </InputGroup>

                    <InputGroup>
                        <Label htmlFor="code">Verification Code</Label>
                        <Input
                            id="code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="123456"
                            disabled={isLoading}
                            required
                        />
                    </InputGroup>

                    <SubmitButton type="submit" disabled={isLoading}>
                        <FiCheckCircle /> {isLoading ? 'Verifying...' : 'Verify Email'}
                    </SubmitButton>
                </Form>

                <LinkButton onClick={() => navigate('/login')}>
                    Already verified? <FiArrowRight style={{ verticalAlign: 'middle' }} /> Login
                </LinkButton>
            </Card>
        </Container>
    );
};

export default EmailVerificationPage;
