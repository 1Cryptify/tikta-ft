import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/Auth/LoginPage';
import { ConfirmationPage } from './components/Auth/ConfirmationPage';
import { UserDashboard } from './pages/UserDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import './styles/global.css';

type AuthStep = 'login' | 'confirmation' | 'authenticated';

function App() {
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [userEmail, setUserEmail] = useState('');
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // Check if user is already authenticated (session exists)
    if (isAuthenticated && user) {
      setAuthStep('authenticated');
    }
  }, [isAuthenticated, user]);

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

  // Dashboard based on user role
  if (authStep === 'authenticated' && user) {
    if (user.is_superuser) {
      return (
        <SuperAdminDashboard user={user} onLogout={handleLogout} />
      );
    }

    if (user.is_staff) {
      return <StaffDashboard user={user} onLogout={handleLogout} />;
    }

    return <UserDashboard user={user} onLogout={handleLogout} />;
  }

  // Fallback to login
  return <LoginPage onSuccess={handleLoginSuccess} />;
}

export default App;
