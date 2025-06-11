import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ContentLoaderProps {
    isLoading: boolean;
    children: React.ReactNode;
    height?: string | number;
    text?: string;
    spinnerSize?: 'small' | 'medium' | 'large';
    spinnerColor?: string;
    overlay?: boolean;
}

const ContentLoader: React.FC<ContentLoaderProps> = ({
    isLoading,
    children,
    height = 'auto',
    text = 'Đang tải nội dung...',
    spinnerSize = 'medium',
    spinnerColor = '#4CAF50',
    overlay = false
}) => {
    const containerStyle: React.CSSProperties = {
        position: 'relative',
        minHeight: height !== 'auto' ? height : '200px',
        width: '100%'
    };

    const overlayStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: '8px',
        backdropFilter: 'blur(2px)'
    };

    const placeholderStyle: React.CSSProperties = {
        width: '100%',
        height: height !== 'auto' ? height : '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
    };

    if (isLoading && !overlay) {
        return (
            <div style={placeholderStyle}>
                <LoadingSpinner size={spinnerSize} color={spinnerColor} text={text} />
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {children}
            {isLoading && overlay && (
                <div style={overlayStyle}>
                    <LoadingSpinner size={spinnerSize} color={spinnerColor} text={text} />
                </div>
            )}
        </div>
    );
};

export default ContentLoader; 