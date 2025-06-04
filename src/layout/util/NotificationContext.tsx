import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Alert, Snackbar, AlertColor } from '@mui/material';
import notificationService from './notificationService';

interface NotificationContextType {
    showNotification: (message: string, type?: AlertColor, duration?: number) => void;
    hideNotification: () => void;
}

interface NotificationProviderProps {
    children: ReactNode;
}

interface NotificationState {
    open: boolean;
    message: string;
    type: AlertColor;
    duration: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notification, setNotification] = useState<NotificationState>({
        open: false,
        message: '',
        type: 'info',
        duration: 5000,
    });

    const showNotification = (
        message: string,
        type: AlertColor = 'info',
        duration: number = 5000
    ) => {
        setNotification({
            open: true,
            message,
            type,
            duration,
        });
    };

    const hideNotification = () => {
        setNotification((prev) => ({
            ...prev,
            open: false,
        }));
    };

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        hideNotification();
    };

    // Register the notification callback with the service
    useEffect(() => {
        notificationService.registerNotificationCallback(showNotification);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification }}>
            {children}
            <Snackbar
                open={notification.open}
                autoHideDuration={notification.duration}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleClose}
                    severity={notification.type}
                    variant="filled"
                    sx={{
                        width: '100%',
                        fontSize: '1.1rem',
                        alignItems: 'center',
                        '& .MuiAlert-icon': {
                            fontSize: '1.5rem'
                        }
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export default NotificationContext; 