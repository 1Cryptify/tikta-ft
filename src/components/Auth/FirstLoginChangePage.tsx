import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiLock, FiShield, FiCheckCircle } from 'react-icons/fi';
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
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #007bff;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
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

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
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
`;

const SuccessMessage = styled.div`
  padding: 0.9rem;
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
  border-radius: 4px;
  font-size: 0.9rem;
`;

export const FirstLoginChangePage: React.FC = () => {
    const navigate = useNavigate();
    const { firstLoginChangePassword } = useAuth();
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await firstLoginChangePassword(formData.newPassword);

        setIsLoading(false);

        if (result.success) {
            setSuccess('Password updated successfully. Redirecting to dashboard...');
            setTimeout(() => navigate('/dashboard/overview', { replace: true }), 1200);
        } else {
            setError(result.error || 'Failed to change password');
        }
    };

    return (
        <Container>
            <Card>
                <Header>
                    <IconWrapper>
                        <FiShield size={32} />
                    </IconWrapper>
                    <Title>Change Password</Title>
                    <Subtitle>For security reasons, please set a new password before continuing.</Subtitle>
                </Header>

                {error && <ErrorMessage>{error}</ErrorMessage>}
                {success && <SuccessMessage>{success}</SuccessMessage>}

                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <InputIcon><FiLock /></InputIcon>
                        <Input
                            type="password"
                            name="newPassword"
                            placeholder="New password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                    </InputGroup>

                    <InputGroup>
                        <InputIcon><FiLock /></InputIcon>
                        <Input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                    </InputGroup>

                    <SubmitButton type="submit" disabled={isLoading}>
                        <FiCheckCircle /> {isLoading ? 'Updating...' : 'Update Password'}
                    </SubmitButton>
                </Form>
            </Card>
        </Container>
    );
};

export default FirstLoginChangePage;
