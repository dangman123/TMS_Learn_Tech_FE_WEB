import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/assetsLogin/css/fontawesome-all.min.css";
import "../../assets/assetsLogin/css/iofrm-style.css";
import "../../assets/assetsLogin/css/iofrm-theme19.css";
import { useNavigate } from "react-router-dom";
import { POST_ACCOUNT_REGISTER } from "../../api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { database } from "../util/fucntion/firebaseConfig";
import { ref, set } from "firebase/database";
import { Phone } from "react-bootstrap-icons";
import "./register.css";
import { sendActionActivity } from "../../service/WebSocketActions";
interface account {
  id: number;
  email: string;
  fullname: string;
  birthday: Date;
  image: string;
  role: string;
  phone: number;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    birthday: "",
    password: "",
    createdAt: null,
    updatedAt: null,
    roleId: process.env.REACT_APP_ROLE_USER,
  });

  const [errors, setErrors] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    birthday: "",
  });

  const [touched, setTouched] = useState({
    fullname: false,
    email: false,
    phone: false,
    password: false,
    birthday: false,
  });

  const pushUserToFirebase = async (account: account) => {
    try {
      const userData = {
        fullname: account.fullname,
        email: account.email,
        phone: account.phone,
        image: account.image || "",
        status: "offline",
        role: "USER",
      };

      const userRef = ref(database, `users/${account.id}`);

      await set(userRef, userData);

      console.log("User đã được đẩy lên Firebase:", userData);
    } catch (error) {
      console.error("Lỗi khi đẩy user lên Firebase:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Kiểm tra lỗi khi người dùng nhập
    if (touched[name as keyof typeof touched]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "fullname":
        if (!value.trim()) {
          error = "Họ và tên không được để trống!";
        }
        break;

      case "email":
        if (!value) {
          error = "Email không được để trống!";
        } else {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(value)) {
            error = "Email không đúng định dạng!";
          }
        }
        break;

      case "birthday":
        if (!value) {
          error = "Ngày sinh không được để trống!";
        } else {
          const today = new Date();
          const birthDate = new Date(value);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDifference = today.getMonth() - birthDate.getMonth();
          if (
            monthDifference < 0 ||
            (monthDifference === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          const MINIMUM_AGE = 10;
          if (age < MINIMUM_AGE) {
            error = `Người dùng phải ít nhất ${MINIMUM_AGE} tuổi để đăng ký!`;
          }
          const MAXIMUM_AGE = 80;
          if (age > MAXIMUM_AGE) {
            error = `Tuổi không được lớn hơn ${MAXIMUM_AGE}!`;
          }
          if (birthDate >= today) {
            error = "Ngày sinh không hợp lệ!";
          }
        }
        break;

      case "phone":
        if (!value) {
          error = "Số điện thoại không được để trống!";
        } else {
          const phonePattern =
            /^(032|033|034|035|036|037|038|039|081|082|083|084|085|070|076|077|078|079|056|058|059|087)\d{7}$/;
          if (!phonePattern.test(value)) {
            error =
              "Số điện thoại không hợp lệ! Vui lòng nhập đúng định dạng 10 số với đầu số hợp lệ.";
          }
        }
        break;

      case "password":
        if (!value) {
          error = "Mật khẩu không được để trống!";
        } else {
          const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
          if (!passwordPattern.test(value)) {
            error =
              "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!";
          }
        }
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return error;
  };

  const validate = () => {
    let isValid = true;
    const newErrors = {
      fullname: validateField("fullname", formData.fullname),
      email: validateField("email", formData.email),
      birthday: validateField("birthday", formData.birthday),
      phone: validateField("phone", formData.phone),
      password: validateField("password", formData.password),
    };

    setErrors(newErrors);

    // Kiểm tra xem có lỗi nào không
    Object.values(newErrors).forEach((error) => {
      if (error) {
        isValid = false;
        toast.error(error);
      }
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Đánh dấu tất cả các trường đã được chạm vào
    setTouched({
      fullname: true,
      email: true,
      phone: true,
      password: true,
      birthday: true,
    });

    if (validate()) {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/account/register-generate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fullname: formData.fullname,
              email: formData.email,
              password: formData.password,
              phone: formData.phone,
              birthday: formData.birthday + " 00:00:00"
            }),
          }
        );

        if (response.ok) {
          toast.success("Mã OTP đã được gửi đến email của bạn!");
          navigate("/verify-otp-email", {
            state: { email: formData.email, type: "REGISTER" }
          });
        } else {
          const errorText = await response.text();
          toast.error(errorText || "Có lỗi xảy ra trong quá trình đăng ký!");
        }
      } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        toast.error("Có lỗi xảy ra khi kết nối đến máy chủ!");
      } finally {
        setLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Styles
  const errorMessageStyle = {
    color: "red",
    fontSize: "12px",
    marginTop: "5px",
    marginBottom: "10px",
    display: "block",
  };

  const inputStyle = (hasError: boolean) => ({
    borderColor: hasError ? "red" : "",
  });

  return (
    <div className="form-body without-side">
      <div className="row">
        <div className="img-holder">
          <div className="bg"></div>
          <div className="info-holder">
            <img src="../../assets/assetsLogin/images/graphic3.svg" alt="" />
          </div>
        </div>
        <div className="form-holder">
          <div className="form-content">
            <div className="form-items">
              <h3 style={{ marginBottom: "50px", textAlign: "center" }}>
                Đăng kí tài khoản mới
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <div className="input-with-star">
                    <input
                      className="form-control"
                      type="text"
                      name="fullname"
                      placeholder="Họ và tên *"
                      value={formData.fullname}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={inputStyle(!!errors.fullname && touched.fullname)}
                    />
                  </div>
                  {errors.fullname && touched.fullname && (
                    <small style={errorMessageStyle}>{errors.fullname}</small>
                  )}
                </div>

                <div className="form-group">
                  <div className="input-with-star">
                    <input
                      className="form-control"
                      type="email"
                      name="email"
                      placeholder="Email *"
                      autoComplete="new-email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={inputStyle(!!errors.email && touched.email)}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <small style={errorMessageStyle}>{errors.email}</small>
                  )}
                </div>

                <div className="form-group">
                  <div className="input-with-star">
                    <input
                      className="form-control"
                      type="date"
                      name="birthday"
                      placeholder="Ngày sinh *"
                      value={formData.birthday}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={inputStyle(!!errors.birthday && touched.birthday)}
                    />
                  </div>
                  {errors.birthday && touched.birthday && (
                    <small style={errorMessageStyle}>{errors.birthday}</small>
                  )}
                </div>

                <div className="form-group">
                  <div className="input-with-star">
                    <input
                      className="form-control"
                      type="tel"
                      name="phone"
                      placeholder="Số điện thoại *"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={inputStyle(!!errors.phone && touched.phone)}
                    />
                  </div>
                  {errors.phone && touched.phone && (
                    <small style={errorMessageStyle}>{errors.phone}</small>
                  )}
                </div>

                <div className="form-group">
                  <div
                    className="password-wrapper"
                    style={{ position: "relative" }}
                  >
                    <input
                      className="form-control"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Mật khẩu *"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="new-password"
                      style={inputStyle(!!errors.password && touched.password)}
                    />
                    <span
                      className="toggle-password"
                      onClick={togglePasswordVisibility}
                      style={{
                        cursor: "pointer",
                        position: "absolute",
                        right: "10px",
                        top: "50%",
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
                  {errors.password && touched.password && (
                    <small style={errorMessageStyle}>{errors.password}</small>
                  )}
                </div>

                <div className="form-button">
                  <button
                    id="submit"
                    type="submit"
                    className="ibtn"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>
                        <i className="fa fa-spinner fa-spin"></i> Đang đăng
                        ký...
                      </span>
                    ) : (
                      "Đăng Ký"
                    )}
                  </button>
                </div>
              </form>

              <div className="page-links" style={{ marginTop: "20px" }}>
                <a href="/dang-nhap">Bạn đã có tài khoản ?</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Register;
