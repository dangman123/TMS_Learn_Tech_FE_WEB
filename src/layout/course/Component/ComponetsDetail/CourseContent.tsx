import React, { useMemo } from "react";
import { CoureseDetail } from "../../../../model/CoureseDetail";

interface Review {
  id: number;
  rating: number;
  review: string;
  updated_at: string;
  created_at: string;
  account_id: number;
  fullname: string;
  image: string;
}

interface CourseContentProps {
  course: CoureseDetail;
  reviews: Review[] | null;
}

export const CourseContent: React.FC<CourseContentProps> = ({ course, reviews = [] }) => {

  const { averageRating, totalReviews } = useMemo(() => {
    const reviewsArray = Array.isArray(reviews) ? reviews : [];
    const totalReviews = reviewsArray.length;
    const totalRating = reviewsArray.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    return { averageRating, totalReviews };
  }, [reviews]);

  if (!course) {
    return <p>Loading course data...</p>;
  }
  const formatTime = (seconds: number): string => {
    if (seconds < 0) return "Invalid time";
    const minutes = Math.floor(seconds / 60);
    const formattedMinutes = minutes < 10 ? String(minutes).padStart(2, '0') : minutes;
    const remainingSeconds = seconds % 60;
    const formattedSecond = remainingSeconds < 10 ? String(remainingSeconds).padStart(2, '0') : remainingSeconds;
    return `${formattedMinutes}:${formattedSecond}`;
  };
  return (
    <div className="courses-details__item-left" style={{ backgroundColor: "white", borderRadius: "10px" }}>
      <div className="image">
        <img src={course.imageUrl} alt={course.title} className="img-detail-course" ></img>
      </div>
      <div style={{ padding: "20px" }}>
        <a href="#0" className="tag" >
          {course.language}
        </a>
        <h3 className="fs-30 mt-20 mb-20">{course.title}</h3>
        <ul className="pt-10 pb-10 d-flex flex-wrap align-items-center gap-3 gap-md-5 bor-top bor-bottom">
          <li className="mb-0">
            <a href="#0" className="primary-hover">
              Tác giả:  {course.author}
            </a>
          </li>
          <li className="mb-0">
            <svg
              className="me-1"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_1396_3523)">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 19C14.9706 19 19 14.9707 19 10C19 5.02944 14.9707 0.999979 10 0.999979C5.02944 0.999979 0.999979 5.02944 0.999979 10C0.999979 14.9706 5.02944 19 10 19ZM10 20C15.5228 20 20 15.5228 20 10C20 4.47711 15.5228 0 10 0C4.47711 0 0 4.47711 0 10C0 15.5228 4.47711 20 10 20Z"
                  fill="#2EB97E"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.6006 9.99928L8.00204 6.9336V13.0651L12.6006 9.99928ZM13.5297 9.41687C13.9453 9.69399 13.9453 10.3047 13.5297 10.5818L8.09026 14.2081C7.62509 14.5183 7.00195 14.1847 7.00195 13.6256V6.37304C7.00195 5.81395 7.62509 5.48048 8.09026 5.79063L13.5297 9.41687Z"
                  fill="#2EB97E"
                />
              </g>
              <defs>
                <clipPath id="clip0_1396_3523">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <a href="#0" className="primary-hover">
              {formatTime(course.duration)}
            </a>
          </li>
          <li>
            <svg
              className="me-1"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 1.5L11.3175 6.195L16.5 6.9525L12.75 10.605L13.635 15.765L9 13.3275L4.365 15.765L5.25 10.605L1.5 6.9525L6.6825 6.195L9 1.5Z"
                fill="#FFA41B"
              />
            </svg>

            <a href="#0" className="primary-hover">
              {averageRating.toFixed(1)} ({totalReviews} Reviews)
            </a>
          </li>
        </ul>


        {/* <div className="content mt-30 mb-30" style={{ color: "black" }}>
        
          <div dangerouslySetInnerHTML={{ __html: course.courseOutput }}></div>
        </div> */}
        <h2 style={{ marginBottom: "0px" }}>GIỚI THIỆU</h2>
        <div className="content" style={{ color: "black", marginTop: "20px" }}>
          <div dangerouslySetInnerHTML={{ __html: course.description }}></div>
        </div>
      </div>

    </div>
  );
};
