import React, { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExamList as ExamListUser } from "../../../model/ExamList";
import { formatCurrency } from "../../util/formatCurrency";
import NavExam from "./NavExample";
import "./examlist.css";

type ExamListProps = {
  exams: ExamListUser[];
};

// Tiện ích chuyển chuỗi thành slug
const slugify = (text: string): string =>
  text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

// Chuyển đổi mức độ khó sang tiếng Việt
const formatLevel = (level: string): string => {
  switch (level.toUpperCase()) {
    case "EASY":
      return "Dễ";
    case "MEDIUM":
      return "Trung bình";
    case "HARD":
      return "Khó";
    default:
      return level;
  }
};

// Render độ khó của đề thi
const ExamDifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const colorMap: Record<string, string> = {
    easy: "#28a745",
    medium: "#ffc107",
    hard: "#dc3545",
  };
  const color = colorMap[difficulty.toLowerCase()] || "#6c757d";
  return (
    <div className="difficulty-badge" style={{ color }}>
      <i className="fas fa-signal-alt mr-1"></i>
      <span>{formatLevel(difficulty)}</span>
    </div>
  );
};

// Empty State
const EmptyState = () => (
  <div className="col-12 empty-exam-list">
    <h2>Không có đề thi</h2>
  </div>
);

function ExamList({ exams = [] }: ExamListProps) {
  const navigate = useNavigate();

  // Handler khi click vào đề thi
  const handleExamClick = useCallback(
    (exam: ExamListUser) => {
      if (exam.status === "INACTIVE") return;
      const examSlug = slugify(exam.title);
      localStorage.setItem("danhmucdethi", examSlug);
      navigate(`/de-thi/${examSlug}-${exam.testId}`);
    },
    [navigate]
  );

  // Render card cho mỗi đề thi
  const renderExamCard = (exam: ExamListUser) => {
    const examSlug = slugify(exam.title);
    const examDetailUrl = `/de-thi/${examSlug}-${exam.testId}`;
    const handleLinkClick = () =>
      localStorage.setItem("danhmucdethi", examSlug);

    return (
      <div key={exam.testId} className="col-xl-4 col-md-6">
        <div className="exam-card">
          <div className="exam-image">
            <Link to={examDetailUrl} onClick={handleLinkClick} style={{ width: "100%" ,objectFit: "cover" }}>
              <img
                src={exam.imageUrl || "/placeholder-exam.png"}
                alt={exam.title || "Exam image"}
                
              />
            </Link>
            <span className="time-limit">
              <i className="far fa-clock"></i>
              {Math.floor(exam.duration / 60)} phút
            </span>
          </div>
          <div className="exam-content">
            <h3 className="exam-title">
              <Link
                to={examDetailUrl}
                onClick={handleLinkClick}
                title={exam.title}
              >
                {exam.title}
              </Link>
            </h3>
            <ul className="exam-meta">
              <li>
                <i className="fas fa-users"></i>
                {exam.itemCountReview} lượt thi
              </li>
              <li>
                <i className="fas fa-questions"></i>
                {exam.totalQuestion} câu hỏi
              </li>
            </ul>
            <div className="exam-footer">
              <ExamDifficultyBadge difficulty={exam.level} />
              <div className="exam-price">
                {exam.examType === "FREE" ? (
                  <span className="free-badge">Miễn Phí</span>
                ) : (
                  <div className="price-info">
                    {exam.cost > exam.price && (
                      <span className="original-price">
                        {formatCurrency(exam.cost)}
                      </span>
                    )}
                    <span className="current-price">
                      {formatCurrency(exam.price)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Lọc chỉ đề thi ACTIVE
  const activeExams = exams.filter((exam) => exam.status === "ACTIVE");

  return (
    <div className="row g-4">
      <NavExam />
      <div className="col-xl-9 col-lg-8 col-md-12">
        <div className="row g-4">
          {activeExams.length ? (
            activeExams.map(renderExamCard)
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

export default ExamList;
