import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/assetsLogin/css/fontawesome-all.min.css";
import "../../assets/assetsLogin/css/iofrm-style.css";
import "../../assets/assetsLogin/css/iofrm-theme19.css";
import { useNavigate } from "react-router-dom";
import { POST_ACCOUNT_REGISTER } from "../../api/api";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify và toast
import "react-toastify/dist/ReactToastify.css";
import { database } from "../util/fucntion/firebaseConfig";
import { ref, set } from "firebase/database";
import { Phone } from "react-bootstrap-icons";
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.fullname.trim()) {
      toast.error("Họ và tên không được để trống!");
      return false;
    }

    if (!formData.email) {
      toast.error("Email không được để trống!");
      return false;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        toast.error("Email không đúng định dạng!");
        return false;
      }
    }

    if (!formData.birthday) {
      toast.error("Ngày sinh không được để trống!");
      return false;
    } else {
      const today = new Date();
      const birthDate = new Date(formData.birthday);
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
        toast.error(`Người dùng phải ít nhất ${MINIMUM_AGE} tuổi để đăng ký!`);
        return false;
      }
      const MAXIMUM_AGE = 80;
      if (age > MAXIMUM_AGE) {
        toast.error(`Tuổi không được lớn hơn ${MAXIMUM_AGE}!`);
        return false;
      }
      if (birthDate >= today) {
        toast.error("Ngày sinh không hợp lệ!");
        return false;
      }
    }

    if (!formData.phone) {
      toast.error("Số điện thoại không được để trống!");
      return false;
    } else {
      const phonePattern =
        /^(032|033|034|035|036|037|038|039|081|082|083|084|085|070|076|077|078|079|056|058|059|087)\d{7}$/;
      if (!phonePattern.test(formData.phone)) {
        toast.error(
          "Số điện thoại không hợp lệ! Vui lòng nhập đúng định dạng 10 số với đầu số hợp lệ."
        );
        return false;
      }
    }

    if (!formData.password) {
      toast.error("Mật khẩu không được để trống!");
      return false;
    } else {
      const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

      if (!passwordPattern.test(formData.password)) {
        toast.error(
          "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt!"
        );
        return false;
      }
    }
    return true;
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (validate()) {
  //     setLoading(true);
  //     try {
  //       // const response = await fetch(POST_ACCOUNT_REGISTER, {
  //       const response = await fetch(
  //         `${process.env.REACT_APP_SERVER_HOST}/account/register-generate`,
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({
  //             ...formData,
  //             birthday: new Date(formData.birthday).toISOString(), // Chuyển ngày sinh thành chuỗi ISO
  //           }),
  //         }
  //       );

  //       if (response.ok) {
  //         const data = await response.text();

  //         // await pushUserToFirebase({
  //         //   id: data.accountID,
  //         //   fullname: data.fullname,
  //         //   birthday: data.birthday,
  //         //   email: data.email,
  //         //   image: "",
  //         //   phone: Number(data.phone),
  //         //   role: "USER",
  //         // });

  //         toast.success(
  //           "Đăng ký thành công! Vui lòng nhập mã OTP gửi đến mail của bạn! "
  //         );
  //         setTimeout(() => {
  //           navigate("/verify-otp-email", { state: { email: formData.email } });
  //         }, 2500);
  //       } else {
  //         toast.error("Có lỗi xảy ra trong quá trình đăng ký !");
  //       }
  //     } catch (error: any) {
  //       toast.error("Có lỗi xảy ra:", error);
  //     } finally {
  //       setLoading(false); // Tắt trạng thái chờ
  //     }
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      navigate("/dang-ky-method", { state: { data: formData } });
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        <div className="form-holder">
          <div className="form-content">
            <div className="form-items">
              <h3 style={{ marginBottom: "50px", textAlign: "center" }}>
                Đăng kí tài khoản mới
              </h3>

              <form onSubmit={handleSubmit}>
                <input
                  className="form-control"
                  type="text"
                  name="fullname"
                  placeholder="Họ và tên"
                  value={formData.fullname}
                  onChange={handleChange}
                />
                {errors.fullname && (
                  <small className="error-message">{errors.fullname}</small>
                )}

                <input
                  className="form-control"
                  type="email"
                  name="email"
                  placeholder="Email"
                  autoComplete="new-email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <small className="error-message">{errors.email}</small>
                )}

                <input
                  className="form-control"
                  type="date"
                  name="birthday"
                  placeholder="Ngày sinh"
                  value={formData.birthday}
                  onChange={handleChange}
                />
                {errors.birthday && (
                  <small className="error-message">{errors.birthday}</small>
                )}

                <input
                  className="form-control"
                  type="tel"
                  name="phone"
                  placeholder="Số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && (
                  <small className="error-message">{errors.phone}</small>
                )}
                <div
                  className="password-wrapper"
                  style={{ position: "relative" }}
                >
                  <input
                    className="form-control"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
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
                {errors.password && (
                  <small className="error-message">{errors.password}</small>
                )}

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
              <div className="other-links">
                <div className="text">Hoặc đăng ký</div>
                {/* <a href="#">
                  <i className="fab fa-facebook-f"></i>Facebook
                </a> */}
                <a href="#">
                  <i className="fab fa-google"></i>Google
                </a>
              </div>
              <div className="page-links">
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
