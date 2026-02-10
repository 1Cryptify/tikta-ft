import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
    fullScreen?: boolean;
    message?: string;
    size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner = ({
    fullScreen = false,
    message = 'Chargement...',
    size = 'medium',
}: LoadingSpinnerProps) => {
    const containerStyle = fullScreen
        ? {
              position: 'fixed' as const,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)',
          }
        : {
              width: '100%',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(4px)',
          };

    const sizeClasses = {
        small: 'spinner-small',
        medium: 'spinner-medium',
        large: 'spinner-large',
    };

    return (
        <div
            style={{
                ...containerStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
            }}
        >
            <div style={{ textAlign: 'center' }}>
                <div className={`spinner ${sizeClasses[size]}`}>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                {message && (
                    <p
                        style={{
                            marginTop: '2rem',
                            color: '#ffffff',
                            fontSize: '1rem',
                            fontWeight: 500,
                            letterSpacing: '0.5px',
                        }}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};
