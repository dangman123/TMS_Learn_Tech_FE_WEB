import React from "react";
import "./RankingInfoDialog.css";
import {
  X,
  Star,
  PlayCircle,
  QuestionCircle,
  BarChart,
  CheckSquare,
  Fire,
  Trophy,
} from "react-bootstrap-icons";

interface RankingInfoDialogProps {
  onClose: () => void;
}

const RankingInfoDialog: React.FC<RankingInfoDialogProps> = ({ onClose }) => {
  return (
    <div className="ranking-info-overlay">
      <div className="ranking-info-dialog">
        <div className="ranking-info-content">
          <div className="ranking-info-header">
            <div className="gradient-header">
              <div className="star-icon">
                <Star size={28} color="white" />
              </div>
              <div className="header-text">
                <h2>Cách tính điểm</h2>
                <p>Cải thiện điểm số để đạt thứ hạng cao!</p>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="ranking-info-body">
            <h3>Hệ thống học tập</h3>

            <div className="point-item">
              <div className="point-icon video-iconn">
                <PlayCircle size={24} />
              </div>
              <div className="point-info">
                <div className="point-title">Hoàn thành video bài học</div>
                <div className="point-badge">+5 điểm</div>
              </div>
            </div>

            <div className="point-item">
              <div className="point-icon quiz-icon">
                <QuestionCircle size={24} />
              </div>
              <div className="point-info">
                <div className="point-title">Hoàn thành bài kiểm tra</div>
                <div className="point-badge yellow">+10 điểm</div>
              </div>
            </div>

            <div className="point-item">
              <div className="point-icon chapter-icon">
                <BarChart size={24} />
              </div>
              <div className="point-info">
                <div className="point-title">
                  Hoàn thành bài kiểm tra chương
                </div>
                <div className="point-badge purple">+30 điểm</div>
              </div>
            </div>

            <div className="point-item">
              <div className="point-icon perfect-icon">
                <CheckSquare size={24} />
              </div>
              <div className="point-info">
                <div className="point-title">Đạt điểm tuyệt đối (100%)</div>
                <div className="point-badge green">+5 điểm bổ sung</div>
              </div>
            </div>

            <div className="point-item">
              <div className="point-icon streak-icon">
                <Fire size={24} />
              </div>
              <div className="point-info">
                <div className="point-title">
                  Duy trì học tập 7 ngày liên tục
                </div>
                <div className="point-badge red">+25 điểm</div>
              </div>
            </div>

            <div className="point-item">
              <div className="point-icon course-icon">
                <Trophy size={24} />
              </div>
              <div className="point-info">
                <div className="point-title">Hoàn thành toàn bộ khóa học</div>
                <div className="point-badge yellow-large">+100 điểm</div>
              </div>
            </div>

            <div className="point-tip">
              <div className="tip-icon">💡</div>
              <div className="tip-text">
                Điểm xếp hạng được cập nhật hàng giờ. Duy trì học tập đều đặn để
                tăng điểm nhanh nhất!
              </div>
            </div>

            <button className="understood-btn" onClick={onClose}>
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingInfoDialog;
