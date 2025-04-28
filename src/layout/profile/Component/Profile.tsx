import React, { useEffect, useState } from "react";
import { isTokenExpired, refreshToken } from "../../util/fucntion/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import Streak from "./ComponentProfile/Streak/Streak";
import Upgrade from "./ComponentProfile/UpgradeAccount/Upgrade";
import "./Profile.css";
interface ProfileData {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  image: string;
  gender: string;
  birthday: Date;
  created_at: Date;
  updated_at: Date;
  roleId: number;
}

function Profile() {
  const [activeTab, setActiveTab] = useState<string>("updateAccountForm");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUpgradePopupVisible, setIsUpgradePopupVisible] =
    useState<boolean>(false);

  const refresh = useRefreshToken();
  const openUpgradePopup = () => {
    setIsUpgradePopupVisible(true);
  };

  const closeUpgradePopup = () => {
    setIsUpgradePopupVisible(false);
  };

  const userId = JSON.parse(localStorage.getItem("authData") || "{}").id;
  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [gender, setGender] = useState<string>("Nam");
  const [birthday, setBirthday] = useState<string>("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [selectedImagePreview, setSelectedImagePreview] = useState<
    string | null
  >(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let token = localStorage.getItem("authToken");

        if (isTokenExpired(token)) {
          token = await refresh();
          if (!token) {
            window.location.href = "/dang-nhap";
            return;
          }
          localStorage.setItem("authToken", token);
        }

        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/account/profile/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);

          setFullname(data.fullname);
          setEmail(data.email);
          setPhone(data.phone);
          setGender(data.gender);
          setBirthday(data.birthday ? data.birthday.substring(0, 10) : "");
          setSelectedImage(data.image);
          setLoading(false);
        } else {
          console.error("Lỗi khi tải dữ liệu hồ sơ");
          setLoading(false);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu hồ sơ", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const validateForm = () => {
    if (!fullname) {
      toast.error("Họ và tên không được để trống.");
      return false;
    }
    if (!email) {
      toast.error("Email không được để trống.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Email không hợp lệ.");
      return false;
    }
    if (!phone) {
      toast.error("Số điện thoại không được để trống.");
      return false;
    }
    if (!birthday) {
      toast.error("Ngày sinh không được để trống");
      return false;
    }

    return true;
  };

  const validatePassword = () => {
    if (!currentPassword) {
      toast.error("Mật khẩu cũ không được để trống.");
      return false;
    }

    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
    if (!passwordPattern.test(currentPassword)) {
      toast.error(
        "Mật khẩu cũ phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
      return false;
    }

    if (!newPassword) {
      toast.error("Mật khẩu mới không được để trống.");
      return false;
    }
    if (!passwordPattern.test(newPassword)) {
      toast.error(
        "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
      return false;
    }

    if (!confirmPassword) {
      toast.error("Mật khẩu xác nhận không được để trống.");
      return false;
    }
    if (!passwordPattern.test(confirmPassword)) {
      toast.error(
        "Mật khẩu xác nhận phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp!");
      return;
    }
    return true;
  };

  const updateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refreshToken();
        if (!token) {
          window.location.href = "/dang-nhap";
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const formData = new FormData();

      formData.append("fullname", fullname);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("gender", gender);
      formData.append("birthday", `${birthday}T00:00:00`);

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/account/update/${userId}`,
        {
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Cập nhật thành công !");

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error("Lỗi khi cập nhật hồ sơ !");
      }
    } catch (error: any) {
      toast.error("Lỗi: " + error);
    }
  };

  const changePassword = async () => {
    if (!validatePassword()) {
      return;
    }
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refreshToken();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }
    const passwordData = {
      currentPassword,
      newPassword,
      confirmPassword,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/account/change-password/${userId}`,
        {
          method: "PUT",
          body: JSON.stringify(passwordData),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Đổi mật khẩu thành công!");
      } else {
        const errorText = await response.text();
        toast.error(`Lỗi: ${errorText}`);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại sau.");
    }
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImagePreview(URL.createObjectURL(file));
      setSelectedImage(file);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="profile-container" id="updateAccountContent">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <a
            className={`nav-link ${
              activeTab === "updateAccountForm" ? "active" : ""
            }`}
            aria-current="page"
            href="#"
            onClick={() => handleTabClick("updateAccountForm")}
          >
            Cập nhật tài khoản
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${
              activeTab === "changePasswordForm" ? "active" : ""
            }`}
            aria-current="page"
            href="#"
            onClick={() => handleTabClick("changePasswordForm")}
          >
            Đổi mật khẩu
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${
              activeTab === "attendanceForm" ? "active" : ""
            }`}
            aria-current="page"
            href="#"
            onClick={() => handleTabClick("attendanceForm")}
          >
            Điểm danh
          </a>
        </li>
        <button className="nav-link upgrade-button" onClick={openUpgradePopup}>
          Nâng cấp gói
        </button>
      </ul>

      {activeTab === "updateAccountForm" && (
        <div
          id="updateAccountForm"
          className="form-container"
          style={{
            maxWidth: "900px",
            marginLeft: "100px",
            marginTop: "50px",
          }}
        >
          <div className="row">
            <div className="col-md-8">
              <div className="form-group">
                <label htmlFor="email">
                  Email<span style={{ color: "red" }}>*</span>:
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly
                  disabled
                />
                {errors.email && <p className="text-danger">{errors.email}</p>}
              </div>
              <div className="form-group">
                <label htmlFor="fullName">
                  Họ và tên<span style={{ color: "red" }}>*</span>:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="fullName"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
                {errors.fullname && (
                  <p className="text-danger">{errors.fullname}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Số điện thoại<span style={{ color: "red" }}>*</span>:
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && <p className="text-danger">{errors.phone}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="dob">Ngày sinh:</label>
                <input
                  type="date"
                  className="form-control"
                  id="dob"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
                {errors.birthday && (
                  <p className="text-danger">{errors.birthday}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="gender">
                  Giới tính<span style={{ color: "red" }}>*</span>:
                </label>
                <select
                  className="form-control"
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option>Nam</option>
                  <option>Nữ</option>
                  <option>Khác</option>
                </select>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={updateProfile}
              >
                Lưu thông tin
              </button>
            </div>

            <div className="col-md-4 text-center">
              <div className="form-group">
                <label>Ảnh đại diện</label>
                {selectedImagePreview || profileData?.image ? (
                  <div>
                    <img
                      src={selectedImagePreview || profileData?.image}
                      alt="Ảnh đại diện"
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        marginBottom: "15px",
                      }}
                    />
                  </div>
                ) : (
                  <p>Chưa có ảnh đại diện</p>
                )}
              </div>

              <div className="form-group">
                <label>Chọn ảnh mới</label>
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "changePasswordForm" && (
        <div
          id="changePasswordForm"
          className="form-container"
          style={{
            maxWidth: "700px",
            marginLeft: "100px",
            marginTop: "50px",
          }}
        >
          <h4 style={{ color: "brown" }}>Đổi mật khẩu</h4>
          <div className="form-group" style={{ marginTop: "10px" }}>
            <label htmlFor="currentPassword">
              Mật khẩu hiện tại<span style={{ color: "red" }}>*</span>:
            </label>
            <input
              type="password"
              className="form-control"
              autoComplete="new-password"
              id="currentPasswordInput"
              name="currentPasswordInput"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginTop: "10px" }}>
            <label htmlFor="newPassword">
              Mật khẩu mới<span style={{ color: "red" }}>*</span>:
            </label>
            <input
              type="password"
              className="form-control"
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginTop: "10px" }}>
            <label htmlFor="confirmPassword">
              Xác nhận mật khẩu mới<span style={{ color: "red" }}>*</span>:
            </label>
            <input
              type="password"
              className="form-control"
              autoComplete="new-password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: "20px" }}
            onClick={changePassword}
          >
            Đổi mật khẩu
          </button>
        </div>
      )}

      {activeTab === "attendanceForm" && (
        <div
          id="attendanceForm"
          className="form-container"
          style={{
            maxWidth: "900px",
            marginLeft: "100px",
            marginTop: "50px",
          }}
        >
          <Streak />
        </div>
      )}
      {/* Popup Nâng cấp gói */}
      {isUpgradePopupVisible && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-button" onClick={closeUpgradePopup}>
              &times;
            </button>
            <Upgrade />
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
