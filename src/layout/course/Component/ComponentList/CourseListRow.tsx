import React, { useEffect, useState, useRef } from "react";
import { CourseList as CourseListUser } from "../../../../model/CourseList";
import { Link } from "react-router-dom";
import axios from "axios";
import "./ListRow.css";

interface CourseListRowProps {
  title: string;
  type: "popular" | "discount" | "category";
}

const CourseListRow: React.FC<CourseListRowProps> = ({ title, type }) => {
  const [courses, setCourses] = useState<CourseListUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleCourses = 5; // Number of visible courses

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}/api/courses/public/filter?type=${type}`
        );
        if (response.data.status === 200) {
          setCourses(response.data.data.content);
        }
      } catch (error) {
        console.error(`Failed to fetch ${type} courses:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [type]);

  // Handle navigation - move one course at a time
  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const handleNext = () => {
    if (startIndex < courses.length - visibleCourses) {
      setStartIndex(startIndex + 1);
    }
  };

  // Function for URL slug creation - copied from CourseList.tsx
  const removeVietnameseTones = (str: string): string => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
  };

  // Function to handle course click - similar to CourseList.tsx
  const handleCourseClick = (courseId: number, courseTitle: string) => {
    if (!courseId) {
      console.error("Khóa học không hợp lệ!");
      return;
    }

    const courseSlug = removeVietnameseTones(courseTitle);
    localStorage.setItem("tenkhoahoc", courseSlug);
    
    // Use the same URL pattern as CourseList.tsx
    window.location.href = `/khoa-hoc/${courseSlug}-${courseId}`;
  };

  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="fas fa-star"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star"></i>);
      }
    }
    return stars;
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Get the currently visible courses
  const displayedCourses = courses.slice(
    startIndex,
    startIndex + visibleCourses
  );

  // Check if navigation buttons should be visible
  const showPrevButton = startIndex > 0;
  const showNextButton = startIndex < courses.length - visibleCourses;

  return (
    <div className="course-list-row-container" ref={containerRef}>
      <div className="course-list-row-header">
        <h2>{title}</h2>
      </div>

      {loading ? (
        <div className="course-list-row-spinner-container">
          <div className="course-list-row-spinner" role="status">
            <span className="course-list-row-visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="course-list-row-grid">
          {showPrevButton && (
            <button 
              className="course-list-row-nav-btn prev" 
              onClick={handlePrev} 
              aria-label="Previous course"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
          )}
          
          {showNextButton && (
            <button 
              className="course-list-row-nav-btn next" 
              onClick={handleNext} 
              aria-label="Next course"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          )}

          {displayedCourses.map((course) => (
            <a
              href="#"
              className="course-list-row-card"
              key={course.id}
              onClick={(e) => {
                e.preventDefault();
                handleCourseClick(course.id, course.title);
              }}
            >
              <div className="course-list-row-image">
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  onError={(e) => {
                    // Fallback image if the original one fails to load
                    e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Course+Image';
                  }}
                />
                {(course.percentDiscount ?? 0) > 0 && (
                  <div className="course-list-row-discount-badge">
                    -{course.percentDiscount}%
                  </div>
                )}
              </div>

              <div className="course-list-row-info">
                <h3 className="course-list-row-title">{course.title}</h3>

                <div className="course-list-row-author">
                  {course.author || "Instructor"}
                </div>

                <div className="course-list-row-rating">
                  <span className="course-list-row-rating-value">
                    {course.rating?.toFixed(1)}
                  </span>
                  <div className="course-list-row-rating-stars">
                    {renderStars(course.rating || 0)}
                  </div>
                  <span className="course-list-row-rating-count">
                    ({course.itemCountReview || 0})
                  </span>
                </div>

                <div className="course-list-row-price">
                  {formatPrice(course.price || course.cost)} đ
                  {(course.percentDiscount ?? 0) > 0 && (
                    <span className="course-list-row-original-price">
                      {formatPrice(course.cost)} đ
                    </span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseListRow;
