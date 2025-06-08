import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from './fucntion/useRefreshToken';
import { authTokenLogin } from './fucntion/auth';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    SelectChangeEvent,
    Typography,
    Box,
    Divider,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    Paper,
    IconButton,
    Tooltip,
    Alert,
    ThemeProvider,
    createTheme,
    responsiveFontSizes
} from "@mui/material";
import { format } from 'date-fns';
import {
    Email,
    Cake,
    AccessTime,
    Phone,
    Nightlight,
    Wc,
    School,
    Computer,
    Psychology,
    Close
} from '@mui/icons-material';
import { showError, showSuccess } from './notificationService';

// Create a theme with larger font sizes
const theme = responsiveFontSizes(createTheme({
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: 16,
        body1: {
            fontSize: '1.1rem',
        },
        body2: {
            fontSize: '0.95rem',
        },
        caption: {
            fontSize: '0.9rem',
        },
        h6: {
            fontSize: '1.25rem',
            fontWeight: 500,
        },
        button: {
            fontSize: '1rem',
            fontWeight: 500,
        },
    },
    components: {
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontSize: '1.1rem',
                },
            },  
        },
        MuiOutlinedInput: {
            styleOverrides: {
                input: {
                    fontSize: '1.1rem',
                    padding: '14px 14px',
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    fontSize: '1.1rem',
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontSize: '1.5rem',
                    fontWeight: 600,
                },
            },
        },
    },
}));

interface FormData {
    email: string;
    birthday: Date | null;
    studyHoursPerWeek: number;
    timeSpentOnSocialMedia: number;
    sleepHoursPerNight: number;
    gender: 0;
    preferredLearningStyle: number;
    useOfEducationalTech: boolean;
     selfReportedStressLevel: number;
}

interface FormErrors {
    email?: string;
    birthday?: string;
    studyHoursPerWeek?: string;
    timeSpentOnSocialMedia?: string;
    sleepHoursPerNight?: string;
    gender?: string;
    preferredLearningStyle?: string;
    selfReportedStressLevel?: string;
}

const DialogFormInformation: React.FC<{ open: boolean; onClose: () => void; courseCode: string; }> = ({ open, onClose, courseCode }) => {
    const getAuthData = () => {
        const authData = localStorage.getItem("authData");
        if (authData) {
            try {
                return JSON.parse(authData);
            } catch (error) {
                console.error("Error parsing authData:", error);
                return null;
            }
        }
        return null;
    };

    const auth = getAuthData();
    const navigate = useNavigate();
    const refresh = useRefreshToken();
    const refreshToken = localStorage.getItem("refreshToken");

    const [formData, setFormData] = useState<FormData>({
        email: "",
        birthday: null,
        studyHoursPerWeek: 0,
        timeSpentOnSocialMedia: 0,
        sleepHoursPerNight: 0,
        gender: 0,
        preferredLearningStyle: 0,
        useOfEducationalTech: false,
        selfReportedStressLevel: 1,
    });

    // Cập nhật email từ thông tin đăng nhập khi component được mount
    useEffect(() => {
        if (auth && auth.email) {
            setFormData(prev => ({
                ...prev,
                email: auth.email
            }));
        }
    }, [auth]);

    const [errors, setErrors] = useState<FormErrors>({});
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [isActivated, setIsActivated] = useState(false);

    const steps = ['Thông tin cơ bản', 'Thời gian học tập', 'Phong cách học'];

    const calculateAge = (birthday: Date) => {
        const today = new Date();
        const birthDate = new Date(birthday);
        let age = today.getFullYear() - birthDate.getFullYear();
        const month = today.getMonth();
        if (month < birthDate.getMonth() || (month === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: name === "studyHoursPerWeek" || name === "timeSpentOnSocialMedia" || name === "sleepHoursPerNight" || name === "selfReportedStressLevel"
                ? parseInt(value, 10) || 0
                : value,
        }));
    };

    const handleStressLevelChange = (event: SelectChangeEvent<number>) => {
        setFormData((prevData) => ({
            ...prevData,
            selfReportedStressLevel: event.target.value as number,
        }));
    };

    const handleLearningStyleChange = (event: SelectChangeEvent<number>) => {
        setFormData((prevData) => ({
            ...prevData,
            preferredLearningStyle: event.target.value as number,
        }));
    };

    const handleGenderChange = (e: SelectChangeEvent<0 | 1>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value as 0 | 1,
        }));
    };

    const handleTechChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            useOfEducationalTech: checked,
        }));
    };

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validateStep = (step: number): boolean => {
        let stepErrors: FormErrors = {};
        let isValid = true;

        switch (step) {
            case 0: // Thông tin cơ bản
                // Email đã được lấy từ thông tin đăng nhập nên không cần kiểm tra
                if (!formData.birthday) {
                    stepErrors.birthday = "Ngày sinh không được để trống";
                    isValid = false;
                }
                break;

            case 1: // Thời gian học tập
                if (formData.studyHoursPerWeek <= 0) {
                    stepErrors.studyHoursPerWeek = "Số giờ học phải lớn hơn 0";
                    isValid = false;
                }

                if (formData.timeSpentOnSocialMedia < 0) {
                    stepErrors.timeSpentOnSocialMedia = "Số giờ không được âm";
                    isValid = false;
                }

                if (formData.sleepHoursPerNight <= 0) {
                    stepErrors.sleepHoursPerNight = "Số giờ ngủ phải lớn hơn 0";
                    isValid = false;
                } else if (formData.sleepHoursPerNight > 24) {
                    stepErrors.sleepHoursPerNight = "Số giờ ngủ không được vượt quá 24";
                    isValid = false;
                }
                break;

            case 2: // Phong cách học
                // No specific validation needed for this step as all fields have default values
                break;
        }

        setErrors(stepErrors);
        return isValid;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
        // Clear errors when going back
        setErrors({});
    };

    const validateForm = (): boolean => {
        // Validate all steps before final submission
        let formErrors: FormErrors = {};
        let isValid = true;

        // Email đã được lấy từ thông tin đăng nhập nên không cần kiểm tra

        if (!formData.birthday) {
            formErrors.birthday = "Ngày sinh không được để trống";
            isValid = false;
        }

        if (formData.studyHoursPerWeek <= 0) {
            formErrors.studyHoursPerWeek = "Số giờ học phải lớn hơn 0";
            isValid = false;
        }

        if (formData.timeSpentOnSocialMedia < 0) {
            formErrors.timeSpentOnSocialMedia = "Số giờ không được âm";
            isValid = false;
        }

        if (formData.sleepHoursPerNight <= 0) {
            formErrors.sleepHoursPerNight = "Số giờ ngủ phải lớn hơn 0";
            isValid = false;
        } else if (formData.sleepHoursPerNight > 24) {
            formErrors.sleepHoursPerNight = "Số giờ ngủ không được vượt quá 24";
            isValid = false;
        }

        setErrors(formErrors);

        if (!isValid) {
            setErrorMessage("Vui lòng điền đầy đủ thông tin hợp lệ trước khi gửi");
        }

        return isValid;
    };

    const handleSubmitCourseActive = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) {
            showError("Vui lòng điền đầy đủ thông tin hợp lệ trước khi gửi");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        const auth = getAuthData();
        const token = await authTokenLogin(refreshToken, refresh, navigate);
        const age = calculateAge(formData.birthday!);

        try {
            // Gửi toàn bộ thông tin người dùng cùng với mã khóa học đến API kích hoạt
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/course-codes/enable`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    birthday: age,
                    code: courseCode,
                    accountId: auth.id,
                }),
            });

            const result = await response.text();

            if (response.ok) {
                showSuccess("Khóa học đã được kích hoạt thành công!");
                setIsActivated(true);
                setTimeout(() => {
                    onClose();
                    window.location.reload(); // Reload để hiển thị khóa học mới
                }, 2000);
            } else {
                showError(result || "Có lỗi xảy ra khi kích hoạt khóa học.");
                setErrorMessage(result || "Có lỗi xảy ra khi kích hoạt khóa học.");
            }
        } catch (error) {
            showError("Có lỗi xảy ra khi gửi thông tin.");
            setErrorMessage("Có lỗi xảy ra khi gửi thông tin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <TextField
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            fullWidth
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: <Email color="primary" sx={{ mr: 1 }} />,
                                readOnly: true,
                            }}
                            disabled
                            helperText="Email được lấy từ tài khoản của bạn"
                        />
                        <TextField
                            label="Ngày sinh"
                            type="date"
                            name="birthday"
                            value={formData.birthday ? format(formData.birthday, 'yyyy-MM-dd') : ''}
                            onChange={(e) => setFormData({ ...formData, birthday: e.target.value ? new Date(e.target.value) : null })}
                            fullWidth
                            margin="normal"
                            required
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                startAdornment: <Cake color="primary" sx={{ mr: 1 }} />,
                            }}
                            error={!!errors.birthday}
                            helperText={errors.birthday || ""}
                        />
                        <FormControl fullWidth margin="normal" error={!!errors.gender}>
                            <InputLabel id="gender-label">Giới tính</InputLabel>
                            <Select
                                labelId="gender-label"
                                name="gender"
                                label="Giới tính"
                                value={formData.gender}
                                onChange={handleGenderChange}
                                startAdornment={<Wc color="primary" sx={{ mr: 1 }} />}
                                required
                            >
                                <MenuItem value={1}>Nam</MenuItem>
                                <MenuItem value={0}>Nữ</MenuItem>
                            </Select>
                            {errors.gender && <Typography color="error" variant="caption">{errors.gender}</Typography>}
                        </FormControl>
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        <TextField
                            label="Bạn dành bao nhiêu giờ học mỗi tuần?"
                            type="number"
                            name="studyHoursPerWeek"
                            value={formData.studyHoursPerWeek}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: <AccessTime color="primary" sx={{ mr: 1 }} />,
                                inputProps: { min: 1 }
                            }}
                            error={!!errors.studyHoursPerWeek}
                            helperText={errors.studyHoursPerWeek || ""}
                        />
                        <TextField
                            label="Bạn dành bao nhiêu giờ cho mạng xã hội mỗi tuần?"
                            type="number"
                            name="timeSpentOnSocialMedia"
                            value={formData.timeSpentOnSocialMedia}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: <Phone color="primary" sx={{ mr: 1 }} />,
                                inputProps: { min: 0 }
                            }}
                            error={!!errors.timeSpentOnSocialMedia}
                            helperText={errors.timeSpentOnSocialMedia || ""}
                        />
                        <TextField
                            label="Bạn ngủ bao nhiêu giờ mỗi đêm?"
                            type="number"
                            name="sleepHoursPerNight"
                            value={formData.sleepHoursPerNight}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            required
                            InputProps={{
                                startAdornment: <Nightlight color="primary" sx={{ mr: 1 }} />,
                                inputProps: { min: 1, max: 24 }
                            }}
                            error={!!errors.sleepHoursPerNight}
                            helperText={errors.sleepHoursPerNight || ""}
                        />
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        <FormControl fullWidth margin="normal" error={!!errors.preferredLearningStyle}>
                            <InputLabel id="learning-style-label">Phong cách học ưa thích của bạn là gì?</InputLabel>
                            <Select
                                name="preferredLearningStyle"
                                labelId="learning-style-label"
                                label="Phong cách học ưa thích của bạn là gì?"
                                value={formData.preferredLearningStyle}
                                onChange={handleLearningStyleChange}
                                startAdornment={<School color="primary" sx={{ mr: 1 }} />}
                                required
                            >
                                <MenuItem value={0}>Học qua thực hành</MenuItem>
                                <MenuItem value={1}>Học qua đọc và viết</MenuItem>
                                <MenuItem value={2}>Học qua nghe</MenuItem>
                                <MenuItem value={3}>Học qua nhìn</MenuItem>
                            </Select>
                            {errors.preferredLearningStyle && <Typography color="error" variant="caption">{errors.preferredLearningStyle}</Typography>}
                        </FormControl>

                        <FormControl fullWidth margin="normal">
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                border: '1px solid',
                                borderColor: formData.useOfEducationalTech ? 'primary.main' : 'rgba(0, 0, 0, 0.23)',
                                borderRadius: 1,
                                p: 1.5,
                                '&:hover': {
                                    borderColor: 'text.primary'
                                }
                            }}>
                                <Computer
                                    color={formData.useOfEducationalTech ? "primary" : "action"}
                                    sx={{ mr: 1.5 }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body1">
                                        Sử dụng công nghệ giáo dục
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Bạn có thường xuyên sử dụng các ứng dụng học tập, công cụ trực tuyến không?
                                    </Typography>
                                </Box>
                                <Checkbox
                                    checked={formData.useOfEducationalTech}
                                    onChange={handleTechChange}
                                    color="primary"
                                />
                            </Box>
                        </FormControl>

                        <FormControl fullWidth margin="normal" error={!!errors.selfReportedStressLevel}>
                            <InputLabel id="stress-level-label">Bạn có thường xuyên cảm thấy căng thẳng không?</InputLabel>
                            <Select
                                labelId="stress-level-label"
                                label="Bạn có thường xuyên cảm thấy căng thẳng không?"
                                name="selfReportedStressLevel"
                                value={formData.selfReportedStressLevel}
                                onChange={handleStressLevelChange}
                                startAdornment={<Psychology color="primary" sx={{ mr: 1 }} />}
                                required
                            >
                                <MenuItem value={0}>Rất thấp</MenuItem>
                                <MenuItem value={1}>Thấp</MenuItem>
                                <MenuItem value={2}>Trung bình</MenuItem>
                                <MenuItem value={3}>Cao</MenuItem>
                                <MenuItem value={4}>Rất cao</MenuItem>
                            </Select>
                            {errors.selfReportedStressLevel && <Typography color="error" variant="caption">{errors.selfReportedStressLevel}</Typography>}
                        </FormControl>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="sm"
                PaperProps={{
                    elevation: 8,
                    sx: {
                        borderRadius: 2,
                        overflow: 'hidden'
                    }
                }}
            >
                <Box sx={{ position: 'relative' }}>
                    <Box sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        p: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <DialogTitle sx={{ p: 0, fontWeight: 'bold', fontSize: '1.6rem' }}>
                            Khảo sát thói quen học tập
                        </DialogTitle>
                        <IconButton
                            onClick={onClose}
                            sx={{ color: 'white' }}
                        >
                            <Close />
                        </IconButton>
                    </Box>

                    <Box sx={{ px: 3, pt: 2 }}>
                        <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
                            Chúng tôi sẽ ghi nhận thói quen này để đưa ra lộ trình học tập phù hợp với bạn!
                        </Typography>

                        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>
                                        <Typography sx={{ fontSize: '1rem' }}>{label}</Typography>
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {isActivated ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CircularProgress color="success" sx={{ mb: 2 }} />
                                <Typography variant="h6" color="success.main" sx={{ fontSize: '1.3rem' }}>
                                    Kích hoạt khóa học thành công!
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1, fontSize: '1.05rem' }}>
                                    Đang chuyển hướng...
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                {errorMessage && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        <Typography sx={{ fontSize: '1.05rem' }}>{errorMessage}</Typography>
                                    </Alert>
                                )}

                                <DialogContent sx={{ px: 0 }}>
                                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper' }}>
                                        {renderStepContent(activeStep)}
                                    </Paper>
                                </DialogContent>

                                <DialogActions sx={{ justifyContent: 'space-between', px: 0, pb: 2 }}>
                                    <Button
                                        onClick={activeStep === 0 ? onClose : handleBack}
                                        color="inherit"
                                        variant="outlined"
                                        sx={{ fontSize: '1rem', py: 1 }}
                                    >
                                        {activeStep === 0 ? 'Hủy' : 'Quay lại'}
                                    </Button>
                                    <Box>
                                        {activeStep === steps.length - 1 ? (
                                            <Button
                                                onClick={handleSubmitCourseActive}
                                                color="primary"
                                                variant="contained"
                                                disabled={isSubmitting}
                                                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                                                sx={{ fontSize: '1rem', py: 1 }}
                                            >
                                                {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất và kích hoạt'}
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleNext}
                                                color="primary"
                                                variant="contained"
                                                sx={{ fontSize: '1rem', py: 1 }}
                                            >
                                                Tiếp tục
                                            </Button>
                                        )}
                                    </Box>
                                </DialogActions>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Dialog>
        </ThemeProvider>
    );
};

export default DialogFormInformation;
