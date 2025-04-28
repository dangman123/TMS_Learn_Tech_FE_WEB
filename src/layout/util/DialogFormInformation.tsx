import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from './fucntion/useRefreshToken';
import { authTokenLogin } from './fucntion/auth';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, SelectChangeEvent } from "@mui/material";
import { format } from 'date-fns';

    interface FormData {
        email: string;
        birthday: Date | null;  // Đổi kiểu từ number sang Date
        studyHoursPerWeek: number;
        timeSpentOnSocialMedia: number;
        sleepHoursPerNight: number;
        gender: 0;
        preferredLearningStyle: number;
        useOfEducationalTech: boolean;
        selfReportedStressLevel: number;
    }
const DialogFormInformation: React.FC<{ open: boolean; onClose: () => void; courseCode: string; }> = ({ open, onClose, courseCode }) => {
    const [formData, setFormData] = useState<FormData>({
        email: "",
        birthday: null,  // Đặt giá trị mặc định là null
        studyHoursPerWeek: 0,
        timeSpentOnSocialMedia: 0,
        sleepHoursPerNight: 0,
        gender: 0,
        preferredLearningStyle: 0,
        useOfEducationalTech: false,
        selfReportedStressLevel: 1,
    });
    const [errorMessage, setErrorMessage] = useState("");
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
    const auth = getAuthData();

    const [isActivated, setIsActivated] = useState(false);
    // Hàm xử lý thay đổi các trường input (sử dụng ChangeEvent)
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: name === "studyHoursPerWeek" || name === "timeSpentOnSocialMedia" || name === "sleepHoursPerNight" || name === "selfReportedStressLevel"
                ? parseInt(value, 10)
                : value,
        }));
    };
    const handleStressLevelChange = (event: SelectChangeEvent<number>) => {
        setFormData((prevData) => ({
            ...prevData,
            selfReportedStressLevel: event.target.value as number,
        }));
    };
    const navigate = useNavigate();
    const refresh = useRefreshToken();
    const refreshToken = localStorage.getItem("refreshToken");
    const handleLearningStyleChange = (event: SelectChangeEvent<number>) => {
        setFormData((prevData) => ({
            ...prevData,
            preferredLearningStyle: event.target.value as number, // Đảm bảo giá trị là số
        }));
    };
    // const [formData, setFormData] = useState<FormData>({ gender: 1 });

    const handleGenderChange = (e: SelectChangeEvent<0 | 1>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value as 0 | 1, // Ensure the value is cast to the correct type
        }));
    };

    // Hàm để xử lý khi người dùng chọn "Sử dụng công nghệ giáo dục"
    const handleTechChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { checked } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            useOfEducationalTech: checked,
        }));
    };

    // Hàm gửi dữ liệu tới API để kích hoạt khóa học
    const handleSubmitCourseActive = async (event: React.FormEvent) => {
        event.preventDefault();
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
                alert("Thông tin đã được gửi thành công!");
                setIsActivated(true); // Nếu kích hoạt thành công
                onClose();
            } else {
                setErrorMessage(result || "Có lỗi xảy ra khi kích hoạt khóa học.");
            }
        } catch (error) {
            setErrorMessage("Có lỗi xảy ra khi gửi thông tin.");
        }
    };



    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Khảo sát thói quen</DialogTitle>
            <p> Chúng tôi sẽ ghi nhận lại thói quen này để đưa ra lộ trình học tập hợp lý cho bạn!</p>
            <p>Vui lòng điền đầy đủ thông tin!</p>
            <DialogContent>
                <TextField
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Ngày sinh"
                    type="date"
                    name="birthday"
                    value={formData.birthday ? format(formData.birthday, 'yyyy-MM-dd') : ''}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value ? new Date(e.target.value) : null })}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Số giờ học mỗi tuần"
                    type="number"
                    name="studyHoursPerWeek"
                    value={formData.studyHoursPerWeek}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Số giờ dành cho mạng xã hội mỗi tuần"
                    type="number"
                    name="timeSpentOnSocialMedia"
                    value={formData.timeSpentOnSocialMedia}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Số giờ ngủ mỗi đêm"
                    type="number"
                    name="sleepHoursPerNight"
                    value={formData.sleepHoursPerNight}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleGenderChange}
                    >
                        <MenuItem value={1}>Nam</MenuItem>
                        <MenuItem value={0}>Nữ</MenuItem>
                    </Select>
                </FormControl>


                <FormControl fullWidth margin="normal">
                    <InputLabel>Phong cách học ưa thích</InputLabel>
                    <Select
                        name="preferredLearningStyle"
                        value={formData.preferredLearningStyle}
                        onChange={handleLearningStyleChange}
                    >
                        <MenuItem value={0}>Học qua thực hành</MenuItem>
                        <MenuItem value={1}>Học qua đọc và viết</MenuItem>
                        <MenuItem value={2}>Học qua nghe</MenuItem>

                    </Select>
                </FormControl>

                <FormControlLabel
                    control={<Checkbox checked={formData.useOfEducationalTech} onChange={handleTechChange} />}
                    label="Sử dụng công nghệ giáo dục"
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel id="stress-level-label">Mức độ căng thẳng</InputLabel>
                    <Select
                        labelId="stress-level-label"
                        label="Mức độ căng thẳng"
                        name="selfReportedStressLevel"
                        value={formData.selfReportedStressLevel}
                        onChange={handleStressLevelChange}
                        fullWidth
                    >
                        <MenuItem value={0}>Rất thấp</MenuItem>
                        <MenuItem value={1}>Thấp</MenuItem>
                        <MenuItem value={2}>Trung bình</MenuItem>
                        <MenuItem value={3}>Cao</MenuItem>
                        <MenuItem value={4}>Rất cao</MenuItem>
                    </Select>
                </FormControl>

            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Đóng
                </Button>
                <Button onClick={handleSubmitCourseActive} color="primary">
                    Gửi thông tin
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DialogFormInformation;
