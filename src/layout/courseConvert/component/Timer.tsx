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
    <div>
      <h2>
        Thời gian còn lại: {formattedTime}
      </h2>
    </div>
  );
};

export default Timer;
