import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./take-test.module.css";

interface TestResult {
  testId: number;
  correctQuestion: number;
  incorrectQuestion: number;
  score: number;
  totalQuestion: number;
  accountId: number;
  resultTest: string;
  rateTesting: number;
  durationTest: number;
  courseId: number;
}

interface PopupResultProps {
  testResult: TestResult;
}

const PopupResult: React.FC<PopupResultProps> = ({ testResult }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // Delay hiển thị component để tránh vấn đề suspension
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Hàm xử lý điều hướng với timeout để tránh suspension
  const handleNavigate = (path: string) => {
    setIsNavigating(true);
    
    // Sử dụng setTimeout để trì hoãn việc chuyển trang
    // Giúp React có thời gian để hoàn thành các hoạt động hiện tại
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.confirmOverlay}>
      <div className={styles.resultDialog}>
        <h2>Kết quả bài thi</h2>
        
        <div className={styles.resultHeader}>
          <div className={`${styles.resultStatus} ${testResult.resultTest === "Pass" ? styles.resultPass : styles.resultFail}`}>
            {testResult.resultTest === "Pass" ? "Đạt" : "Không đạt"}
          </div>
          <div className={styles.resultScore}>
            {testResult.score}/{testResult.totalQuestion * 0.5}
          </div>
        </div>
        
        <div className={styles.resultDetails}>
          <div className={styles.resultItem}>
            <span className={styles.resultLabel}>Tỉ lệ đúng:</span>
            <span className={styles.resultValue}>{testResult.rateTesting}%</span>
          </div>
          <div className={styles.resultItem}>
            <span className={styles.resultLabel}>Câu đúng:</span>
            <span className={styles.resultValue}>{testResult.correctQuestion}/{testResult.totalQuestion}</span>
          </div>
          <div className={styles.resultItem}>
            <span className={styles.resultLabel}>Câu sai:</span>
            <span className={styles.resultValue}>{testResult.incorrectQuestion}</span>
          </div>
          <div className={styles.resultItem}>
            <span className={styles.resultLabel}>Thời gian làm bài:</span>
            <span className={styles.resultValue}>{Math.floor(testResult.durationTest / 60)} phút {testResult.durationTest % 60} giây</span>
          </div>
        </div>
        
        <div className={styles.resultButtons}>
          <button
            className={styles.homeButton}
            onClick={() => handleNavigate("/")}
            disabled={isNavigating}
          >
            {isNavigating ? "Đang chuyển..." : "Về trang chủ"}
          </button>
          <button
            className={styles.learningButton}
            onClick={() => handleNavigate("/tai-khoan/my-course")}
            disabled={isNavigating}
          >
            {isNavigating ? "Đang chuyển..." : "Về trang học tập"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupResult;
