import React, { useState } from "react";
import "./WalletDetailsPopup.css";
import { X, CreditCard, PlusCircle } from "react-bootstrap-icons";

interface WalletDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
}

const WalletDetailsPopup: React.FC<WalletDetailsPopupProps> = ({
  isOpen,
  onClose,
  balance,
}) => {
  if (!isOpen) return null;

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString("vi-VN")} đ`;
  };

  // Danh sách phương thức thanh toán đã liên kết
  const paymentMethods = [
    { id: 1, name: "MoMo", icon: "🅼", connected: true },
    { id: 2, name: "Vietcombank", icon: "🏦", connected: true },
  ];

  return (
    <div className="wallet-popup-overlay">
      <div className="wallet-popup-container">
        <div className="wallet-popup-header">
          <button className="wallet-popup-back" onClick={onClose}>
            <span>←</span>
          </button>
          <h2>Ví của tôi</h2>
          <div className="wallet-popup-placeholder"></div>
        </div>

        <div className="wallet-card-details">
          <div className="wallet-balance-details">
            <div className="balance-label-details">Số dư ví</div>
            <div className="balance-value-details">
              {formatCurrency(balance)}
            </div>
            <div className="wallet-info">TMS Wallet</div>
            <div className="card-expiry">05/25</div>
          </div>

          <div className="wallet-card-logo">
            <CreditCard size={24} />
          </div>
        </div>

        <div className="wallet-actions-row">
          <div className="action-button">
            <div className="action-icon add-icon">+</div>
            <div className="action-label">Nạp tiền</div>
          </div>
          <div className="action-button">
            <div className="action-icon transfer-icon">→</div>
            <div className="action-label">Chuyển tiền</div>
          </div>
          <div className="action-button">
            <div className="action-icon qr-icon">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 12h7v7H3v-7zm2 2v3h3v-3H5zm7-2h2v2h-2v-2zm3 0h2v2h-2v-2zm0 3h2v2h-2v-2zm0 3h2v2h-2v-2zm-3-3h2v2h-2v-2zm0 3h2v2h-2v-2z"
                />
              </svg>
            </div>
            <div className="action-label">Quét mã</div>
          </div>
          <div className="action-button">
            <div className="action-icon history-icon">📋</div>
            <div className="action-label">Lịch sử</div>
          </div>
        </div>

        <div className="payment-methods-section">
          <div className="payment-methods-header">
            <h3>Phương thức thanh toán</h3>
            <button className="add-method-button">Thêm mới</button>
          </div>

          <div className="payment-methods-list">
            {paymentMethods.map((method) => (
              <div key={method.id} className="payment-method-item">
                <div className="payment-method-icon">{method.icon}</div>
                <div className="payment-method-name">{method.name}</div>
                <div className="payment-method-status">
                  {method.connected ? (
                    <div className="connected-badge">
                      <span className="check-icon">✓</span> Đã liên kết
                    </div>
                  ) : (
                    <button className="connect-button">Liên kết</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletDetailsPopup;
