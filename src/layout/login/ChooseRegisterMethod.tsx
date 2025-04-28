import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify và toast
import "react-toastify/dist/ReactToastify.css";
const ChooseRegisterMethod: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const formData = location.state?.data || {};
  const email = formData.email || "Chưa có email";
  const phone = formData.phone || "Chưa có số điện thoại";


  const handleChoice = async (method: "email" | "phone") => {
    if (!formData.email && method === "email") {
      toast.error("Email không tồn tại! Vui lòng kiểm tra lại.");
      return;
    }

    if (!formData.phone && method === "phone") {
      toast.error("Số điện thoại không tồn tại! Vui lòng kiểm tra lại.");
      return;
    }

    if (method === "email") {
      setLoading(true);
      try {
        // const response = await fetch(POST_ACCOUNT_REGISTER, {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/account/register-generate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...formData,
              birthday: new Date(formData.birthday).toISOString(), // Chuyển ngày sinh thành chuỗi ISO
            }),
          }
        );

        if (response.ok) {
          const data = await response.text();

          // await pushUserToFirebase({
          //   id: data.accountID,
          //   fullname: data.fullname,
          //   birthday: data.birthday,
          //   email: data.email,
          //   image: "",
          //   phone: Number(data.phone),
          //   role: "USER",
          // });

          toast.success(
            "Đăng ký thành công! Vui lòng nhập mã OTP gửi đến mail của bạn! "
          );
          setTimeout(() => {
            navigate("/verify-otp-email", {
              state: { email: formData.email },
            });
          }, 2500);
        } else {
          toast.error("Có lỗi xảy ra trong quá trình đăng ký !");
        }
      } catch (error: any) {
        toast.error("Có lỗi xảy ra:", error);
      } finally {
        setLoading(false); // Tắt trạng thái chờ
      }
    }
    else {
      setLoading(true);
      try {
        // const response = await fetch(POST_ACCOUNT_REGISTER, {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/account/register-generate-sms`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...formData,
              birthday: new Date(formData.birthday).toISOString(), // Chuyển ngày sinh thành chuỗi ISO
            }),
          }
        );

        if (response.ok) {
          const data = await response.text();

          // await pushUserToFirebase({
          //   id: data.accountID,
          //   fullname: data.fullname,
          //   birthday: data.birthday,
          //   email: data.email,
          //   image: "",
          //   phone: Number(data.phone),
          //   role: "USER",
          // });
          toast.success(
            "Đăng ký thành công! Vui lòng nhập mã OTP gửi đến SMS của bạn! "
          );
          setTimeout(() => {
            navigate("/verify-otp-sms", {
              state: { phone: formData.phone, otp: data },
            });
          }, 2500);
        } else {
          toast.error("Có lỗi xảy ra trong quá trình đăng ký !");
        }
      } catch (error: any) {
        toast.error("Có lỗi xảy ra:", error);
      } finally {
        setLoading(false); // Tắt trạng thái chờ
      }
    }
  };

  return (
    <div className="choose-method-container">
      <h3>Chọn phương thức xác thực</h3>
      <div className="method-buttons">
        <label htmlFor="email">
          <strong>Email:</strong> {email}
        </label>
        <button
          className="btn btn-primary"
          onClick={() => handleChoice("email")}
          disabled={loading || !formData.email}
        >
          {loading && formData.email ? "Đang xử lý..." : "Xác thực bằng Email"}
        </button>

        {/* <label htmlFor="phone">
          <strong>Số điện thoại:</strong> {phone}
        </label>
        <button
          className="btn btn-secondary"
          onClick={() => handleChoice("phone")}
          disabled={loading || !formData.phone}
        >
          {loading && formData.phone
            ? "Đang xử lý..."
            : "Xác thực bằng Số điện thoại"}
        </button> */}
      </div>
      <ToastContainer />
    </div>
  );
};

export default ChooseRegisterMethod;
