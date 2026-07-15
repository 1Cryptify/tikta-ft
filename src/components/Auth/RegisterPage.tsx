import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiUserPlus, FiMail, FiLock, FiUser, FiArrowLeft } from 'react-icons/fi';
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

const BackLink = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1.5rem auto 0;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
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
                navigate('/verify-email', { state: { email: formData.email } });
            }, 2000);
        } else {
            setError(result.error || 'Failed to create account');
        }
    };

    return (
        <Container>
            <Card>
                <Header>
                    <Title>Create Account</Title>
                    <Subtitle>Join Tikta to manage your business</Subtitle>
                </Header>

                {error && <ErrorMessage>{error}</ErrorMessage>}
                {success && <SuccessMessage>{success}</SuccessMessage>}

                <Form onSubmit={handleSubmit}>
                    <InputGroup>
                        <InputIcon><FiUser /></InputIcon>
                        <Input
                            type="text"
                            name="first_name"
                            placeholder="First name"
                            value={formData.first_name}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </InputGroup>

                    <InputGroup>
                        <InputIcon><FiUser /></InputIcon>
                        <Input
                            type="text"
                            name="last_name"
                            placeholder="Last name"
                            value={formData.last_name}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </InputGroup>

                    <InputGroup>
                        <InputIcon><FiMail /></InputIcon>
                        <Input
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                    </InputGroup>

                    <InputGroup>
                        <InputIcon><FiLock /></InputIcon>
                        <Input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
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
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={isLoading}
                            required
                        />
                    </InputGroup>

                    <SubmitButton type="submit" disabled={isLoading}>
                        <FiUserPlus /> {isLoading ? 'Creating account...' : 'Create Account'}
                    </SubmitButton>
                </Form>

                <BackLink onClick={() => navigate('/')}>
                    <FiArrowLeft /> Back to home
                </BackLink>
            </Card>
        </Container>
    );
};

export default RegisterPage;
