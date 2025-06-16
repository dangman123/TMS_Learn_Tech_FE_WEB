import React, { useState, useEffect } from "react";
import "./popup.css";

interface GiftPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const GiftPopup: React.FC<GiftPopupProps> = ({ isOpen, onClose }) => {
  const [animateOut, setAnimateOut] = useState(false);
  
  useEffect(() => {
    // Set document body to no scroll when popup is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleClose = () => {
    setAnimateOut(true);
    setTimeout(() => {
      setAnimateOut(false);
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`popup-overlay celebration ${animateOut ? 'fade-out' : ''}`}>
      <div className={`popup-content celebration ${animateOut ? 'slide-out' : ''}`}>
        <button className="close-button" onClick={handleClose}>
          &times;
        </button>
        
        <div className="celebration-content">
          <div className="celebration-badge">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/2997/2997421.png" 
              alt="Achievement Badge"
            />
          </div>
          
          <h2 className="celebration-title">🎉 Chúc mừng! 🎉</h2>
          <p className="celebration-message">
            Bạn đã hoàn thành xuất sắc khóa học này.<br />
            Tiếp tục phát huy và chinh phục những thử thách tiếp theo nhé!
          </p>
          
          <div className="celebration-stats">
            <div className="stat-item">
              <div className="stat-value">100%</div>
              <div className="stat-label">Hoàn thành</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">5.0</div>
              <div className="stat-label">Điểm số</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">A+</div>
              <div className="stat-label">Xếp loại</div>
            </div>
          </div>
          
          <div className="confetti-container">
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
          </div>
          
          <button className="celebration-button" onClick={handleClose}>
            Tiếp tục học
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiftPopup;
