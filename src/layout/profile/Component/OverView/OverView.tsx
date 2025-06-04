import React, { useState, useEffect } from "react";
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
import WalletDepositPopup from "./WalletDepositPopup";

interface OverviewProps {
  onViewDetails: () => void;
}

interface OverviewData {
  accountId: number;
  accountName: string;
  email: string;
  totalPoints: number;
  dayStreak: number;
  countCourse: number;
  countDocument: number;
  balanceWallet: number;
  walletId: number;
}

const HorizontalOverview: React.FC<OverviewProps> = ({
  onViewDetails,
}) => {
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [showDepositPopup, setShowDepositPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Lấy userId từ localStorage khi component mount
  useEffect(() => {
    try {
      const authDataStr = localStorage.getItem('authData');
      if (authDataStr) {
        const authData = JSON.parse(authDataStr);
        if (authData && authData.id) {
          setUserId(authData.id);
        } else {
          setError('Không tìm thấy ID người dùng');
        }
      } else {
        setError('Vui lòng đăng nhập để xem thông tin');
      }
    } catch (err) {
      console.error('Lỗi khi đọc dữ liệu từ localStorage:', err);
      setError('Lỗi khi đọc dữ liệu người dùng');
    }
  }, []);

  useEffect(() => {
    const fetchOverviewData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Lấy token từ localStorage
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('Không tìm thấy token xác thực, vui lòng đăng nhập lại');
        }
        
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/account/overview/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
          }
          throw new Error(`Lỗi kết nối: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 200) {
          setOverviewData(result.data);
        } else {
          throw new Error(result.message || 'Lỗi khi tải dữ liệu');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
        console.error("Error fetching overview data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOverviewData();
    }
  }, [userId]);

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString("vi-VN")} VND`;
  };

  // Xử lý khi nạp tiền thành công
  const handleDepositSuccess = () => {
    // Tải lại dữ liệu tổng quan để cập nhật số dư ví
    if (userId) {
      setLoading(true);
      fetchOverviewData();
    }
    setShowDepositPopup(false);
  };

  // Hàm tải lại dữ liệu tổng quan
  const fetchOverviewData = async () => {
    if (!userId) return;
    
    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực, vui lòng đăng nhập lại');
      }
      
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/account/overview/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Lỗi kết nối: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 200) {
        setOverviewData(result.data);
      } else {
        throw new Error(result.message || 'Lỗi khi tải dữ liệu');
      }
    } catch (err) {
      console.error("Error fetching overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="overview-section">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="overview-section">Lỗi: {error}</div>;
  }

  if (!overviewData) {
    return <div className="overview-section">Không có dữ liệu</div>;
  }

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
              <div className="balance-value">{formatCurrency(overviewData.balanceWallet)}</div>
            </div>
            <div className="wallet-actions">
              <button className="add-funds-btn" onClick={() => setShowDepositPopup(true)}>
                <PlusCircle size={14} />
                <span>Nạp tiền</span>
              </button>
              <button
                className="view-details-btn"
                onClick={() => setShowWalletDetails(true)}
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
                <div className="stat-value">{overviewData.dayStreak}</div>
                <div className="stat-label">Day Streaks</div>
              </div>
            </div>

            <div className="stat-cardd points-card">
              <div className="stat-icon">
                <Star size={22} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{overviewData.totalPoints}</div>
                <div className="stat-label">Điểm</div>
              </div>
            </div>

            <div className="stat-cardd courses-card">
              <div className="stat-icon">
                <Mortarboard size={22} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{overviewData.countCourse}</div>
                <div className="stat-label">Khoá học</div>
              </div>
            </div>

            <div className="stat-cardd documents-card">
              <div className="stat-icon">
                <FileEarmark size={22} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{overviewData.countDocument}</div>
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
            <Ranking userId={overviewData.accountId} userPoints={overviewData.totalPoints} />
          </div>
        </div>
      </div>
      
      {/* Wallet Detail Popup */}
      <WalletDetailsPopup
        isOpen={showWalletDetails}
        onClose={() => setShowWalletDetails(false)}
        balance={overviewData.balanceWallet}
      />
      
      {/* Wallet Deposit Popup */}
      <WalletDepositPopup
        isOpen={showDepositPopup}
        onClose={() => setShowDepositPopup(false)}
        onDepositSuccess={handleDepositSuccess}
      />
    </div>
  );
};

export default HorizontalOverview;
