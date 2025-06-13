import React, { useEffect, useState } from "react";
import { isTokenExpired, refreshToken } from "../../util/fucntion/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useRefreshToken from "../../util/fucntion/useRefreshToken";

import "./Profile.css";
import DeleteAccount from "./ComponentProfile/DeleteAccount/DeleteAccount";


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

  // const userId = JSON.parse(localStorage.getItem("authData") || "{}").id;
  const getAuthData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      try {
        return JSON.parse(authData);
      } catch (error) {
        console.error("Error parsing authData:", error);
        return null;
      }
    }
    return null;
  };
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

  const [commentNotifications, setCommentNotifications] = useState<boolean>(true);
  const [courseUpdates, setCourseUpdates] = useState<boolean>(true);
  const [achievementNotifications, setAchievementNotifications] = useState<boolean>(true);
  const [promotions, setPromotions] = useState<boolean>(false);
  const [settingsLoading, setSettingsLoading] = useState<boolean>(false);

  // Add a new state for study reminders
  const [studyReminderEnabled, setStudyReminderEnabled] = useState<boolean>(false);
  const [studyReminderTime, setStudyReminderTime] = useState<string>("08:00");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const authData = getAuthData();
        const userId = authData?.id;
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
          `${process.env.REACT_APP_SERVER_HOST}/api/account/user/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.status === 200) {
            const data = result.data;
            setProfileData(data);

            setFullname(data.fullname || "");
            setEmail(data.email || "");
            setPhone(data.phone || "");
            setGender(data.gender || "Nam");
            setBirthday(data.birthday ? data.birthday.substring(0, 10) : "");
            setSelectedImage(data.image);
          } else {
            toast.error(result.message || "Lỗi khi tải dữ liệu hồ sơ");
          }
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
  }, []);

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
    const errors = [];

    // Kiểm tra mật khẩu hiện tại
    if (!currentPassword) {
      errors.push("Mật khẩu hiện tại không được để trống");
    } else {
      // Validate current password format if provided
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]{8,}$/;
      if (!passwordPattern.test(currentPassword)) {
        errors.push("Mật khẩu hiện tại không đúng định dạng yêu cầu");
      }
    }

    // Kiểm tra mật khẩu mới
    if (!newPassword) {
      errors.push("Mật khẩu mới không được để trống");
    } else {
      // Kiểm tra từng điều kiện riêng lẻ để thông báo rõ ràng hơn
      if (newPassword.length < 8) {
        errors.push("Mật khẩu mới phải có ít nhất 8 ký tự");
      }
      if (!/[A-Z]/.test(newPassword)) {
        errors.push("Mật khẩu mới phải chứa ít nhất 1 chữ hoa");
      }
      if (!/[a-z]/.test(newPassword)) {
        errors.push("Mật khẩu mới phải chứa ít nhất 1 chữ thường");
      }
      if (!/[0-9]/.test(newPassword)) {
        errors.push("Mật khẩu mới phải chứa ít nhất 1 chữ số");
      }
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) {
        errors.push("Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt");
      }
    }

    // Kiểm tra xác nhận mật khẩu
    if (!confirmPassword) {
      errors.push("Xác nhận mật khẩu không được để trống");
    } else if (confirmPassword !== newPassword) {
      errors.push("Mật khẩu mới và xác nhận không khớp");
    }

    // Hiển thị thông báo lỗi nếu có
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }

    return true;
  };

  const updateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let token = localStorage.getItem("authToken");
      const authData = getAuthData();
      const userId = authData?.id;
      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return;
        }
        localStorage.setItem("authToken", token);
      }

      const formData = new FormData();

      formData.append("fullname", fullname);
      formData.append("email", email);
      formData.append("phone", phone || "");
      formData.append("gender", gender);
      formData.append("birthday", `${birthday}T00:00:00`);

      if (selectedImage instanceof File) {
        formData.append("image", selectedImage);
      }

      console.log("Sending update request with data:", {
        fullname,
        email,
        phone,
        gender,
        birthday: `${birthday}T00:00:00`,
        selectedImage: selectedImage instanceof File ? "File selected" : "No file"
      });

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/account/update/${authData?.id}`,
        {
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        if (responseData.status === 200) {
          toast.success(responseData.message || "Cập nhật thành công!");

          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          toast.error(responseData.message || "Lỗi khi cập nhật hồ sơ!");
        }
      } else {
        toast.error(responseData.message || "Lỗi khi cập nhật hồ sơ!");
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast.error("Lỗi: " + (error.message || "Không thể cập nhật hồ sơ"));
    }
  };

  const changePassword = async () => {
    // Kiểm tra trước khi gọi API
    if (!currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (!newPassword) {
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (!confirmPassword) {
      toast.error("Vui lòng nhập xác nhận mật khẩu");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp");
      return;
    }

    // Kiểm tra định dạng mật khẩu mới
    if (newPassword.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast.error("Mật khẩu mới phải có ít nhất 1 chữ hoa");
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      toast.error("Mật khẩu mới phải có ít nhất 1 chữ thường");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      toast.error("Mật khẩu mới phải có ít nhất 1 chữ số");
      return;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) {
      toast.error("Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt");
      return;
    }

    // Tiếp tục gọi API nếu tất cả các điều kiện đều hợp lệ
    console.log("Password validation passed, proceeding with API call");
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
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
      const authData = getAuthData();
      const userId = authData?.id;
      console.log("Sending change password request", { userId });
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

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        if (responseData.status === 200) {
          toast.success(responseData.message || "Đổi mật khẩu thành công!");

          // Reset form fields after successful password change
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          toast.error(responseData.message || "Lỗi khi đổi mật khẩu");
        }
      } else {
        // Xử lý khi response không ok (status code nằm ngoài khoảng 200-299)
        toast.error(responseData.message || "Lỗi khi đổi mật khẩu. Vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("Change password error:", error);
      toast.error("Có lỗi xảy ra: " + (error.message || "Không thể đổi mật khẩu"));
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

  const updateNotificationSettings = async (
    notificationType: 'commentNotifications' | 'courseUpdates' | 'achievementNotifications' | 'promotions' | 'studyReminder',
    enabled: boolean
  ) => {
    try {
      const authData = getAuthData();
      if (!authData || !authData.id) {
        toast.error("Bạn cần đăng nhập để thay đổi cài đặt thông báo");
        return;
      }

      let token = localStorage.getItem("authToken");
      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return;
        }
        localStorage.setItem("authToken", token);
      }

      setSettingsLoading(true);

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/user-notifications-settings/account/${authData.id}/settings/${notificationType}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enabled }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update notification settings: ${response.status}`);
      }

      toast.success("Cập nhật cài đặt thông báo thành công");
      return await response.json();
    } catch (error) {
      console.error("Error updating notification settings:", error);
      toast.error("Lỗi khi cập nhật cài đặt thông báo");
      throw error;
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleToggleSetting = (
    settingType: 'commentNotifications' | 'courseUpdates' | 'achievementNotifications' | 'promotions' | 'studyReminder',
    newValue: boolean
  ) => {
    // Update UI immediately for responsiveness
    const settingSetters = {
      commentNotifications: setCommentNotifications,
      courseUpdates: setCourseUpdates,
      achievementNotifications: setAchievementNotifications,
      promotions: setPromotions,
      studyReminder: setStudyReminderEnabled
    };

    settingSetters[settingType](newValue);

    // Call API to update setting
    updateNotificationSettings(settingType, newValue)
      .catch(() => {
        // Revert UI state on error
        settingSetters[settingType](!newValue);
      });
  };

  const resetNotificationDefaults = () => {
    // Update UI immediately
    setCommentNotifications(true);
    setCourseUpdates(true);
    setAchievementNotifications(true);
    setPromotions(false);
    setStudyReminderEnabled(false);
    setStudyReminderTime("08:00");

    // Get user data
    const authData = getAuthData();
    if (!authData || !authData.id) {
      toast.error("Bạn cần đăng nhập để thay đổi cài đặt thông báo");
      return;
    }

    // Call API to update all settings
    setSettingsLoading(true);

    Promise.all([
      updateNotificationSettings('commentNotifications', true),
      updateNotificationSettings('courseUpdates', true),
      updateNotificationSettings('achievementNotifications', true),
      updateNotificationSettings('promotions', false),
      updateStudyReminderSettings(false, "08:00")
    ])
      .then(() => {
        toast.success("Đã đặt lại cài đặt mặc định");
      })
      .catch(error => {
        console.error("Error resetting notification settings:", error);
        toast.error("Lỗi khi đặt lại cài đặt mặc định");
      })
      .finally(() => {
        setSettingsLoading(false);
      });
  };

  // Add a function to update study reminder settings
  const updateStudyReminderSettings = async (enabled: boolean, time: string) => {
    try {
      const authData = getAuthData();
      if (!authData || !authData.id) {
        toast.error("Bạn cần đăng nhập để thay đổi cài đặt nhắc nhở");
        return;
      }

      let token = localStorage.getItem("authToken");
      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return;
        }
        localStorage.setItem("authToken", token);
      }

      setSettingsLoading(true);

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/user-notifications-settings/account/${authData.id}/settings/study-reminder`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enabled, reminderTime: time }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update study reminder settings: ${response.status}`);
      }

      toast.success("Cập nhật cài đặt nhắc nhở học tập thành công");
      return await response.json();
    } catch (error) {
      console.error("Error updating study reminder settings:", error);
      toast.error("Lỗi khi cập nhật cài đặt nhắc nhở học tập");
      throw error;
    } finally {
      setSettingsLoading(false);
    }
  };

  // Add a handler for study reminder toggle
  const handleStudyReminderToggle = (enabled: boolean) => {
    setStudyReminderEnabled(enabled);
    updateStudyReminderSettings(enabled, studyReminderTime)
      .catch(() => {
        // Revert UI state on error
        setStudyReminderEnabled(!enabled);
      });
  };

  // Add a handler for study reminder time change
  const handleStudyReminderTimeChange = (time: string) => {
    setStudyReminderTime(time);
    // Only update if reminder is enabled
    if (studyReminderEnabled) {
      updateStudyReminderSettings(studyReminderEnabled, time)
        .catch(() => {
          // Revert UI state on error
          setStudyReminderTime(studyReminderTime);
        });
    }
  };

  // Add a function to fetch all notification settings
  const fetchNotificationSettings = async () => {
    try {
      const authData = getAuthData();
      if (!authData || !authData.id) {
        toast.error("Bạn cần đăng nhập để xem cài đặt thông báo");
        return;
      }

      let token = localStorage.getItem("authToken");
      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return;
        }
        localStorage.setItem("authToken", token);
      }

      setSettingsLoading(true);

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/user-notifications-settings/account/${authData.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch notification settings: ${response.status}`);
      }

      const settings = await response.json();

      // Update all the settings states with the retrieved values
      if (settings) {
        // Update notification toggles
        setCommentNotifications(settings.commentNotifications || true);
        setCourseUpdates(settings.courseUpdates || true);
        setAchievementNotifications(settings.achievementNotifications || true);
        setPromotions(settings.promotions || false);

        // Update study reminder settings
        if (settings.studyReminder) {
          setStudyReminderEnabled(settings.studyReminder.enabled || false);
          setStudyReminderTime(settings.studyReminder.reminderTime || "08:00");
        }
      }
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      toast.error("Không thể tải cài đặt thông báo");
    } finally {
      setSettingsLoading(false);
    }
  };

  // Add a useEffect to fetch notification settings when the tab changes to "settingForm"
  useEffect(() => {
    if (activeTab === "settingForm") {
      fetchNotificationSettings();
    }
  }, [activeTab]);

  // Add a function to save all notification settings at once
  const saveAllNotificationSettings = async () => {
    const authData = getAuthData();
    if (!authData || !authData.id) {
      toast.error("Bạn cần đăng nhập để lưu cài đặt thông báo");
      return;
    }

    setSettingsLoading(true);

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

      // Prepare settings payload
      const settingsPayload = {
        commentNotifications,
        courseUpdates,
        achievementNotifications,
        promotions,
        studyReminder: {
          enabled: studyReminderEnabled,
          reminderTime: studyReminderTime
        }
      };

      // Send all settings in a single request
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/user-notifications-settings/account/${authData.id}/settings/all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settingsPayload)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save notification settings: ${response.status}`);
      }

      toast.success("Đã lưu tất cả cài đặt thông báo thành công!");
    } catch (error) {
      console.error("Error saving all notification settings:", error);
      toast.error("Lỗi khi lưu cài đặt thông báo");

      // Refresh settings to ensure UI is in sync with server
      await fetchNotificationSettings();
    } finally {
      setSettingsLoading(false);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  // ...existing code...
  return (
    <div className="profile-container">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Sidebar Settings Menu */}
      <aside className="settings-menu">
        <h2 className="settings-title">
          <i className="fas fa-cog"></i>
          <span>Cài đặt tài khoản</span>
        </h2>

        <nav>
          <ul className="settings-list">
            {[
              {
                id: "updateAccountForm",
                icon: "far fa-id-card",
                label: "Hồ sơ",
                form: "updateAccountForm",
              },
              {
                id: "changePasswordForm",
                icon: "fas fa-key",
                label: "Mật khẩu",
                form: "changePasswordForm",
              },
              // {
              //   id: "appearanceForm",
              //   icon: "fas fa-palette",
              //   label: "Cài đặt giao diện",
              //   form: "appearanceForm",
              // },
              {
                id: "privateFrom",
                icon: "fas fa-exclamation-triangle",
                label: "Cài đặt riêng tư",
                form: "privateFrom",
              },
              {
                id: "settingForm",
                icon: "fas fa-cog",
                label: "Cài đặt thông báo",
                form: "settingForm",
              },
            ].map((item) => (
              <li key={item.id} className="settings-itemm">
                <a
                  href="#"
                  className={`settings-link ${activeTab === item.form ? "active" : ""
                    }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabClick(item.form);
                  }}
                >
                  <i className={item.icon}></i> {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="settings-content-container">
        {activeTab === "updateAccountForm" && (
          <div className="settings-content">
            <div className="form-section">
              <h3 className="form-title">Thông tin cá nhân</h3>
              <div className="profile-grid">
                <div className="profile-info">
                  <div className="form-group">
                    <label htmlFor="email">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fullName">
                      Họ và tên <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      className="form-control"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">
                        Số điện thoại <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="gender">
                        Giới tính <span className="required">*</span>
                      </label>
                      <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="form-control"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dob">Ngày sinh</label>
                    <input
                      type="date"
                      id="dob"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="profile-avatar">
                  <div className="avatar-container">
                    {selectedImagePreview || profileData?.image ? (
                      <img
                        src={selectedImagePreview || profileData?.image}
                        alt="Ảnh đại diện"
                        className="avatar-preview"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        <i className="fas fa-user"></i>
                      </div>
                    )}
                    <label htmlFor="image" className="avatar-upload">
                      <i className="fas fa-camera"></i>
                      <input
                        type="file"
                        id="image"
                        onChange={handleImageChange}
                        hidden
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={updateProfile}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Change Form */}
        {activeTab === "changePasswordForm" && (
          <div className="settings-content-update">
            {" "}
            <div className="form-section">
              <h3 className="form-title">Đổi mật khẩu</h3>
              <div className="password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">
                    Mật khẩu hiện tại <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="form-control"
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">
                    Mật khẩu mới <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-control"
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    Xác nhận mật khẩu mới <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control"
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={changePassword}
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Delete Component */}
        {activeTab === "privateFrom" && (
          <div className="settings-content">
            {" "}
            <div className="form-section">
              {" "}
              <DeleteAccount userId={getAuthData()?.id} />
            </div>
          </div>
        )}

        {/* Setting Form */}
        {activeTab === "settingForm" && (
          <div className="settings-content-nor">
            {" "}
            <div className="form-section">
              <h3 className="form-title">Cài đặt thông báo</h3>

              <div className="settings-section">
                <h3 className="settings-section-title">
                  Tương tác và cập nhật
                </h3>

                <div className="settings-option">
                  <div className="settings-option-info">
                    <div className="settings-option-title">
                      Bình luận và phản hồi
                    </div>
                    <div className="settings-option-description">
                      Thông báo khi có người phản hồi bình luận hoặc bài đăng
                      của bạn
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={commentNotifications}
                      onChange={(e) => handleToggleSetting('commentNotifications', e.target.checked)}
                      disabled={settingsLoading}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-option">
                  <div className="settings-option-info">
                    <div className="settings-option-title">
                      Cập nhật khóa học
                    </div>
                    <div className="settings-option-description">
                      Thông báo khi có nội dung mới hoặc thay đổi trong khóa học
                      của bạn
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={courseUpdates}
                      onChange={(e) => handleToggleSetting('courseUpdates', e.target.checked)}
                      disabled={settingsLoading}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h3 className="settings-section-title">Thành tích và ưu đãi</h3>

                <div className="settings-option">
                  <div className="settings-option-info">
                    <div className="settings-option-title">
                      Thông báo thành tích
                    </div>
                    <div className="settings-option-description">
                      Thông báo khi bạn đạt được thành tích hoặc mốc học tập mới
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={achievementNotifications}
                      onChange={(e) => handleToggleSetting('achievementNotifications', e.target.checked)}
                      disabled={settingsLoading}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="settings-option">
                  <div className="settings-option-info">
                    <div className="settings-option-title">
                      Khuyến mãi và ưu đãi
                    </div>
                    <div className="settings-option-description">
                      Thông báo về các ưu đãi, giảm giá và sự kiện đặc biệt
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={promotions}
                      onChange={(e) => handleToggleSetting('promotions', e.target.checked)}
                      disabled={settingsLoading}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-section">
                <h3 className="settings-section-title">Cài đặt giờ nhắc học</h3>

                <div className="settings-option">
                  <div className="settings-option-info">
                    <div className="settings-option-title">
                      Nhắc nhở học tập hàng ngày
                    </div>
                    <div className="settings-option-description">
                      Nhận thông báo nhắc nhở học tập vào thời gian bạn chọn mỗi ngày
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={studyReminderEnabled}
                      onChange={(e) => handleStudyReminderToggle(e.target.checked)}
                      disabled={settingsLoading}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {studyReminderEnabled && (
                  <div className="settings-option time-option">
                    <div className="settings-option-info">
                      <div className="settings-option-title">
                        Thời gian nhắc nhở
                      </div>
                      <div className="settings-option-description">
                        Chọn thời gian bạn muốn nhận thông báo nhắc nhở
                      </div>
                    </div>
                    <div className="time-picker">
                      <input
                        type="time"
                        value={studyReminderTime}
                        onChange={(e) => handleStudyReminderTimeChange(e.target.value)}
                        disabled={settingsLoading}
                        className="form-control time-input"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="settings-actions">
                <button
                  className="btn btn-primary"
                  onClick={saveAllNotificationSettings}
                  disabled={settingsLoading}
                >
                  {settingsLoading ? "Đang lưu..." : "Lưu cài đặt"}
                </button>
                <button
                  className="reset-defaults-button-2"
                  onClick={resetNotificationDefaults}
                  disabled={settingsLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z" />
                    <path
                      fillRule="evenodd"
                      d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                    />
                  </svg>
                  {settingsLoading ? "Đang đặt lại..." : "Đặt lại mặc định"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;
