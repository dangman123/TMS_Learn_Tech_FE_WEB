import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const location = useLocation();
  const email = location.state?.email || "";
  const validatePassword = () => {
    if (!password) {
      toast.error("Mật khẩu cũ không được để trống.");
      return false;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
    if (!passwordPattern.test(password)) {
      toast.error(
        "Mật khẩu cũ phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
      return false;
    }
    return true;
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_SERVER_HOST}/api/account/reset-password`, {
        email,
        password,
      });
      toast.success("Cập nhật mật khẩu mới thành công !");
      setTimeout(() => {
        window.location.href = "/dang-nhap";
      }, 2500);
    } catch (error) {
      toast.error("Lỗi cập nhật không thành công !");
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
                Mật khẩu mới
              </h3>
              <p style={{ textAlign: "center" }}>Vui lòng nhập mật khẩu mới!</p>
              <form onSubmit={handleSubmit}>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                />
                <div className="form-button full-width">
                  <button id="submit" type="submit" className="ibtn btn-forget">
                    Xác nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default ResetPassword;
