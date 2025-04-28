import React, { useState, useEffect } from "react";
import axios from "axios";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/autoplay";
import { Course } from "../../model/Course";
import { formatCurrency } from "./formatCurrency";
import { GET_USER_TOP6_COURSE } from "../../api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const CoursesSlider: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    axios
      .get(GET_USER_TOP6_COURSE)
      .then((response) => {
        setCourses(response.data);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, []);
  const handleLockedCourse = () => {
    toast.error("Khóa học đã bị khóa!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };
  // console.log(courses);
  return (
    <div className="courses__wrp">
      <div className="swiper-container courses__slider">
        <div className="swiper-wrapper">
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            spaceBetween={50}
            slidesPerView={3}
            navigation
            pagination={{ clickable: true }}
            scrollbar={{ draggable: true }}
            loop={true}
            // @ts-ignore
            // onSwiper={(swiper: typeof Swiper) => console.log(swiper)}
            // onSlideChange={() => console.log("slide change")}
            breakpoints={{
              // when window width is <= 768px
              1: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 1,
              },
              // when window width is <= 1024px
              1024: {
                slidesPerView: 3,
              },
            }}
          >
            {courses.map((course) => (
              <SwiperSlide>
                <div key={course.id} className="swiper-slide">
                  <div className="courses__item" style={{ height: "100%" }}>
                    <div className="courses__image image">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        style={{ height: "400px" }}
                      />
                      <div className="courses-price">
                        <h5 className="fs-18">
                          {course.type === "FREE"
                            ? "Miễn Phí"
                            : formatCurrency(course.price)}
                        </h5>
                      </div>
                    </div>
                    <div className="courses__content">
                      <h3>
                        {course.status ? (
                          <a
                            href={`/khoa-hoc/${course.id}`}
                            className="primary-hover"
                          >
                            {course.title}
                          </a>
                        ) : (
                          <span
                            className="course-locked"
                            onClick={handleLockedCourse}
                            style={{ cursor: "pointer" }}
                          >
                            Khóa học đã bị khóa
                          </span>
                        )}
                      </h3>
                      <ul className="d-flex align-items-center gap-4 my-3">
                        <li>
                          <a className="primary-hover fs-14" href="#0">
                            {course.numberOfStudents} Học viên
                          </a>
                        </li>
                        <li>
                          <a className="primary-hover fs-14" href="#0">
                            {course.totalLessons} Bài học
                          </a>
                        </li>
                      </ul>
                      <div className="bor-top pt-3 d-flex align-items-center justify-content-between gap-3">
                        <div className="star">
                          {[...Array(5)].map((_, index) => (
                            <i
                              key={index}
                              className={`fa-sharp fa-solid fa-star ${
                                index < Math.floor(course.averageRating)
                                  ? ""
                                  : "disabled"
                              }`}
                            ></i>
                          ))}
                        </div>

                        <div className="star">
                          {course.type === "FREE" ? (
                            <span className="price-current">Miễn Phí</span>
                          ) : (
                            <>
                              {course.cost > course.price ? (
                                <>
                                  <span
                                    className="price-cost"
                                    style={{ textDecoration: "line-through" }}
                                  >
                                    {formatCurrency(course.cost)}
                                  </span>
                                  <span className="price-current">
                                    {formatCurrency(course.price)}
                                  </span>
                                </>
                              ) : (
                                <span className="price-current">
                                  {formatCurrency(course.price)}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
  
    </div>
    
  );
};

export default CoursesSlider;
