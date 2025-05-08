import React, { useState } from "react";
import {
  Fire,
  Star,
  Mortarboard,
  FileEarmark,
  CreditCard,
  ArrowRight,
  PlusCircle,
} from "react-bootstrap-icons";
import "./Overview.css";
import Ranking from "./Ranking";
import Streak from "./Streak";
import WalletDetailsPopup from "./WalletDetailsPopup";

interface OverviewProps {
  userId: number;
  dayStreaks: number;
  points: number;
  courses: number;
  documents: number;
  balance: number;
  onAddFunds: () => void;
  onViewDetails: () => void;
}

const HorizontalOverview: React.FC<OverviewProps> = ({
  userId = 8,
  dayStreaks = 15,
  points = 250,
  courses = 4,
  documents = 12,
  balance = 500000,
  onAddFunds,
  onViewDetails,
}) => {
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString("vi-VN")} VND`;
  };

  return (
    <div className="overview-section">
      <div className="overview-container">
        {/* Dòng 1: Ví và các card thống kê */}
        <div className="top-row">
          <div className="wallet-card">
            <div className="wallet-header">
              <div className="wallet-title">Ví của tôi</div>
              <div className="wallet-icon">
                <CreditCard size={18} />
              </div>
            </div>
            <div className="wallet-balance">
              <div className="balance-label">Số dư:</div>
              <div className="balance-value">{formatCurrency(balance)}</div>
            </div>
            <div className="wallet-actions">
              <button className="add-funds-btn" onClick={onAddFunds}>
                <PlusCircle size={14} />
                <span>Nạp tiền</span>
              </button>
              <button
                className="view-details-btn"
                onClick={() => setShowWalletDetails(true)} // Mở popup khi nhấn nút
              >
                <span>Xem chi tiết</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-cardd streak-card">
              <div className="stat-icon">
                <Fire size={22} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{dayStreaks}</div>
                <div className="stat-label">Day Streaks</div>
              </div>
            </div>

            <div className="stat-cardd points-card">
              <div className="stat-icon">
                <Star size={22} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{points}</div>
                <div className="stat-label">Điểm</div>
              </div>
            </div>

            <div className="stat-cardd courses-card">
              <div className="stat-icon">
                <Mortarboard size={22} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{courses}</div>
                <div className="stat-label">Khoá học</div>
              </div>
            </div>

            <div className="stat-cardd documents-card">
              <div className="stat-icon">
                <FileEarmark size={22} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{documents}</div>
                <div className="stat-label">Tài liệu</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bottom-row">
          <div className="bottom-column streak-column">
            <Streak />
          </div>
          <div className="bottom-column ranking-column">
            <Ranking userId={userId} userPoints={points} />
          </div>
        </div>
      </div>
      <WalletDetailsPopup
        isOpen={showWalletDetails}
        onClose={() => setShowWalletDetails(false)}
        balance={balance}
      />
    </div>
  );
};

export default HorizontalOverview;
