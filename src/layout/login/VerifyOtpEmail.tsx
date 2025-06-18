import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const VerifyOtpEmail: React.FC = () => {
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(60);
  const location = useLocation();
  const navigate = useNavigate();

  const { email, type } = location.state || { email: "", type: "REGISTER" };

  useEffect(() => {
    // Kiểm tra nếu không có email hoặc type trong state
    if (!email) {
      toast.error("Thông tin không đầy đủ. Vui lòng thử lại.");
      navigate("/dang-ky");
      return;
    }

    // Bộ đếm thời gian
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [email, navigate, timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Vui lòng nhập mã OTP!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_HOST}/account/verify-otp`,
        {
          otp,
          email,
          type
        }
      );

      if (response.status === 200) {
        toast.success("Xác thực thành công!");
        setTimeout(() => {
          navigate("/dang-nhap");
        }, 2000);
      } else {
        toast.error("Mã OTP không đúng hoặc đã hết hạn!");
      }
    } catch (error) {
      toast.error("Mã OTP không đúng hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_HOST}/account/resend-otp`,
        {
          email,
          type
        }
      );

      if (response.status === 200) {
        toast.success("Mã OTP mới đã được gửi đến email của bạn!");
        setTimer(60);
      } else {
        toast.error("Không thể gửi lại mã OTP. Vui lòng thử lại sau!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi lại OTP!");
    } finally {
      setLoading(false);
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
            <div className="form-items">
              <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
                Xác thực email
              </h3>
              <p style={{ textAlign: "center" }}>
                Mã OTP đã được gửi đến email {email}.
                <br />
                Vui lòng nhập mã OTP để hoàn tất đăng ký.
              </p>
              <form onSubmit={handleSubmit}>
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
                    className="ibtn btn-verify"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>
                        <i className="fa fa-spinner fa-spin"></i> Đang xác thực...
                      </span>
                    ) : (
                      "Xác thực"
                    )}
                  </button>
                </div>
              </form>

              <div className="resend-otp" style={{ textAlign: "center", marginTop: "15px" }}>
                <button
                  className="btn btn-link"
                  onClick={handleResendOtp}
                  disabled={timer > 0 || loading}
                >
                  {timer > 0
                    ? `Gửi lại mã OTP sau ${timer}s`
                    : "Gửi lại mã OTP"}
                </button>
              </div>

              <div className="page-links" style={{ textAlign: "center", marginTop: "15px" }}>
                <a href="/dang-nhap">Quay lại đăng nhập</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default VerifyOtpEmail; 