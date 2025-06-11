import React from 'react';
import './loading.css';

interface SubmissionLoaderProps {
    isVisible: boolean;
    message?: string;
    showProgress?: boolean;
}

const SubmissionLoader: React.FC<SubmissionLoaderProps> = ({
    isVisible,
    message = 'Đang gửi bài kiểm tra...',
    showProgress = false
}) => {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        if (isVisible && showProgress) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    // Simulate progress that slows down as it approaches 100%
                    const increment = Math.max(1, 10 * (1 - prev / 100));
                    const newProgress = Math.min(95, prev + increment);
                    return newProgress;
                });
            }, 300);

            return () => clearInterval(interval);
        } else if (!isVisible) {
            setProgress(0);
        }
    }, [isVisible, showProgress]);

    if (!isVisible) return null;

    return (
        <div className="submission-overlay">
            <div className="submission-content">
                <div className="spinner-dual-ring"></div>
                <h3 className="submission-title">{message}</h3>

                {showProgress && (
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                        <div className="progress-text">{Math.round(progress)}%</div>
                    </div>
                )}

                <p className="submission-info">Vui lòng không đóng cửa sổ này</p>
            </div>

            <style>{`
        .submission-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          backdrop-filter: blur(3px);
        }
        
        .submission-content {
          background-color: white;
          padding: 30px 40px;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          text-align: center;
          max-width: 400px;
          width: 90%;
        }
        
        .submission-title {
          margin: 20px 0 15px;
          color: #333;
          font-weight: 600;
        }
        
        .submission-info {
          margin-top: 15px;
          color: #666;
          font-size: 14px;
        }
        
        .progress-container {
          width: 100%;
          height: 10px;
          background-color: #f0f0f0;
          border-radius: 5px;
          margin: 20px 0;
          position: relative;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          border-radius: 5px;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #333;
          font-size: 12px;
          font-weight: bold;
        }
      `}</style>
        </div>
    );
};

export default SubmissionLoader; 