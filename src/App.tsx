import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth, User } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './components/Auth/LoginPage';
import { VerificationPage } from './components/Auth/VerificationPage';
import { RegisterPage } from './components/Auth/RegisterPage';
import { ForgotPasswordPage } from './components/Auth/ForgotPasswordPage';
import { FirstLoginChangePage } from './components/Auth/FirstLoginChangePage';
import { HomePage } from './pages/HomePage';
import { Dashboard } from './pages/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import PaymentRoutes from './config/payment-routes';
import { UserRole } from './config/menuPermissions';
import './styles/global.css';
import './styles/payment.css';
import './styles/pay-page.css';
import './styles/payment-checkout.css';
import './styles/payment-success.css';
import './styles/payment-failed.css';
import './styles/payment-config.css';

// Helper function to map user to UserRole
const getUserRole = (user: User): UserRole => {
    if (user.is_superuser) {
        return UserRole.SUPER_ADMIN;
    }
    if (user.is_staff) {
        return UserRole.STAFF;
    }
    return UserRole.CLIENT;
};

function App() {
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        console.log('Route changed:', {
            pathname: location.pathname,
            isAuthenticated,
            user: user?.email,
            isLoading,
        });
    }, [location.pathname, isAuthenticated, user, isLoading]);

    return (
        <>
            <Routes>
                {/* Home Page - Redirect authenticated users to dashboard */}
                <Route 
                    path="/" 
                    element={
                        isLoading ? (
                            <LoadingSpinner />
                        ) : isAuthenticated ? (
                            <Navigate to="/dashboard" replace />
                        ) : (
                            <HomePage />
                        )
                    } 
                />

                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* Single code entry point for both account creation and login */}
                <Route path="/verify" element={<VerificationPage />} />
                <Route path="/verify-email" element={<VerificationPage />} />
                <Route path="/confirm" element={<VerificationPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route
                    path="/change-password"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                            <FirstLoginChangePage />
                        </ProtectedRoute>
                    }
                />

                {/* Payment Routes - Public */}
                <Route path="/pay/*" element={<PaymentRoutes />} />

                {/* Dashboard Route - Protected */}
                <Route
                    path="/dashboard/*"
                    element={
                        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                            {user ? <Dashboard user={user} onLogout={logout} userRole={getUserRole(user)} /> : null}
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default App;
