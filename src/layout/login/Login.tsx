import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/assetsLogin/css/fontawesome-all.min.css";
import "../../assets/assetsLogin/css/iofrm-style.css";
import "../../assets/assetsLogin/css/iofrm-theme19.css";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { POST_ACCOUNT_LOGIN } from "../../api/api";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify và toast
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import { Client, Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  isAdmin: boolean;
  isTeacher: boolean;
  isUser: boolean;
  isHuitStudent: boolean;
}
const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  
  const listenAndSendLoginData = (accountId:number) => {
    // Bạn có thể gửi sự kiện qua WebSocket hoặc API để ghi lại hành động
    const socket = new SockJS(`${process.env.REACT_APP_SERVER_HOST}/ws`);
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame: any) {  // Hoặc 'string' nếu bạn muốn chỉ định kiểu chuỗi
      console.log('WebSocket connected: ' + frame);

      // Gửi sự kiện đăng nhập qua WebSocket
      const data = {
        activityType: 'login',
        accountId: accountId,
        timestamp: new Date().toISOString(),
      };
      stompClient.send("/app/login", {}, JSON.stringify(data));
    });

  };
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(POST_ACCOUNT_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username, password: password }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("authToken", data.jwt);
        localStorage.setItem("authData", JSON.stringify(data.responsiveDTOJWT));
        localStorage.setItem("refreshToken", data.refreshToken);
        toast.success("Đăng nhập thành công !");

        setTimeout(() => {
          if (!data.jwt) {
            navigate("/dang-nhap");
            return;
          } else {

            listenAndSendLoginData(data.responsiveDTOJWT.id);

            const decodedToken = jwtDecode(data.jwt) as JwtPayload;
            const isAdmin = decodedToken.isAdmin;
            const isTeacher = decodedToken.isTeacher;
            if (isAdmin || isTeacher) {
              navigate("/admin");
              return;
            } else {
              navigate("/");
              return;
            }
          }
        }, 2500);
      } else {
        const data = await response.text();
        toast.error(data);
      }
    } catch (error) {
      toast.error(
        "Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau."
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const googleLogin = () => {
    // Chuyển hướng người dùng đến endpoint OAuth2 của backend
    window.location.href = `${process.env.REACT_APP_SERVER_HOST}/oauth2/authorization/google`;
  };
  return (
    <div className="form-body without-side">
      <div className="row">
        <div className="img-holder">
          <div className="bg"></div>
          <div className="info-holder">
            <img
              src="../../assets/assetsLogin/images/graphic3.svg"
              alt=""
            ></img>
          </div>
        </div>
        <div className="form-holder">
          <div className="form-content">
            <div className="form-items">
              <h3 style={{ marginBottom: "50px", textAlign: "center" }}>
                Đăng nhập tài khoản
              </h3>
              <form onSubmit={handleLogin}>
                <input
                  className="form-control"
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Email"
                  required
                ></input>
                <div
                  className="password-wrapper"
                  style={{ position: "relative" }}
                >
                  <input
                    className="form-control"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
                  <span
                    className="toggle-password"
                    onClick={togglePasswordVisibility}
                    style={{
                      cursor: "pointer",
                      position: "absolute",
                      right: "10px",
                      top: "40%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    {showPassword ? (
                      <i className="fa-solid fa-eye-slash"></i>
                    ) : (
                      <i className="fa-solid fa-eye"></i>
                    )}
                  </span>
                </div>

                <div className="form-button">
                  <button id="submit" type="submit" className="ibtn">
                    Login
                  </button>
                  <a href="/forgot-password" className="btn-forget">
                    Quên mật khẩu?
                  </a>
                </div>
              </form>
              <div className="other-links">
                <div className="text">Hoặc đăng nhập</div>

                <a href="#" onClick={googleLogin}>
                  <i className="fab fa-google"></i>Google
                </a>
              </div>
              <div className="page-links">
                <a href="/dang-ky">Đăng kí tài khoản mới</a>
              </div>
            </div>
            <div className="form-sent">Form Sent</div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
