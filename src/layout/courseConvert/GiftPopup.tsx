import React, { useState } from "react";
import "./popup.css";

interface GiftPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const GiftPopup: React.FC<GiftPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay phaohoa">
      <div className="popup-content phaohoa">
        <h2>🎉 Chúc mừng bạn đã hoàn thành khóa học! 🎉</h2>
        <img
          src="https://usagif.com/wp-content/uploads/gify/congratulations-4-usagif.gif" // Link đến file GIF hoặc animation
          alt="Gift Animation"
          style={{ width: "100%", height: "70%" }}
        />
        <button className="popup-button phaohoa" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
};

export default GiftPopup;
