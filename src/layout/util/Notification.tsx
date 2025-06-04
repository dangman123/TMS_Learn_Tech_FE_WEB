import React from 'react';
import { AlertColor } from '@mui/material';
import { useNotification } from './NotificationContext';

interface NotificationProps {
    message: string;
    type?: AlertColor;
    duration?: number;
    autoShow?: boolean;
}

/**
 * A reusable notification component that can be used throughout the application.
 * 
 * @param message - The notification message to display
 * @param type - The type of notification (success, error, info, warning)
 * @param duration - How long the notification should display (in milliseconds)
 * @param autoShow - Whether to show the notification automatically on mount
 */
const Notification: React.FC<NotificationProps> = ({
    message,
    type = 'info',
    duration = 5000,
    autoShow = true
}) => {
    const { showNotification } = useNotification();

    React.useEffect(() => {
        if (autoShow && message) {
            showNotification(message, type, duration);
        }
    }, [message, type, duration, autoShow, showNotification]);

    return null; // This component doesn't render anything directly
};

/**
 * Helper function to show a notification without using the component
 */
export const showNotification = (
    message: string,
    type: AlertColor = 'info',
    duration: number = 5000
) => {
    // This is a placeholder - the actual implementation will use the context
    // We'll need to access the context from outside React components
    const event = new CustomEvent('show-notification', {
        detail: { message, type, duration }
    });
    document.dispatchEvent(event);
};

export default Notification; 