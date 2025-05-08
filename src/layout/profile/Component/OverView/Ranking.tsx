import React, { useState, useEffect } from "react";
import styles from "./Ranking.module.css";
import { InfoCircle, Gift, ChevronRight } from "react-bootstrap-icons";
import RankingInfoDialog from "./RankingInfoDialog";
// Import component RewardsPopup đã có sẵn
import RewardsPopup from "./Award";

interface User {
  id: number;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  rank: number;
  completedCourses: number;
  isCurrentUser: boolean;
}

interface RankingProps {
  userId: number;
  userPoints?: number;
  onBack?: () => void; // Optional vì không cần dùng nút back khi hiển thị luôn
}

const Ranking: React.FC<RankingProps> = ({
  userId,
  userPoints = 250,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<"week" | "month" | "total">(
    "week"
  );
  const [scoreChange, setScoreChange] = useState<number>(25);
  const [availableRewards, setAvailableRewards] = useState<number>(6);
  const [userRanking, setUserRanking] = useState<User[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInfoDialog, setShowInfoDialog] = useState<boolean>(false);
  // Thêm state để kiểm soát việc hiển thị popup phần thưởng
  const [showRewardsPopup, setShowRewardsPopup] = useState<boolean>(false);

  useEffect(() => {
    fetchRankingData();
  }, [activeTab]);

  const fetchRankingData = async () => {
    setLoading(true);
    try {
      // Dummy data for demonstration
      const dummyTopUsers = [
        {
          id: 1,
          name: "Thùy Dương",
          avatar: "",
          points: 1000,
          level: 1,
          rank: 1,
          completedCourses: 3,
          isCurrentUser: false,
        },
        {
          id: 1,
          name: "Thùy Dương",
          avatar: "",
          points: 1000,
          level: 1,
          rank: 1,
          completedCourses: 3,
          isCurrentUser: false,
        },
        {
          id: 1,
          name: "Thùy Dương",
          avatar: "",
          points: 1000,
          level: 1,
          rank: 1,
          completedCourses: 3,
          isCurrentUser: false,
        },
      ];

      const dummyRankingList = [
        {
          id: 4,
          name: "Bảo Nam",
          avatar: "",
          points: 850,
          level: 1,
          rank: 4,
          completedCourses: 0,
          isCurrentUser: false,
        },
        {
          id: 5,
          name: "Huyền Trang",
          avatar: "",
          points: 800,
          level: 1,
          rank: 5,
          completedCourses: 0,
          isCurrentUser: false,
        },
        {
          id: 6,
          name: "Minh Tú",
          avatar: "",
          points: 750,
          level: 1,
          rank: 6,
          completedCourses: 0,
          isCurrentUser: false,
        },
        {
          id: 7,
          name: "Hồng Nhung",
          avatar: "",
          points: 700,
          level: 1,
          rank: 7,
          completedCourses: 0,
          isCurrentUser: false,
        },
        {
          id: 8,
          name: "Văn Khoa",
          avatar: "",
          points: 650,
          level: 1,
          rank: 8,
          completedCourses: 0,
          isCurrentUser: userId === 8,
        },
        {
          id: 9,
          name: "Mỹ Linh",
          avatar: "",
          points: 600,
          level: 1,
          rank: 9,
          completedCourses: 0,
          isCurrentUser: false,
        },
        {
          id: 10,
          name: "Phương Linh",
          avatar: "",
          points: 550,
          level: 1,
          rank: 10,
          completedCourses: 0,
          isCurrentUser: false,
        },
      ];

      setTopUsers(dummyTopUsers);
      setUserRanking(dummyRankingList);
    } catch (error) {
      console.error("Error fetching ranking data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: "week" | "month" | "total") => {
    setActiveTab(tab);
  };

  const showInfo = () => {
    setShowInfoDialog(true);
  };

  const closeInfoDialog = () => {
    setShowInfoDialog(false);
  };

  const viewRewards = () => {
    // Mở popup phần thưởng khi nhấn vào banner
    setShowRewardsPopup(true);
  };

  const closeRewardsPopup = () => {
    // Đóng popup phần thưởng
    setShowRewardsPopup(false);
  };

  const getTabClass = (tab: "week" | "month" | "total") => {
    return activeTab === tab ? styles.tabActive : "";
  };

  return (
    <div className={styles.container}>
      {/* Header - không có nút back */}
      <div className={styles.header}>
        {onBack && (
          <button className={styles.backButton} onClick={onBack}>
            <span className={styles.backIcon}>←</span>
          </button>
        )}
        <h1 className={styles.title}>Bảng xếp hạng</h1>
        <button className={styles.infoButton} onClick={showInfo}>
          <InfoCircle size={20} />
        </button>
      </div>

      {/* User Score Card */}
      <div className={styles.scoreCard}>
        <div className={styles.trophyIcon}>🏆</div>
        <div className={styles.scoreInfo}>
          <div className={styles.scoreLabel}>Điểm xếp hạng của bạn</div>
          <div className={styles.scoreValue}>
            {userPoints} <span className={styles.scoreUnit}>điểm</span>
          </div>
        </div>
        <div className={styles.scoreChange}>
          <span className={styles.changeIcon}>↑</span> +{scoreChange}
        </div>
      </div>

      {/* Rewards Banner - Sửa lại để gọi viewRewards */}
      <div className={styles.rewardsBanner} onClick={viewRewards}>
        <div className={styles.giftIcon}>
          <Gift size={24} />
        </div>
        <div className={styles.rewardsInfo}>
          <div className={styles.rewardsTitle}>Phần thưởng & Đặc quyền</div>
          <div className={styles.rewardsSubtitle}>
            Bạn đang có {availableRewards} phần thưởng khả dụng!
          </div>
        </div>
        <div className={styles.chevronRight}>
          <ChevronRight size={24} />
        </div>
      </div>

      {/* Period Tabs */}
      <div className={styles.periodTabs}>
        <button
          className={`${styles.tabButton} ${getTabClass("week")}`}
          onClick={() => handleTabChange("week")}
        >
          Tuần này
        </button>
        <button
          className={`${styles.tabButton} ${getTabClass("month")}`}
          onClick={() => handleTabChange("month")}
        >
          Tháng này
        </button>
        <button
          className={`${styles.tabButton} ${getTabClass("total")}`}
          onClick={() => handleTabChange("total")}
        >
          Tổng
        </button>
      </div>

      {/* Top 3 Users Podium */}
      <div className={styles.topUsersPodium}>
        {topUsers.length >= 3 && (
          <>
            {/* Second Place */}
            <div className={`${styles.podiumUser} ${styles.podiumSecond}`}>
              <div className={styles.podiumNameCard}>
                <div className={styles.podiumName}>{topUsers[1].name}</div>
                <div className={styles.podiumPoints}>{topUsers[1].points}</div>
              </div>
              <div className={styles.podiumCircle}>
                <span className={styles.podiumRank}>2</span>
              </div>
              <div className={`${styles.podiumBlock} ${styles.secondBlock}`}>
                <div className={styles.trophySmall}>🏆</div>
                <div className={styles.podiumLevel}>Lv.{topUsers[1].level}</div>
              </div>
            </div>

            {/* First Place */}
            <div className={`${styles.podiumUser} ${styles.podiumFirst}`}>
              <div className={styles.podiumBadge}>
                <span className={styles.badgeIcon}>🏅</span>
              </div>
              <div className={styles.podiumNameCard}>
                <div className={styles.podiumName}>{topUsers[0].name}</div>
                <div className={styles.podiumPoints}>{topUsers[0].points}</div>
              </div>
              <div className={styles.podiumCircle}>
                <span className={styles.podiumRank}>1</span>
              </div>
              <div className={`${styles.podiumBlock} ${styles.firstBlock}`}>
                <div className={styles.trophySmall}>🏆</div>
                <div className={styles.podiumLevel}>Lv.{topUsers[0].level}</div>
              </div>
            </div>

            {/* Third Place */}
            <div className={`${styles.podiumUser} ${styles.podiumThird}`}>
              <div className={styles.podiumNameCard}>
                <div className={styles.podiumName}>{topUsers[2].name}</div>
                <div className={styles.podiumPoints}>{topUsers[2].points}</div>
              </div>
              <div className={styles.podiumCircle}>
                <span className={styles.podiumRank}>3</span>
              </div>
              <div className={`${styles.podiumBlock} ${styles.thirdBlock}`}>
                <div className={styles.trophySmall}>🏆</div>
                <div className={styles.podiumLevel}>Lv.{topUsers[2].level}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detailed Ranking List */}
      <div className={styles.listHeader}>Bảng xếp hạng chi tiết</div>

      <div className={styles.list}>
        {loading ? (
          <div className={styles.loading}>Đang tải...</div>
        ) : (
          userRanking.map((user) => (
            <div
              key={user.id}
              className={`${styles.item} ${
                user.isCurrentUser ? styles.currentUser : ""
              }`}
            >
              <div className={styles.rankNumber}>{user.rank}</div>
              <div className={styles.userAvatar}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <div className={styles.defaultAvatar}></div>
                )}
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>
                  {user.name}
                  {user.isCurrentUser && (
                    <span className={styles.userTag}>Bạn</span>
                  )}
                </div>
                <div className={styles.courseInfo}>
                  <span className={styles.courseIcon}>📚</span>{" "}
                  {user.completedCourses} khóa học hoàn thành
                </div>
              </div>
              <div className={styles.userLevel}>
                <span className={styles.levelBadge}>Level {user.level}</span>
              </div>
              <div className={styles.userPoints}>
                {user.points} <span className={styles.pointsLabel}>points</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Dialog */}
      {showInfoDialog && <RankingInfoDialog onClose={closeInfoDialog} />}

      {/* Rewards Popup - Hiển thị khi showRewardsPopup = true */}
      {showRewardsPopup && (
        <RewardsPopup
          isOpen={showRewardsPopup}
          onClose={closeRewardsPopup}
          userLevel={2} /* Truyền level của người dùng hiện tại */
        />
      )}
    </div>
  );
};

export default Ranking;
