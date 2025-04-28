import React from "react";
import "./CustomPopup.css";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const CustomPopup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay view">
      <div className="popup view">
        <button className="popup-close-view" onClick={onClose}>
          &times;
        </button>
        <div className="popup-content view">{children}</div>
      </div>
    </div>
  );
};

export default CustomPopup;
