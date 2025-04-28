import React from "react";
import styles from "./Dashboard.module.css";

interface DashboardProps {
  progress: string; // Phần trăm hoàn thành
  averageScore: string; // Điểm trung bình
  passRate: string; // Tỷ lệ bài kiểm tra đạt
}

const Dashboard: React.FC<DashboardProps> = ({ progress, averageScore, passRate }) => {

  const formatProgress = (value: string) => {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? "0" : numValue.toFixed(0); // Làm tròn phần trăm, mặc định 0 nếu không phải số
  };

  const formatScore = (score: string) => {
    const numValue = parseFloat(score);
    return isNaN(numValue) ? "0" : numValue.toFixed(1); // Làm tròn điểm trung bình với 1 chữ số thập phân
  };

  const formatPassRate = (rate: string) => {
    const numValue = parseFloat(rate);
    return isNaN(numValue) ? "0" : numValue.toFixed(0); // Làm tròn tỷ lệ phần trăm
  };
  return (
    <div className={styles.dashboard}>
      <div className={styles.card}>
        <h3>Tiến độ học tập</h3>
        <div className={styles.progressBar}>
          <div
            style={{ width: `${formatProgress(progress)}%` }}
            className={styles.progress}
          ></div>
        </div>
        <p>{formatProgress(progress)}% hoàn thành</p>
      </div>

      <div className={styles.card}>
        <h3>Điểm trung bình</h3>
        <p>{formatScore(averageScore)}/10</p>
      </div>

      <div className={styles.card}>
        <h3>Tỷ lệ bài kiểm tra đạt</h3>
        <p>{formatPassRate(passRate)}%</p>
      </div>
    </div>
  );
};

export default Dashboard;
