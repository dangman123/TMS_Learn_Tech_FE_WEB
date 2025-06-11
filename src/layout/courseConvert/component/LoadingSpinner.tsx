import React from 'react';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
    text?: string;
    fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'medium',
    color = '#4CAF50',
    text = 'Đang tải...',
    fullScreen = false
}) => {
    // Size mapping
    const sizeMap = {
        small: { spinner: 30, text: '14px' },
        medium: { spinner: 50, text: '16px' },
        large: { spinner: 70, text: '18px' }
    };

    const selectedSize = sizeMap[size];

    // Styles
    const containerStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        ...(fullScreen ? {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            zIndex: 9999
        } : {})
    };

    const spinnerStyle: React.CSSProperties = {
        width: `${selectedSize.spinner}px`,
        height: `${selectedSize.spinner}px`,
        borderRadius: '50%',
        border: `4px solid rgba(0, 0, 0, 0.1)`,
        borderTopColor: color,
        animation: 'spin 1s ease-in-out infinite',
        marginBottom: '15px'
    };

    const textStyle: React.CSSProperties = {
        fontSize: selectedSize.text,
        color: '#333',
        fontWeight: 500,
        marginTop: '10px'
    };

    return (
        <div style={containerStyle}>
            <style>
                {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
          }
        `}
            </style>
            <div style={spinnerStyle}></div>
            {text && <div style={textStyle}>{text}</div>}
        </div>
    );
};

export default LoadingSpinner; 