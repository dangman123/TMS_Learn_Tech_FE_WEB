import React from 'react';
import { Button, Box, Typography, Paper, Grid } from '@mui/material';
import { useNotification } from './NotificationContext';
import {
    showSuccess,
    showError,
    showWarning,
    showInfo
} from './notificationService';

/**
 * Example component demonstrating how to use the notification system
 */
const NotificationExample: React.FC = () => {
    // Method 1: Using the useNotification hook (within React components)
    const { showNotification } = useNotification();

    const handleShowInfoNotification = () => {
        showNotification('Đây là thông báo thông tin', 'info');
    };

    const handleShowSuccessNotification = () => {
        showNotification('Thao tác thành công!', 'success');
    };

    const handleShowWarningNotification = () => {
        showNotification('Cảnh báo: Hãy kiểm tra lại thông tin', 'warning');
    };

    const handleShowErrorNotification = () => {
        showNotification('Đã xảy ra lỗi. Vui lòng thử lại sau.', 'error');
    };

    // Method 2: Using the global notification service (can be used anywhere)
    const handleGlobalSuccess = () => {
        showSuccess('Thao tác thành công từ service!');
    };

    const handleGlobalError = () => {
        showError('Lỗi từ service!');
    };

    const handleGlobalWarning = () => {
        showWarning('Cảnh báo từ service!');
    };

    const handleGlobalInfo = () => {
        showInfo('Thông tin từ service!');
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
            <Typography variant="h5" gutterBottom>
                Ví dụ về Hệ thống Thông báo
            </Typography>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Phương pháp 1: Sử dụng useNotification hook
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    Phương pháp này nên được sử dụng trong các component React.
                </Typography>
                <Grid container spacing={2}>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="info"
                            onClick={handleShowInfoNotification}
                        >
                            Thông báo Thông tin
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleShowSuccessNotification}
                        >
                            Thông báo Thành công
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={handleShowWarningNotification}
                        >
                            Thông báo Cảnh báo
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleShowErrorNotification}
                        >
                            Thông báo Lỗi
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom>
                    Phương pháp 2: Sử dụng Notification Service
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    Phương pháp này có thể được sử dụng ở bất kỳ đâu, kể cả bên ngoài React components.
                </Typography>
                <Grid container spacing={2}>
                    <Grid item>
                        <Button
                            variant="outlined"
                            color="info"
                            onClick={handleGlobalInfo}
                        >
                            Thông báo Thông tin
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            color="success"
                            onClick={handleGlobalSuccess}
                        >
                            Thông báo Thành công
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            color="warning"
                            onClick={handleGlobalWarning}
                        >
                            Thông báo Cảnh báo
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleGlobalError}
                        >
                            Thông báo Lỗi
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            <Typography variant="body2" sx={{ mt: 4, fontStyle: 'italic' }}>
                Lưu ý: Để sử dụng hệ thống thông báo này, cần đảm bảo rằng NotificationProvider
                đã được bọc xung quanh ứng dụng của bạn trong file App.tsx hoặc index.tsx
            </Typography>
        </Paper>
    );
};

export default NotificationExample; 