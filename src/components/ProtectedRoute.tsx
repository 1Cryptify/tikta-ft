import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

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

        return (
            <div
                style={{
                    width: '100%',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #152d47 100%)',
                }}
            >
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // if (!isAuthenticated) {
    //     return <Navigate to="/login" replace />;
    // }

    return children;
};
function timeout(arg0: () => void, arg1: number) {
    throw new Error('Function not implemented.');
}

