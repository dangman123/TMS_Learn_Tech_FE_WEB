import React, { useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from "@mui/material";

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
interface TestDetailPopupProps {
    open: boolean;
    onClose: () => void;
    testDetails: {
        testId: string;
        description: string;
        title: string;
        duration: number;
        totalQuestions: number;
    };
}
dayjs.extend(duration);
function TestDetailPopup({ open, onClose, testDetails }: TestDetailPopupProps) {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [durationTime, setDurationTime] = useState<dayjs.Dayjs | null>(dayjs(testDetails.duration, "mm:ss"));
    const handleStartTest = () => {

        localStorage.setItem("examId", testDetails.testId)
        localStorage.setItem("duration", testDetails.duration.toString())
        localStorage.setItem("totalQuestions", testDetails.totalQuestions.toString())
        localStorage.setItem("examTitle", testDetails.title)
        setIsConfirmed(true);
        
        window.location.href = `/de-thi/${testDetails.testId}`;
    };
    const formatTime = (seconds: number): string => {
        if (seconds < 0) return "Invalid time";
        const minutes = Math.floor(seconds / 60);
        const formattedMinutes = minutes < 10 ? String(minutes).padStart(2, '0') : minutes;
        const remainingSeconds = seconds % 60;
        const formattedSecond = remainingSeconds < 10 ? String(remainingSeconds).padStart(2, '0') : remainingSeconds;
        return `${formattedMinutes}:${formattedSecond}`;
    };
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Thông tin chi tiết bài kiểm tra</DialogTitle>
            <DialogContent>
                <Typography variant="h6">{testDetails.title}</Typography>
                <Typography variant="body1">Thời gian: {formatTime(testDetails.duration)}</Typography>
                <Typography variant="body1">Số câu: {testDetails.totalQuestions}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Đóng</Button>
                <Button
                    onClick={handleStartTest}
                    color="primary"
                    variant="contained"
                    disabled={isConfirmed}
                >
                    {isConfirmed ? "Đang chuyển hướng..." : "Bắt đầu làm bài"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default TestDetailPopup;
