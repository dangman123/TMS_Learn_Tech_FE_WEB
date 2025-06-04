import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  parseISO,
} from "date-fns";
import { vi } from "date-fns/locale";
import "./Streak.css";
import {
  FaTrophy,
  FaClock,
  FaBell,
  FaChartLine,
  FaFire,
  FaTimes,
} from "react-icons/fa";
import { BsTrophy, BsCalendarCheck } from "react-icons/bs";

// Adjust this to use your actual auth context or get userId from another source
// import { useAuth } from "../../../../context/AuthContext";

interface StreakData {
  currentStreak: number;
  maxStreak: number;
  activeDates: string[];
}

const Streak: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    maxStreak: 0,
    activeDates: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Get userId from authData and token from authToken in localStorage
  const authData = localStorage.getItem('authData') ? JSON.parse(localStorage.getItem('authData') || '{}') : {};
  const userId = authData.id || '';
  const token = localStorage.getItem('authToken') || '';

  // Fetch streak data from API
  useEffect(() => {
    const fetchStreakData = async () => {
      if (!userId || !token) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/activity/streak/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const result = await response.json();
        setStreakData(result.data);
      } catch (err) {
        setError("Không thể tải dữ liệu streak");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStreakData();
  }, [userId, token]);

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  const firstDayOfMonth = getDay(start);

  // Convert activeDates to Day objects for checking completed days
  const activeDateObjects = streakData.activeDates.map(date => parseISO(date));
  
  // Check if a day is in the activeDates
  const isActiveDay = (day: Date) => {
    return activeDateObjects.some(activeDate => 
      activeDate.getDate() === day.getDate() && 
      activeDate.getMonth() === day.getMonth() && 
      activeDate.getFullYear() === day.getFullYear()
    );
  };

  // Today's date for comparison
  const today = new Date();

  // Status of today (pending by default)
  const [todayStatus, setTodayStatus] = useState<
    "pending" | "completed" | "skipped"
  >("pending");

  // Update today's status based on API data
  useEffect(() => {
    if (isActiveDay(today)) {
      setTodayStatus("completed");
    }
  }, [streakData]);

  // Handlers (these would need to call your API to update the streak data)
  const handleComplete = () => {
    setTodayStatus("completed");
    // Add API call to update streak
  };

  const handleSkip = () => {
    setTodayStatus("skipped");
    // Add API call to update streak
  };

  if (loading) {
    return <div className="wrapper">Loading...</div>;
  }

  if (error) {
    return <div className="wrapper">Error: {error}</div>;
  }

  return (
    <div className="wrapper">
      <div className="container-steack">
        {/* Phần được bọc màu vàng nhạt */}
        <div className="highlighted-section">
          {/* Thông báo */}
          <div className="motivation-box">
            <div className="motivation-icon">
              <FaTrophy />
            </div>
            <div>
              <p>
                <span>
                  {streakData.currentStreak > 0 
                    ? `Bạn đang có ${streakData.currentStreak} ngày học liên tục. Hãy tiếp tục duy trì!` 
                    : "Bắt đầu xây dựng thói quen học tập ngay hôm nay!"}
                  <span className="motivation-link"> Hãy tiếp tục duy trì!</span>
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Phần thống kê */}
        <div className="streak-stats">
          <h2>Thống kê</h2>

          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-icon trophy-bg">
                <BsTrophy />
              </div>
              <div className="stat-value">{streakData.maxStreak}</div>
              <div className="stat-label">Chuỗi dài nhất</div>
            </div>

            <div className="stat-item">
              <div className="stat-icon calendar-bg">
                <BsCalendarCheck />
              </div>
              <div className="stat-value">{streakData.currentStreak}</div>
              <div className="stat-label">Số ngày streak</div>
            </div>
          </div>
        </div>

        {/* Lịch */}
        <div className="calendar-section">
          <h2 className="calendar-title">Lịch</h2>
          <div className="calendar-header">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1
                  )
                )
              }
            >
              &#8249;
            </button>
            <h3>
              {format(currentDate, "MMMM yyyy", { locale: vi }).toUpperCase()}{" "}
              NĂM {currentDate.getFullYear()}
            </h3>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1
                  )
                )
              }
            >
              &#8250;
            </button>
          </div>

          <div className="calendar-grid">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
              <div key={day} className="day-label">
                {day}
              </div>
            ))}

            {Array.from({
              length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1,
            }).map((_, index) => (
              <div key={`empty-${index}`} className="empty-day" />
            ))}

            {days.map((day) => {
              const isToday =
                day.getDate() === today.getDate() &&
                day.getMonth() === today.getMonth() &&
                day.getFullYear() === today.getFullYear();
              const isCompleted = isActiveDay(day);
              const isSkipped = false; // You may need to implement this based on your requirements
              const isFuture = day > today;

              return (
                <div
                  key={day.toString()}
                  className={`day ${isToday ? "today" : ""} ${
                    isCompleted ? "completed" : ""
                  } ${isSkipped ? "skipped" : ""} ${isFuture ? "future" : ""}`}
                >
                  {day.getDate()}
                  {isCompleted && (
                    <div className="day-status completed">
                      <FaFire className="fire-icon" />
                    </div>
                  )}
                  {isSkipped && (
                    <div className="day-status skipped">
                      <FaTimes className="skip-icon" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phần mẹo học liên tục */}
        <div className="streak-tips">
          <h2>Mẹo học liên tục</h2>

          <div className="tip-item">
            <div className="tip-icon time-icon">
              <FaClock />
            </div>
            <p>Học cùng một thời điểm mỗi ngày để tạo thói quen.</p>
          </div>

          <div className="tip-item">
            <div className="tip-icon notificationn-icon">
              <FaBell />
            </div>
            <p>Bật thông báo nhắc nhở để không bỏ lỡ ngày học.</p>
          </div>

          <div className="tip-item">
            <div className="tip-icon goal-icon">
              <FaChartLine />
            </div>
            <p>Đặt mục tiêu nhỏ và tăng dần độ khó để duy trì động lực.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Streak;
