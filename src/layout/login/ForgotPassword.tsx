import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/assetsLogin/css/fontawesome-all.min.css";
import "../../assets/assetsLogin/css/iofrm-style.css";
import "../../assets/assetsLogin/css/iofrm-theme19.css";
import { ToastContainer, toast } from "react-toastify"; // Để hiển thị thông báo
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>(""); // State để lưu email
  const [isSent, setIsSent] = useState<boolean>(false);
  const [showOtpForm, setShowOtpForm] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Vui lòng nhập Email !");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Email không đúng định dạng !");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/account/forgot-password`, { email });
      toast.success("Mã OTP đã được gửi tới Email của bạn !");
      setShowOtpForm(true);
    } catch (error) {
      toast.error("Xảy ra lỗi ! Vui lòng thử lại sau !");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Vui lòng nhập mã OTP!");
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/account/verify-otp`, {
        otp: otp,
        email: email,
        type: "FORGOT"
      });

      if (response.data) {
        toast.success("Xác thực OTP thành công!");
        setIsSent(true);
        // Chuyển hướng đến trang đặt lại mật khẩu sau 2 giây
        setTimeout(() => {
          navigate("/reset-password", { state: { email, otp } });
        }, 2000);
      }
    } catch (error) {
      toast.error("Mã OTP không đúng hoặc đã hết hạn!");
    }
  };

  return (
    <div className="form-body without-side">
      <div className="row">
        <div className="img-holder">
          <div className="bg"></div>
          <div className="info-holder">
            <img src="../../assets/assetsLogin/images/graphic3.svg" alt="" />
          </div>
        </div>
        <div className="form-holder" style={{ marginTop: "15%" }}>
          <div className="form-content">
            {isSent ? (
              <div className="form-sent">
                <div className="tick-holder">
                  <div className="tick-icon"></div>
                </div>
                <h3>Xác thực thành công!</h3>
                <p>Đang chuyển hướng đến trang đặt lại mật khẩu...</p>
              </div>
            ) : showOtpForm ? (
              <div className="form-items">
                <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                  Nhập mã OTP
                </h3>
                <p style={{ textAlign: "center" }}>
                  Vui lòng nhập mã OTP đã được gửi đến email {email}
                </p>
                <form onSubmit={handleVerifyOtp}>
                  <input
                    className="form-control"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Nhập mã OTP"
                    maxLength={6}
                  />
                  <div className="form-button full-width">
                    <button
                      id="submit"
                      type="submit"
                      className="ibtn btn-forget"
                    >
                      Xác thực OTP
                    </button>
                  </div>
                  <div className="other-links">
                    <span>Không nhận được mã? </span>
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }}>Gửi lại mã</a>
                  </div>
                </form>
              </div>
            ) : (
              <div className="form-items">
                <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                  Quên mật khẩu
                </h3>
                <p style={{ textAlign: "center" }}>
                  Vui lòng nhập email tài khoản!
                </p>
                <form onSubmit={handleSubmit}>
                  <input
                    className="form-control"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-mail Address"
                  />
                  <div className="form-button full-width">
                    <button
                      id="submit"
                      type="submit"
                      className="ibtn btn-forget"
                    >
                      Gửi mã OTP
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
export default ForgotPassword;
