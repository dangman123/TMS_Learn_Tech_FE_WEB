import React from "react";

interface ConfirmModalProps {
  isOpen: boolean; // Trạng thái mở/đóng của popup
  title: string; // Tiêu đề của popup
  message: string; // Nội dung thông báo
  onConfirm: () => void; // Hành động khi nhấn "Xác nhận"
  onCancel: () => void; // Hành động khi nhấn "Hủy"
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          width: "400px",
          textAlign: "center",
        }}
      >
        <h3>{title}</h3>
        <p>{message}</p>
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={onConfirm}
            style={{
              backgroundColor: "#ff4d4f",
              color: "white",
              padding: "10px 20px",
              marginRight: "10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Xác nhận
          </button>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: "#f0f0f0",
              color: "#000",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
