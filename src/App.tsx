import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './components/Auth/LoginPage';
import { ConfirmationPage } from './components/Auth/ConfirmationPage';
import { Dashboard } from './pages/Dashboard';
import { DebugInfo } from './components/DebugInfo';
import './styles/global.css';

function App() {
    const { user, isAuthenticated, logout, getCurrentUser, isLoading } = useAuth();
    const location = useLocation();

    // Check if user is already authenticated on mount
    useEffect(() => {
        getCurrentUser().catch(() => {
            // User is not authenticated
        });
    }, [getCurrentUser]);

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
            <DebugInfo />
            <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/confirm" element={<ConfirmationPage email="" onSuccess={() => { }} onBack={() => { }} />} />

            {/* Dashboard Route - Protected */}
            <Route
                path="/dashboard/*"
                element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
                        {user ? <Dashboard user={user} onLogout={logout} /> : null}
                    </ProtectedRoute>
                }
            />

            {/* Root redirect */}
            <Route
                path="/"
                element={
                    <Navigate
                        to={isAuthenticated ? '/dashboard/overview' : '/login'}
                        replace
                    />
                }
            />

            {/* Catch-all redirect */}
            <Route
                path="*"
                element={
                    <Navigate
                        to={isAuthenticated ? '/dashboard/overview' : '/login'}
                        replace
                    />
                }
            />
            </Routes>
        </>
    );
}

export default App;
