import React, { useState, useEffect } from "react";
import {
  Lock,
  X,
  Award,
  BookHalf,
  Tag,
  Person,
  Info,
  Clipboard,
} from "react-bootstrap-icons";
import "./RewardsPopup.css";

interface Reward {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBackground: string;
  requiredLevel: string;
  isLocked: boolean;
  voucherCode?: string;
  expiryDate?: string;
  borderColor?: string;
}

interface RewardsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userLevel: number;
}

const RewardsPopup: React.FC<RewardsPopupProps> = ({
  isOpen,
  onClose,
  userLevel,
}) => {
  const [rewards, setRewards] = useState<Reward[]>([]);

  useEffect(() => {
    // Fetch rewards or set them directly
    const availableRewards: Reward[] = [
      {
        id: "1",
        title: "Khóa học miễn phí",
        description: "Nhận 1 khóa học miễn phí trị giá lên đến 500.000đ",
        icon: <Award size={24} />,
        iconBackground: "#c2e2f7",
        requiredLevel: "Top 1",
        isLocked: userLevel < 1,
      },
      {
        id: "2",
        title: "Giảm 50% khóa học",
        description: "Giảm 50% cho 1 khóa học bất kỳ",
        icon: <BookHalf size={24} />,
        iconBackground: "#e8d5f5",
        requiredLevel: "Top 2",
        isLocked: userLevel < 2,
        voucherCode: "TOP20REWARD",
        expiryDate: "31/12/2024",
        borderColor: "#2e8b57",
      },
      {
        id: "3",
        title: "Giảm 30% khóa học",
        description: "Giảm 30% cho 1 khóa học bất kỳ",
        icon: <Tag size={24} />,
        iconBackground: "#ffecb3",
        requiredLevel: "Top 3",
        isLocked: userLevel < 3,
      },
      {
        id: "4",
        title: "Buổi hướng dẫn 1-1",
        description: "Buổi hướng dẫn trực tiếp với giảng viên (45 phút)",
        icon: <Person size={24} />,
        iconBackground: "#c8e6c9",
        requiredLevel: "Top 4",
        isLocked: userLevel < 4,
      },
      {
        id: "25",
        title: "Tư vấn khóa học riêng",
        description: "Buổi tư vấn lộ trình học phù hợp với nhu cầu riêng",
        icon: <Award size={24} />,
        iconBackground: "#d1c4e9",
        requiredLevel: "Top 25",
        isLocked: userLevel < 25,
      },
      {
        id: "30",
        title: "Giảm 10% học phí",
        description: "Giảm 10% học phí tất cả khóa học trong 1 tháng",
        icon: <Tag size={24} />,
        iconBackground: "#ffcdd2",
        requiredLevel: "Top 30",
        isLocked: userLevel < 30,
        voucherCode: "MONTH10POFF",
        expiryDate: "31/12/2024",
        borderColor: "#d32f2f",
      },
      {
        id: "35",
        title: "Quyền truy cập beta",
        description: "Truy cập những tính năng và khóa học đang phát triển",
        icon: <Award size={24} />,
        iconBackground: "#b2dfdb",
        requiredLevel: "Top 35",
        isLocked: userLevel < 35,
      },
    ];

    setRewards(availableRewards);
  }, [userLevel]);

  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      toast("Đã sao chép mã giảm giá!");
    } catch (error) {
      console.error("Lỗi khi sao chép vào clipboard:", error);
      toast("Không thể sao chép mã. Hãy sao chép thủ công.");
    }
  };

  // Giả lập hàm toast
  const toast = (message: string) => {
    alert(message);
  };

  if (!isOpen) return null;

  return (
    <div className="rewards-popup-overlay">
      <div className="rewards-popup-container">
        <div className="rewards-popup-header">
          <h2>Phần thưởng & Đặc quyền</h2>
          <p>Đạt hạng cao hơn để mở khóa phần thưởng</p>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="rewards-list">
          {rewards && rewards.length > 0 ? (
            rewards.map((reward) => (
              <div
                key={reward.id}
                className={`reward-item ${reward.isLocked ? "locked" : ""}`}
                style={
                  reward.borderColor ? { borderColor: reward.borderColor } : {}
                }
              >
                <div className="reward-content">
                  <div
                    className="reward-icon"
                    style={{ backgroundColor: reward.iconBackground }}
                  >
                    {reward.icon}
                  </div>

                  <div className="reward-info">
                    <h3>{reward.title}</h3>
                    <p>{reward.description}</p>

                    {reward.isLocked ? (
                      <div className="lock-info">
                        <Lock size={16} />
                        <span>Cần đạt {reward.requiredLevel} để mở khóa</span>
                      </div>
                    ) : reward.voucherCode ? (
                      <div className="voucher-container">
                        <div className="voucher-code">
                          <span>{reward.voucherCode}</span>
                          <button
                            className="copy-button"
                            onClick={() => copyToClipboard(reward.voucherCode!)}
                          >
                            <Clipboard size={16} />
                          </button>
                        </div>
                        <button
                          className="use-button"
                          style={{
                            backgroundColor: reward.borderColor || "#3a56d4",
                          }}
                        >
                          Dùng
                        </button>
                        {reward.expiryDate && (
                          <div className="expiry-date">
                            <span>HSD: {reward.expiryDate}</span>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className="reward-level">
                    <span>{reward.requiredLevel}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-rewards">
              <p>Không có phần thưởng nào khả dụng vào lúc này.</p>
            </div>
          )}
        </div>

        <div className="rewards-note">
          <Info size={16} />
          <p>
            Phần thưởng sẽ được cập nhật sau mỗi chu kỳ xếp hạng. Một số phần
            thưởng có thể có hạn sử dụng.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RewardsPopup;
