import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify và toast
import "react-toastify/dist/ReactToastify.css";
const VerifyOTP: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || "";
  const [formData, setFormData] = useState({
    email: emailFromState,
    otp: "",
  });

  const handleVerify = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_SERVER_HOST}/account/verify-otp`, formData);
      toast.success("Xác thực thành công !");
      setTimeout(() => {
        navigate("/dang-nhap");
      }, 2000);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div>
      <h3>Nhập Mã OTP</h3>
      <input
        type="text"
        placeholder="Mã OTP"
        value={formData.otp}
        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
      />
      <button onClick={handleVerify}>Xác minh</button>
      <ToastContainer />
    </div>
  );
};

export default VerifyOTP;
