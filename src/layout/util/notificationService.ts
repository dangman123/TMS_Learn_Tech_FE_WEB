import { AlertColor } from '@mui/material';

/**
 * Global notification service that can be used outside of React components
 */
class NotificationService {
    private static instance: NotificationService;
    private notificationCallback?: (message: string, type: AlertColor, duration: number) => void;

    private constructor() {
        // Initialize event listener for notifications from non-React code
        document.addEventListener('show-notification', ((event: CustomEvent) => {
            const { message, type, duration } = event.detail;
            this.notify(message, type, duration);
        }) as EventListener);
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    /**
     * Register the notification callback from the React context
     * @param callback The function to call when showing a notification
     */
    public registerNotificationCallback(
        callback: (message: string, type: AlertColor, duration: number) => void
    ): void {
        this.notificationCallback = callback;
    }

    /**
     * Show a notification
     * @param message The message to display
     * @param type The type of notification (success, error, info, warning)
     * @param duration How long to display the notification (in milliseconds)
     */
    public notify(
        message: string,
        type: AlertColor = 'info',
        duration: number = 5000
    ): void {
        if (this.notificationCallback) {
            this.notificationCallback(message, type, duration);
        } else {
            console.warn('Notification callback not registered. Message:', message);
        }
    }

    /**
     * Show a success notification
     * @param message The success message
     * @param duration How long to display the notification
     */
    public success(message: string, duration: number = 5000): void {
        this.notify(message, 'success', duration);
    }

    /**
     * Show an error notification
     * @param message The error message
     * @param duration How long to display the notification
     */
    public error(message: string, duration: number = 5000): void {
        this.notify(message, 'error', duration);
    }

    /**
     * Show a warning notification
     * @param message The warning message
     * @param duration How long to display the notification
     */
    public warning(message: string, duration: number = 5000): void {
        this.notify(message, 'warning', duration);
    }

    /**
     * Show an info notification
     * @param message The info message
     * @param duration How long to display the notification
     */
    public info(message: string, duration: number = 5000): void {
        this.notify(message, 'info', duration);
    }
}

// Export a singleton instance
export const notificationService = NotificationService.getInstance();

// Export convenience functions
export const showSuccess = (message: string, duration?: number) =>
    notificationService.success(message, duration);

export const showError = (message: string, duration?: number) =>
    notificationService.error(message, duration);

export const showWarning = (message: string, duration?: number) =>
    notificationService.warning(message, duration);

export const showInfo = (message: string, duration?: number) =>
    notificationService.info(message, duration);

export default notificationService; 