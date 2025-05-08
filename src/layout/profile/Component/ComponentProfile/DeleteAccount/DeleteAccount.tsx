import React, { useState } from "react";
import useRefreshToken from "../../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../../util/fucntion/auth";
import "./DeleteAccount.css";

interface DeleteAccountProps {
  userId: number;
}

const DeleteAccount: React.FC<DeleteAccountProps> = ({ userId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const refresh = useRefreshToken();

  const openModal = () => {
    setIsModalOpen(true);
    setPassword("");
    setError("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPassword("");
    setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError("");
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      setError("Vui lòng nhập mật khẩu của bạn");
      return;
    }

    setLoading(true);
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/accounts/delete/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      if (response.ok) {
        // Xóa tài khoản thành công
        localStorage.removeItem("authToken");
        localStorage.removeItem("authData");
        alert("Tài khoản đã được xóa thành công!");
        window.location.href = "/"; // Chuyển hướng về trang chủ
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Mật khẩu không chính xác");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setError("Đã xảy ra lỗi khi xóa tài khoản. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-account-section">
      <div className="danger-zone">
        <h4>Khu vực nguy hiểm</h4>
        <p>
          Khi xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và không
          thể khôi phục.
        </p>
        <button
          className="btn btn-danger delete-account-btn"
          onClick={openModal}
        >
          Xóa tài khoản
        </button>
      </div>

      {isModalOpen && (
        <div
          className="account-deletion-modal show d-block"
          tabIndex={-1}
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Xác nhận xóa tài khoản</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeModal}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle"></i> Cảnh báo: Hành
                  động này không thể hoàn tác!
                </div>
                <p>
                  Để xác nhận xóa tài khoản, vui lòng nhập mật khẩu của bạn:
                </p>
                <div className="form-group mb-3">
                  <label htmlFor="deleteAccountPassword" className="form-label">
                    Mật khẩu:
                  </label>
                  <input
                    type="password"
                    className={`form-control ${error ? "is-invalid" : ""}`}
                    id="deleteAccountPassword"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Nhập mật khẩu của bạn"
                    disabled={loading}
                  />
                  {error && <div className="invalid-feedback">{error}</div>}
                </div>
                <p className="text-muted small">
                  Lưu ý: Tất cả dữ liệu của bạn bao gồm thông tin cá nhân, lịch
                  sử giao dịch, bài thi đã mua sẽ bị xóa vĩnh viễn.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <span className="ms-2">Đang xử lý...</span>
                    </>
                  ) : (
                    "Xóa tài khoản"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;
