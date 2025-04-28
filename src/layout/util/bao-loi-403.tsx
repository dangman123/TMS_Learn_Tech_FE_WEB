import React from "react";
import { useNavigate } from "react-router-dom";
import "./style.css"; // Nếu bạn có tệp SCSS để xử lý CSS

export const Error403 = () => {
    const navigate = useNavigate();

    // Hàm điều hướng quay về trang chủ
    const goBackHome = () => {
        navigate("/");
    };

    return (
        <div className="error403-container">
            <h1 className="error-code">403!</h1>
            <p className="error-message">Unfortunately, you do not have permission to view this page.</p>
            <button className="back-home-btn" onClick={goBackHome}>
                BACK TO HOME
            </button>
        </div>
    );
};

export default Error403;
