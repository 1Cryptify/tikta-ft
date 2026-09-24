import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';


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
    const location = useLocation();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
};
