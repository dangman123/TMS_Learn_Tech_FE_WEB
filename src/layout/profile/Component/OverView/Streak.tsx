import React, { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
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

const Streak: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 3, 22)); // Tháng 4/2025

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  const firstDayOfMonth = getDay(start);

  // Số ngày streak hiện tại
  const streakCount = 15;

  // Tỷ lệ hoàn thành
  const completionRate = 100;

  // Danh sách ngày đã điểm danh và ngày đã bỏ lỡ
  const completedDays = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const skippedDays = [13, 14];

  // Ngày hiện tại là ngày 15
  const today = new Date(2025, 3, 15);

  // Trạng thái của ngày hôm nay
  const [todayStatus, setTodayStatus] = useState<
    "pending" | "completed" | "skipped"
  >("pending");

  // Xử lý khi nhấn nút Hoàn thành
  const handleComplete = () => {
    setTodayStatus("completed");
    // Thêm logic cập nhật completedDays nếu cần
  };

  // Xử lý khi nhấn nút Bỏ lỡ
  const handleSkip = () => {
    setTodayStatus("skipped");
    // Thêm logic cập nhật skippedDays nếu cần
  };

  return (
    <div className="wrapper">
      <div className="container-steack">
        {/* Phần được bọc màu vàng nhạt */}
        <div className="highlighted-section">
          {/* Số ngày streak */}
          <div className="streak-count">
            <h1 className="streak-number">{streakCount}</h1>
            <div className="streak-text">ngày streak</div>
          </div>

          {/* Thông báo */}
          <div className="motivation-box">
            <div className="motivation-icon">
              <FaTrophy />
            </div>
            <div>
              <p>
                <span>
                  Bạn đang xây dựng thói quen học tập tốt.{" "}
                  <span className="motivation-link">Hãy tiếp tục duy trì!</span>
                </span>
              </p>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="streak-actions">
            <button
              className={`btn-complete ${
                todayStatus === "completed" ? "active" : ""
              }`}
              onClick={handleComplete}
              disabled={
                todayStatus === "completed" || todayStatus === "skipped"
              }
            >
              Hoàn thành
            </button>
            <button
              className={`btn-skip ${
                todayStatus === "skipped" ? "active" : ""
              }`}
              onClick={handleSkip}
              disabled={
                todayStatus === "completed" || todayStatus === "skipped"
              }
            >
              Bỏ lỡ
            </button>
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
              <div className="stat-value">{streakCount}</div>
              <div className="stat-label">Chuỗi dài nhất</div>
            </div>

            <div className="stat-item">
              <div className="stat-icon calendar-bg">
                <BsCalendarCheck />
              </div>
              <div className="stat-value">{completionRate}%</div>
              <div className="stat-label">Tỷ lệ hoàn thành</div>
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
              const dayNumber = day.getDate();
              const isToday =
                day.getDate() === today.getDate() &&
                day.getMonth() === today.getMonth();
              const isCompleted = completedDays.includes(dayNumber);
              const isSkipped = skippedDays.includes(dayNumber);
              const isFuture = day > today;

              return (
                <div
                  key={day.toString()}
                  className={`day ${isToday ? "today" : ""} ${
                    isCompleted ? "completed" : ""
                  } ${isSkipped ? "skipped" : ""} ${isFuture ? "future" : ""}`}
                >
                  {dayNumber}
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
