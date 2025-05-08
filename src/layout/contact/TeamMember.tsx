import React, { useState } from "react";
import "./teammember.css";

const TeamMembers: React.FC = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      role: "Giảng viên AI & Machine Learning",
      image: "/assets/images/goku.png",
    },
    {
      id: 2,
      name: "Trần Thị B",
      role: "Giảng viên Web Development",
      image: "/assets/images/goku.png",
    },
    {
      id: 3,
      name: "Lê Văn C",
      role: "Giảng viên Mobile Development",
      image: "/assets/images/goku.png",
    },
    {
      id: 4,
      name: "Phạm Thị D",
      role: "Giảng viên UI/UX Design",
      image: "/assets/images/goku.png",
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      role: "Giảng viên DevOps",
      image: "/assets/images/goku.png",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 3;

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      if (prev === 0) {
        // Nếu đang ở đầu, chuyển đến vị trí cuối cùng có thể
        return teamMembers.length - itemsPerView;
      }
      return prev - 1;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (prev >= teamMembers.length - itemsPerView) {
        // Nếu đang ở cuối, quay lại đầu
        return 0;
      }
      return prev + 1;
    });
  };

  return (
    <div className="team-members">
      <div className="section-header">
        <h2
          className="wow fadeInUp"
          data-wow-delay="200ms"
          data-wow-duration="1500ms"
        >
          Đội ngũ của chúng tôi
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
          {teamMembers.map((member) => (
            <div key={member.id} className="team-member">
              <div className="member-img">
                <img src={member.image} alt={member.name} />
              </div>
              <h4>{member.name}</h4>
              <p className="text-muted">{member.role}</p>
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
