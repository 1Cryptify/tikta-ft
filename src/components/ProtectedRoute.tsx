import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
    isAuthenticated: boolean;
    isLoading: boolean;
    children: ReactNode;
}

export const ProtectedRoute = ({
    isAuthenticated,
    isLoading,
    children,
}: ProtectedRouteProps) => {
    if (isLoading) {
        return <LoadingSpinner fullScreen message="Chargement en cours..." size="large" />;
    }

    // if (!isAuthenticated) {
    //     return <Navigate to="/login" replace />;
    // }

    return children;
};

