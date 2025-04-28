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

const Streak: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 3, 22)); // Tháng 4/2025

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  const firstDayOfMonth = getDay(start);

  const markedDays = [11];
  const today = new Date(2025, 3, 12);

  return (
    <div className="wrapper">
      <div className="container-steack">
        {/* Phần được bọc màu vàng nhạt */}
        <div className="highlighted-section">
          {/* Số ngày streak */}
          <div className="streak-count">
            <h1 className="streak-number">0</h1>
            <div className="streak-text">ngày streak</div>
          </div>

          {/* Hộp động lực */}
          <div className="motivation-box">
            <div className="motivation-icon"></div>
            <div>
              <p>
                <span>
                  Học một bài học ngay hôm nay để bắt đầu{" "}
                  <span className="motivation-link">chuỗi streak mới nào!</span>
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Lịch */}
        <div>
          <h1 className="calendar-title">Lịch</h1>
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
                day.getMonth() === today.getMonth();
              const isMarked = markedDays.includes(day.getDate());
              const isFuture = day > today;

              return (
                <div
                  key={day.toString()}
                  className={`day ${isToday ? "today" : ""} ${
                    isMarked ? "marked" : ""
                  } ${isFuture ? "future" : ""}`}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Streak;
