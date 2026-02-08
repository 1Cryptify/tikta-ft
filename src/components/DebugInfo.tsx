import { useAuth } from '../hooks/useAuth';

export const DebugInfo = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                padding: '10px 15px',
                borderRadius: '5px',
                fontSize: '12px',
                fontFamily: 'monospace',
                zIndex: 9999,
                maxWidth: '300px',
                wordWrap: 'break-word',
            }}
        >
            <div>isAuthenticated: {String(isAuthenticated)}</div>
            <div>isLoading: {String(isLoading)}</div>
            <div>user.email: {user?.email || 'null'}</div>
            <div>user.id: {user?.id || 'null'}</div>
        </div>
    );
};
