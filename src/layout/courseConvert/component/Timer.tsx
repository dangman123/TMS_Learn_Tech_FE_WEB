import React, { useState, useEffect } from "react";

// Định nghĩa interface cho props
interface TimerProps {
  initialTime: number;
}

const Timer: React.FC<TimerProps> = ({ initialTime }) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(timerId); // Cleanup để tránh memory leak
  }, [timeLeft]);

  return (
    <div>
      <h2>
        Thời gian còn lại: {Math.floor(timeLeft / 60)}:{timeLeft % 60}
      </h2>
    </div>
  );
};

export default Timer;
