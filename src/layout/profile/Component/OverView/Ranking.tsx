import React, { useState, useEffect } from "react";
import styles from "./Ranking.module.css";
import { InfoCircle, Gift, ChevronRight } from "react-bootstrap-icons";
import RankingInfoDialog from "./RankingInfoDialog";
// Import component RewardsPopup đã có sẵn
import RewardsPopup from "./Award";

interface RankingData {
  id: number | null;
  avatar: string | null;
  accountId: number;
  accountName: string;
  periodType: string | null;
  totalPointsWithDaily: number;
  totalPoints: number;
  ranking: number;
  status: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

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
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month">("day");
  const [scoreChange, setScoreChange] = useState<number>(25);
  const [availableRewards, setAvailableRewards] = useState<number>(6);
  const [userRanking, setUserRanking] = useState<User[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInfoDialog, setShowInfoDialog] = useState<boolean>(false);
  // Thêm state để kiểm soát việc hiển thị popup phần thưởng
  const [showRewardsPopup, setShowRewardsPopup] = useState<boolean>(false);

  // Added state to track different loading states
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false);
  const [isFullPageLoading, setIsFullPageLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("Đang tải dữ liệu bảng xếp hạng");
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  // Force initial data load when component mounts
  useEffect(() => {
    console.log("Component mounted, forcing initial data load");
    fetchRankingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data when activeTab or userId changes
  useEffect(() => {
    // Skip the initial render since we already fetch data in the mount effect
    if (dataLoaded) {
      console.log(`Tab changed: activeTab=${activeTab}, userId=${userId}`);
      fetchRankingData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userId]);

  const fetchRankingData = async () => {
    // Set loading state based on whether this is the first load or a tab change
    if (!dataLoaded) {
      console.log("Initial data load");
      setIsInitialLoading(true);
    } else {
      console.log("Tab change data load");
      setIsTabLoading(true);
    }

    setLoadingMessage(`Đang tải dữ liệu ${getTabName(activeTab)}`);

    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực, vui lòng đăng nhập lại');
      }

      // Xác định endpoint dựa trên tab đang active
      let endpoint = `${process.env.REACT_APP_SERVER_HOST}/api/rankings/`;

      switch (activeTab) {
        case "day":
          endpoint += "day";
          break;
        case "week":
          endpoint += "week";
          break;
        case "month":
          endpoint += "month";
          break;
        default:
          endpoint += "day";
      }

      console.log(`Fetching ranking data from ${endpoint}`);

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Lỗi kết nối: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Received ranking data:`, result);

      if (result.status === 200) {
        const rankingData: RankingData[] = result.data;

        if (!rankingData || rankingData.length === 0) {
          console.log("No ranking data received");
          setTopUsers([]);
          setUserRanking([]);
          return;
        }

        console.log(`Processing ${rankingData.length} ranking entries`);

        // Sort users by points before assigning ranks
        rankingData.sort((a, b) => b.totalPointsWithDaily - a.totalPointsWithDaily);

        // Chuyển đổi dữ liệu API sang định dạng User cho component
        const processedUsers = rankingData.map((item, index): User => {
          // Calculate rank automatically if API doesn't provide valid ranking
          const calculatedRank = index + 1;
          const userRank = item.ranking && item.ranking > 0 ? item.ranking : calculatedRank;

          return {
            id: item.accountId,
            name: item.accountName || `Người dùng ${calculatedRank}`,
            avatar: item.avatar || "",
            points: item.totalPointsWithDaily || 0,
            level: Math.floor((item.totalPointsWithDaily || 0) / 100) + 1, // Tính level dựa trên điểm
            rank: userRank, // Use calculated rank if API doesn't provide one
            completedCourses: 0, // Thông tin này có thể không có trong API
            isCurrentUser: item.accountId === userId
          };
        });

        // Lấy top 3 người dùng (hoặc tạo dữ liệu mẫu nếu không đủ)
        let top3 = processedUsers.slice(0, 3);

        // Ensure we have exactly 3 users for the podium, filling with placeholder data if needed
        while (top3.length < 3) {
          const placeholderRank = top3.length + 1;
          top3.push({
            id: -placeholderRank, // Negative ID to mark as placeholder
            name: `Vị trí #${placeholderRank}`,
            avatar: "",
            points: 0,
            level: 1,
            rank: placeholderRank,
            completedCourses: 0,
            isCurrentUser: false
          });
        }

        console.log("Setting top users:", top3);
        setTopUsers(top3);

        // Lấy danh sách xếp hạng (từ vị trí thứ 4 trở đi)
        const restUsers = processedUsers.slice(3);
        console.log("Setting user ranking:", restUsers);
        setUserRanking(restUsers);

        // Cập nhật điểm của người dùng hiện tại
        const currentUser = processedUsers.find(user => user.isCurrentUser);
        if (currentUser) {
          // Lưu điểm hiện tại vào localStorage để tính toán scoreChange trong lần tải tiếp theo
          const previousPoints = localStorage.getItem('previousUserPoints');

          if (previousPoints) {
            const prevPoints = parseInt(previousPoints, 10);
            const currentPoints = currentUser.points;

            if (currentPoints > prevPoints) {
              setScoreChange(currentPoints - prevPoints);
            }
          }

          // Lưu điểm hiện tại cho lần tải tiếp theo
          localStorage.setItem('previousUserPoints', currentUser.points.toString());
        }
      } else {
        throw new Error(result.message || 'Lỗi khi tải dữ liệu xếp hạng');
      }
    } catch (error) {
      console.error("Error fetching ranking data:", error);
    } finally {
      // Clear loading states
      console.log("Clearing loading states");
      setIsInitialLoading(false);
      setIsTabLoading(false);
      setIsFullPageLoading(false);
      setLoading(false);
      setDataLoaded(true);
    }
  };

  const handleTabChange = (tab: "day" | "week" | "month") => {
    // Only change tab if it's different from current tab
    if (tab !== activeTab) {
      console.log(`Changing tab from ${activeTab} to ${tab}`);
      setIsTabLoading(true);
      setActiveTab(tab);
    } else {
      console.log(`Tab ${tab} already selected, forcing refresh`);
      // Force refresh of current tab
      setIsTabLoading(true);
      fetchRankingData();
    }
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

  const getTabClass = (tab: "day" | "week" | "month") => {
    return activeTab === tab ? styles.tabActive : "";
  };

  const getTabName = (tab: "day" | "week" | "month") => {
    switch (tab) {
      case "day": return "hôm nay";
      case "week": return "tuần này";
      case "month": return "tháng này";
      // case "total": return "tổng thời gian";
      default: return "";
    }
  };

  // Render skeleton loading for scorecard
  const renderSkeletonScoreCard = () => {
    return <div className={`${styles.skeletonScoreCard} ${styles.skeletonPulse}`}></div>;
  };

  // Render skeleton loading for rewards banner  
  const renderSkeletonRewardsBanner = () => {
    return <div className={`${styles.skeletonRewardsBanner} ${styles.skeletonPulse}`}></div>;
  };

  // Render skeleton loading for podium
  const renderSkeletonPodium = () => {
    return (
      <div className={styles.skeletonPodium}>
        <div className={`${styles.skeletonPodiumBlock} ${styles.skeletonPodiumSecond} ${styles.skeletonPulse}`}>
          <div className={`${styles.skeletonPodiumCircle} ${styles.skeletonPulse}`}></div>
        </div>
        <div className={`${styles.skeletonPodiumBlock} ${styles.skeletonPodiumFirst} ${styles.skeletonPulse}`}>
          <div className={`${styles.skeletonPodiumCircle} ${styles.skeletonPulse}`}></div>
        </div>
        <div className={`${styles.skeletonPodiumBlock} ${styles.skeletonPodiumThird} ${styles.skeletonPulse}`}>
          <div className={`${styles.skeletonPodiumCircle} ${styles.skeletonPulse}`}></div>
        </div>
      </div>
    );
  };

  // Render skeleton loading for list items
  const renderSkeletonListItems = () => {
    return Array(5).fill(0).map((_, index) => (
      <div key={`skeleton-${index}`} className={`${styles.skeletonItem} ${styles.skeletonPulse}`}>
        <div className={`${styles.skeletonRank} ${styles.skeletonPulse}`}></div>
        <div className={`${styles.skeletonAvatar} ${styles.skeletonPulse}`}></div>
        <div className={styles.skeletonInfo}>
          <div className={`${styles.skeletonName} ${styles.skeletonPulse}`}></div>
          <div className={`${styles.skeletonCourse} ${styles.skeletonPulse}`}></div>
        </div>
        <div className={`${styles.skeletonLevel} ${styles.skeletonPulse}`}></div>
        <div className={`${styles.skeletonPoints} ${styles.skeletonPulse}`}></div>
      </div>
    ));
  };

  // Render full page loading overlay
  const renderFullPageLoading = () => {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>
          <span>{loadingMessage}</span>
          <span className={styles.loadingDots}></span>
        </div>
      </div>
    );
  };

  // Render section loading animation
  const renderSectionLoading = () => {
    return (
      <div className={styles.sectionLoading}>
        <div className={styles.sectionSpinner}></div>
        <div className={styles.sectionLoadingText}>
          <span>{loadingMessage}</span>
          <span className={styles.loadingDots}></span>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {console.log("Rendering Ranking component:", {
        isInitialLoading,
        isTabLoading,
        dataLoaded,
        topUsersLength: topUsers.length,
        userRankingLength: userRanking.length
      })}

      {/* Full page loading overlay */}
      {isFullPageLoading && renderFullPageLoading()}

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
      {isInitialLoading ? renderSkeletonScoreCard() : (
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
      )}

      {/* Rewards Banner */}
      {isInitialLoading ? renderSkeletonRewardsBanner() : (
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
      )}

      {/* Period Tabs */}
      <div className={styles.periodTabs}>
        <button
          className={`${styles.tabButton} ${getTabClass("day")}`}
          onClick={() => handleTabChange("day")}
          disabled={isTabLoading}
        >
          Hôm nay
        </button>
        <button
          className={`${styles.tabButton} ${getTabClass("week")}`}
          onClick={() => handleTabChange("week")}
          disabled={isTabLoading}
        >
          Tuần này
        </button>
        <button
          className={`${styles.tabButton} ${getTabClass("month")}`}
          onClick={() => handleTabChange("month")}
          disabled={isTabLoading}
        >
          Tháng này
        </button>
      </div>

      {/* Show section loading when changing tabs */}
      {isTabLoading && renderSectionLoading()}

      {/* Top 3 Users Podium */}
      {(isInitialLoading || isTabLoading) ? renderSkeletonPodium() : (
        <div className={styles.topUsersPodium}>
          {topUsers.length >= 3 ? (
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
          ) : (
            <div className={styles.noData}>Chưa có dữ liệu xếp hạng</div>
          )}
        </div>
      )}

      {/* Detailed Ranking List */}
      <div className={styles.listHeader}>Bảng xếp hạng chi tiết</div>

      <div className={styles.list}>
        {(isInitialLoading || isTabLoading) ? (
          renderSkeletonListItems()
        ) : userRanking.length > 0 ? (
          userRanking.map((user) => (
            <div
              key={user.id}
              className={`${styles.item} ${user.isCurrentUser ? styles.currentUser : ""}`}
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
                  {/* {user.completedCourses} khóa học hoàn thành */}
                </div>
              </div>
              <div className={styles.userLevel}>
                <span className={styles.levelBadge}>Level {user.level}</span>
              </div>
              <div className={styles.userPoints}>
                {user.points} <span className={styles.pointsLabel}>điểm</span>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noData}>Chưa có dữ liệu xếp hạng</div>
        )}
      </div>

      {/* Info Dialog */}
      {showInfoDialog && <RankingInfoDialog onClose={closeInfoDialog} />}

      {/* Rewards Popup */}
      {showRewardsPopup && (
        <RewardsPopup
          isOpen={showRewardsPopup}
          onClose={closeRewardsPopup}
          userLevel={Math.floor(userPoints / 100) + 1}
        />
      )}
    </div>
  );
};

export default Ranking;
