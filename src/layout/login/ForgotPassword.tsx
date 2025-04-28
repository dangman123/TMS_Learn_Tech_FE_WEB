import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/assetsLogin/css/fontawesome-all.min.css";
import "../../assets/assetsLogin/css/iofrm-style.css";
import "../../assets/assetsLogin/css/iofrm-theme19.css";
import { ToastContainer, toast } from "react-toastify"; // Để hiển thị thông báo
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>(""); // State để lưu email
  const [isSent, setIsSent] = useState<boolean>(false);

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
      toast.success("Mật khẩu reset đã được gửi tới Email của bạn !");
    } catch (error) {
      toast.error("Xảy ra lỗi ! Vui lòng thử lại sau !");
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
            {!isSent ? (
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
                      Gửi liên kết đặt lại
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="form-sent">
                <div className="tick-holder">
                  <div className="tick-icon"></div>
                </div>
                <h3>Đã gửi liên kết mật khẩu</h3>
                <p>Vui lòng kiểm tra hộp thư đến của bạn {email}</p>
                <div className="info-holder">
                  <span>
                    Bạn không chắc địa chỉ email đó có chính xác không?
                  </span>
                  <a href="#">Chúng tôi có thể giúp</a>.
                </div>
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
