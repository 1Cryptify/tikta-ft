import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/Auth/LoginPage';
import { ConfirmationPage } from './components/Auth/ConfirmationPage';
import { Dashboard } from './pages/Dashboard';
import './styles/global.css';

type AuthStep = 'login' | 'confirmation' | 'authenticated' | 'checking';

function App() {
    const [authStep, setAuthStep] = useState<AuthStep>('checking');
    const [userEmail, setUserEmail] = useState('');
    const { user, isAuthenticated, logout, getCurrentUser, isLoading } = useAuth();

    useEffect(() => {
        // Check if user is already authenticated on mount
        const verifyAuth = async () => {
            try {
                await getCurrentUser();
            } catch (error) {
                // User is not authenticated
                setAuthStep('login');
            }
        };

        verifyAuth();
    }, [getCurrentUser]);

    useEffect(() => {
        // Update auth step if user becomes authenticated
        if (isAuthenticated && user && authStep !== 'authenticated') {
            setAuthStep('authenticated');
        }
    }, [isAuthenticated, user, authStep]);

    const handleLoginSuccess = (email: string) => {
        setUserEmail(email);
        setAuthStep('confirmation');
    };

    const handleConfirmationSuccess = () => {
        setAuthStep('authenticated');
    };

    const handleLogout = async () => {
        await logout();
        setAuthStep('login');
        setUserEmail('');
    };

    const handleBackToLogin = () => {
        setAuthStep('login');
        setUserEmail('');
    };

    // Checking authentication
    if (authStep === 'checking' || isLoading) {
        return (
            <div style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1e3a5f 0%, #152d47 100%)',
            }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Login Step 1
    if (authStep === 'login') {
        return <LoginPage onSuccess={handleLoginSuccess} />;
    }

    // Login Step 2: Two-Factor Authentication
    if (authStep === 'confirmation') {
        return (
            <ConfirmationPage
                email={userEmail}
                onSuccess={handleConfirmationSuccess}
                onBack={handleBackToLogin}
            />
        );
    }

    // Dashboard
    if (authStep === 'authenticated' && user) {
        return <Dashboard user={user} onLogout={handleLogout} />;
    }

    // Fallback to login
    return <LoginPage onSuccess={handleLoginSuccess} />;
}

export default App;
