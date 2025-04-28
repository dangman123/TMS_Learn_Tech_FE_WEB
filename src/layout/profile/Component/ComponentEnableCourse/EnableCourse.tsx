import React, { useState } from "react";
import "./EnableCourse.css";
import { authTokenLogin } from "../../../util/fucntion/auth";
import { useNavigate } from "react-router-dom";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import DialogFormInformation from "../../../util/DialogFormInformation";
const EnableCourse = () => {
    const [courseCode, setCourseCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isActivated, setIsActivated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const handleCourseCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCourseCode(event.target.value);
        setErrorMessage("");  // Reset error message when user types
    }; const [showForm, setShowForm] = useState(false); 
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
    const navigate = useNavigate();
    const refresh = useRefreshToken();
    const refreshToken = localStorage.getItem("refreshToken");
    const handleActivateCourseCheck = async () => {
        const auth = getAuthData();
        setIsLoading(true); // Set loading to true when API call starts
        setErrorMessage(""); // Reset any previous error messages
        const token = await authTokenLogin(refreshToken, refresh, navigate);
        try {
            // Make API call to the backend to validate the course code
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/course-codes/check-enable`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ code: courseCode, accountId: auth.id}), // Send the code in the request body
            });

            const result = await response.json();
            if (response.ok && result.valid) {
                setOpenDialog(true);  // Hiển thị form nhập thông tin người dùng khi API trả về hợp lệ
            } else {
                // Nếu không hợp lệ, hiển thị thông báo lỗi
                setErrorMessage(result.message || "Mã khóa học không hợp lệ.");
            }
        } catch (error) {
            setErrorMessage("Có lỗi xảy ra khi kích hoạt khóa học. Vui lòng thử lại.");
        } finally {
            setIsLoading(false); // Set loading to false after API call finishes
        }
    };
    const [openDialog, setOpenDialog] = useState(false);

    const openDialogHandler = () => {
        setOpenDialog(true);
    };

    const closeDialogHandler = () => {
        setOpenDialog(false);
    };

    return (

        <div id="payHistory" className="container enable-course">
            <div className="card enable-course">
                <h2>Kích hoạt khóa học</h2>
                <p>Nhập mã khóa học để kích hoạt khóa học của bạn.</p>

                {isActivated && <p className="successMessage">Khóa học đã được kích hoạt thành công!</p>}

                <div className="inputContainer enable-course">
                    <input
                        type="text"
                        value={courseCode}
                        onChange={handleCourseCodeChange}
                        className="input"
                        placeholder="Nhập mã khóa học"
                    />
                </div>

                {errorMessage && <p className="errorMessage">{errorMessage}</p>}
                {/* {showForm && <DialogFormInformation courseCode={courseCode} />} */}

                <DialogFormInformation open={openDialog} onClose={closeDialogHandler} courseCode={courseCode} />

                <button
                    className="activateButton enable-course"
                    onClick={handleActivateCourseCheck}
                    disabled={isLoading} // Disable button while loading
                >
                    {isLoading ? "Đang kích hoạt..." : "Kích hoạt khóa học"}
                </button>
            </div>
        </div>
    );
};


export default EnableCourse;
