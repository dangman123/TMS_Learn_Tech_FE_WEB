import React, { useState, useEffect } from "react";

// Định nghĩa interface cho props
interface TimerProps {
  initialTime: number;
  onTimeUpdate?: (usedTime: number) => void; 
}

const Timer: React.FC<TimerProps> = ({ initialTime, onTimeUpdate }) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);
  const [startTime] = useState<number>(Date.now());   

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;
        // Tính thời gian đã sử dụng (giây)
        const usedTime = initialTime - newTime;

        // Gọi callback nếu có
        if (onTimeUpdate) {
          onTimeUpdate(usedTime);
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId); // Cleanup để tránh memory leak
  }, [initialTime, onTimeUpdate]);

  // Format thời gian để hiển thị đẹp hơn
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="test-time" style={{
      background: "rgba(78, 115, 223, 0.1)",
      color: "#4e73df",
      padding: "8px 15px",
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      gap: "5px"
    }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clock" viewBox="0 0 16 16">
        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
      </svg>
      Thời gian còn lại: {formattedTime}
    </div>
  );
};

export default Timer;
