import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isTokenExpired, refreshToken } from "../../util/fucntion/auth";
import Cookies from "js-cookie";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import { encryptData } from "../../util/encryption";
import { toast } from "react-toastify";
import "./myCourse.css"
interface CourseUserProfile {
  id: number;
  image: string;
  title: string;
  duration: string;
  enrollment_date: string;
  status: boolean;
  isDeleted: boolean;
}
interface RefreshTokenResponse {
  jwt: string; // Access token
  refreshToken: string;
  responsiveDTOJWT: {
    id: number;
    fullname: string;
    email: string;
    roleId: number;
  };
}
const MyCourse = () => {
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem("authData") || "{}").id;
  const [courses, setCourses] = useState<CourseUserProfile[]>([]);

  const [totalCourse, setTotalCourse] = useState(0);
  const [totalCourseCompleted, setTotalCourseCompleted] = useState(0);
  const [totalCourseStudying, setTotalCourseStudying] = useState(0);

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(3);
  const refresh = useRefreshToken();
  const [statusCourse, setStatusCourse] = useState(false);
  const fetchCourseStatus = async (
    courseId: number
  ): Promise<boolean | null> => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/courses/status?courseId=${courseId}`
      );

      if (!response.ok) {
        throw new Error(`Course not found or API error: ${response.status}`);
      }

      const data = await response.json();
      setStatusCourse(data);
      return data;
    } catch (error: any) {
      return null;
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/enrolled-course/count/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error(
            `Failed to fetch course data: ${response.status} ${response.statusText}`
          );
          return;
        }

        const data = await response.json();

        if (data && typeof data === "object") {
          setTotalCourse(data.totalCourse || 0);
          setTotalCourseCompleted(data.totalCourseComplete || 0);
          setTotalCourseStudying(data.totalCourseStudying || 0);
        } else {
          console.error("Invalid data format received");
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
      }
    };

    const fetchCoursesWithPagination = async (page: number) => {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          navigate("/dang-nhap");
          return;
        }
        localStorage.setItem("authToken", token);
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/courses/account/enrolled/${userId}?page=${page}&size=${size}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error(
            `Failed to fetch paginated course data: ${response.status} ${response.statusText}`
          );
          return;
        }

        const data = await response.json();

        if (data && typeof data === "object") {
          setCourses(data.content);
          setTotalPages(data.totalPages);
        } else {
          console.error("Invalid data format received");
        }
      } catch (error) {
        console.error("Error fetching paginated course data:", error);
      }
    };

    if (userId) {
      fetchCourseData();
      fetchCoursesWithPagination(currentPage);
    } else {
      console.error("No user ID found in localStorage");
    }
  }, [userId, currentPage]);
  const handleGoToCoursePlayer = async (course: CourseUserProfile) => {
    // const status = await fetchCourseStatus(course.id);
    if (course.isDeleted) {
      toast.error(
        "Khóa học đang được bảo trì ! Vui lòng đợi quản trị viên hoàn tất !"
      );
      return;
    } else {
      try {
        let token = localStorage.getItem("token");
        if (isTokenExpired(token)) {
          token = await refresh();
          if (!token) {
            window.location.href = "/dang-nhap";
            return;
          }
          localStorage.setItem("authToken", token);
        }

        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/enrolled-course/status?accountId=${userId}&courseId=${course.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const status = await response.text();
          // console.log("Status của khóa học:", status);

          if (status === "Actived") {
            const responseCourse = await fetch(
              `${process.env.REACT_APP_SERVER_HOST}/api/courses/${course.id}/first-chapter-lesson`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (responseCourse.ok) {
              const courseData = await responseCourse.json();
              const { chapterId, lessonId } = courseData;
              const responseProgress = await fetch(
                `${process.env.REACT_APP_SERVER_HOST}/api/progress/add?accountId=${userId}&courseId=${course.id}&chapterId=${chapterId}&lessonId=${lessonId}`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              if (responseProgress.ok) {
                const progress = await responseProgress.json();
                const encryptedCourseId = encryptData(course.id);
                const encryptedChapterId = encryptData(chapterId);
                const encryptedLessonId = encryptData(lessonId);

                localStorage.setItem("encryptedCourseId", encryptedCourseId);
                localStorage.setItem("encryptedChapterId", encryptedChapterId);
                localStorage.setItem("encryptedLessonId", encryptedLessonId);

                window.location.href = `/khoa-hoc-thu/vao-hoc`;
              } else {
                alert("Không thể thêm tiến trình học.");
              }
            } else {
              alert("Không thể lấy chương và bài học đầu tiên.");
            }
          } else {
            const encryptedCourseId = encryptData(course.id);
            localStorage.setItem("encryptedCourseId", encryptedCourseId);
            window.location.href = `/khoa-hoc-thu/vao-hoc`;
          }
        } else {
          alert("Không thể lấy thông tin khóa học.");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
        alert("Đã xảy ra lỗi khi kiểm tra thông tin khóa học.");
      }
    }
  };
  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };
  return (
    <div id="myCourse" className="container-fluid">
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3">
            <div className="card-header">Tổng số khóa học</div>
            <div className="card-body">
              <h5 className="card-title">{totalCourse}</h5>
              <p className="card-text">Khóa học hiện có</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-white bg-warning mb-3">
            <div className="card-header">Khóa học hoàn thành</div>
            <div className="card-body">
              <h5 className="card-title">{totalCourseCompleted}</h5>
              <p className="card-text">Khóa học đã hoàn thành</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-danger mb-3">
            <div className="card-header">Khóa học đang học</div>
            <div className="card-body">
              <h5 className="card-title">{totalCourseStudying}</h5>
              <p className="card-text">Khóa học đang diễn ra</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {courses.map((course, index) => (
          <div className="col-xl-4 col-md-6" key={index}>
            <div className="courses-two__item">
              <div
                className="courses-two__image image"
                style={{ textAlign: "center", height: "270px" }}
              >
                <img
                  style={{ width: "100%", height: "100%" }}
                  src={course.image}
                  alt={course.title}
                />
                <span className="time">{course.duration}</span>
              </div>
              <div className="courses__content pt-4 p-0">
                <div className="row">
                  <div className="col-md-8">
                    <h3>
                      <a
                        href={`/khoa-hoc/${course.id}`}
                        className="primary-hover"
                      >
                        {course.title}
                      </a>
                    </h3>
                  </div>
                  <div className="col-md-4" style={{ textAlign: "right" }}>
                    <p>
                      BĐ :
                      {new Date(course.enrollment_date).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>
                <div className="d-flex align-items-center  gap-3 my-course-btn-error">
                  <p style={{ color: course.isDeleted ? "red" : "green" }}>
                    {course.isDeleted ? "Khóa học đang được bảo trì" : "Khóa học đang hoạt động"}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleGoToCoursePlayer(course)}
                  >
                    Vào học
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pegi justify-content-center mt-60">
        {/* Nút "Trang trước" */}
        <a
          href="#0"
          onClick={() => handlePageChange(currentPage - 1)}
          className={`border-none ${currentPage === 0 ? "disabled" : ""}`}
          aria-disabled={currentPage === 0}
        >
          <i className="fa-regular fa-arrow-left primary-color transition"></i>
        </a>

        {/* Số trang */}
        {[...Array(totalPages)].map((_, index) => (
          <a
            key={index}
            href="#0"
            onClick={() => handlePageChange(index)}
            className={index === currentPage ? "active" : ""}
          >
            {index + 1}
          </a>
        ))}

        {/* Nút "Trang sau" */}
        <a
          href="#0"
          onClick={() => handlePageChange(currentPage + 1)}
          className={`border-none ${currentPage === totalPages - 1 ? "disabled" : ""
            }`}
          aria-disabled={currentPage === totalPages - 1}
        >
          <i className="fa-regular fa-arrow-right primary-color transition"></i>
        </a>
      </div>
    </div>
  );
};
export default MyCourse;
