import React, { useState, useEffect } from "react";
import axios from "axios";
import "./teammember.css";

interface Lecturer {
  id: number;
  accountId: number;
  fullname: string;
  avatarUrl: string;
  courseCount: number;
  averageRating: number;
  instruction: string;
  expert: string;
  totalStudents: number;
  categoryId: number;
  categoryName: string;
}

const TeamMembers: React.FC = () => {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 3;

  useEffect(() => {
    const fetchLecturers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/api/lecturers`);
        
        if (response.data.status === 200) {
          // Sort by totalStudents in descending order
          const sortedLecturers = response.data.data.content
            .sort((a: Lecturer, b: Lecturer) => b.totalStudents - a.totalStudents)
            .slice(0, 5); // Take top 5
          
          setLecturers(sortedLecturers);
        } else {
          setError("Failed to load lecturer data");
        }
      } catch (err) {
        console.error("Error fetching lecturers:", err);
        setError("Failed to load lecturer data");
      } finally {
        setLoading(false);
      }
    };

    fetchLecturers();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      if (prev === 0) {
        // Nếu đang ở đầu, chuyển đến vị trí cuối cùng có thể
        return Math.max(0, lecturers.length - itemsPerView);
      }
      return prev - 1;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (prev >= lecturers.length - itemsPerView) {
        // Nếu đang ở cuối, quay lại đầu
        return 0;
      }
      return prev + 1;
    });
  };

  if (loading) {
    return (
      <div className="team-members">
        <div className="section-header">
          <h2>Đội ngũ của chúng tôi</h2>
        </div>
        <div className="loading-spinner">Đang tải thông tin giảng viên...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="team-members">
        <div className="section-header">
          <h2>Đội ngũ của chúng tôi</h2>
        </div>
        <div className="error-message">Có lỗi xảy ra: {error}</div>
      </div>
    );
  }

  return (
    <div className="team-members">
      <div className="section-header">
        <h2
          className="wow fadeInUp"
          data-wow-delay="200ms"
          data-wow-duration="1500ms"
        >
          Đội ngũ giảng viên hàng đầu
          <span style={{ margin: "0px 10px" }}>
            <img src="assets/images/shape/header-shape.png" alt="shape" />
          </span>
        </h2>
      </div>

      <div className="team-slider-container">
        <button className="nav-button prev" onClick={handlePrev}>
          <i className="fas fa-chevron-left"></i>
        </button>

        <div
          className="scroll-container"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
          }}
        >
          {lecturers.map((lecturer) => (
            <div key={lecturer.id} className="team-member">
              <div className="member-img">
                <img src={lecturer.avatarUrl || "/assets/images/goku.png"} alt={lecturer.fullname} />
              </div>
              <h4>{lecturer.fullname}</h4>
              <p className="text-muted">{lecturer.categoryName}</p>
              <div className="member-stats">
                <p className="rating">
                  <i className="fas fa-star"></i> {lecturer.averageRating.toFixed(1)}
                </p>
                <p className="students">
                  <i className="fas fa-user-graduate"></i> {lecturer.totalStudents} học viên
                </p>
              </div>
            </div>
          ))}
        </div>

        <button className="nav-button next" onClick={handleNext}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default TeamMembers;
