import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authTokenLogin, isTokenExpired } from "../../util/fucntion/auth";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import { encryptData } from "../../util/encryption";
import { toast } from "react-toastify";
import "./myCourse.css";
import {
  Book,
  CheckCircle,
  Clock,
  Collection,
  Key,
  ChevronRight,
  FileEarmarkText,
} from "react-bootstrap-icons";
import DialogFormInformation from "../../util/DialogFormInformation";
import { showSuccess, showError, showWarning, showInfo } from "../../util/notificationService";

interface CourseUserProfile {
  id: number;
  imageUrl: string;
  title: string;
  duration: string;
  enrollment_date: string;
  status: boolean;
  isDeleted: boolean;
  completedDate?: boolean;
  statusCompleted: string;
  createdAt: string;
}

const MyCourse = () => {
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem("authData") || "{}").id;
  const [courses, setCourses] = useState<CourseUserProfile[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseUserProfile[]>(
    []
  );

  const [totalCourse, setTotalCourse] = useState(0);
  const [totalCourseCompleted, setTotalCourseCompleted] = useState(0);
  const [totalCourseStudying, setTotalCourseStudying] = useState(0);

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [size, setSize] = useState(6); // Tăng số lượng hiển thị lên 6
  const refresh = useRefreshToken();
  const [statusCourse, setStatusCourse] = useState(false);

  const [activeTab, setActiveTab] = useState("all"); // Trạng thái tab hiện tại: all, studying, completed, activate, exams
  const [myExams, setMyExams] = useState<any[]>([]);
  const [totalExams, setTotalExams] = useState(0);
  const [examsPage, setExamsPage] = useState(0);
  const [examsTotalPages, setExamsTotalPages] = useState(0);
  const [examsSize, setExamsSize] = useState(8);

  // Course activation states
  const [courseCode, setCourseCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchMyExams = async () => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/tests/by-account-exam/${userId}?page=${examsPage}&size=${examsSize}`,
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
          `Failed to fetch exams data: ${response.status} ${response.statusText}`
        );
        return;
      }

      const data = await response.json();

      if (data && data.status === 200 && data.data) {
        setMyExams(data.data.content || []);
        setTotalExams(data.data.totalElements || 0);
        setExamsTotalPages(data.data.totalPages || 0);
      } else {
        console.error("Invalid exam data format received");
      }
    } catch (error) {
      console.error("Error fetching exams data:", error);
    }
  };

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

  const fetchCoursesWithPagination = async () => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/account/enrolled/${userId}?page=${currentPage}&size=${size}`,
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
        // Giả định dữ liệu có thêm trường để đánh dấu khóa học đã hoàn thành
        const coursesWithStatus = data.content.map(
          (course: CourseUserProfile) => ({
            ...course,
            completed: course.statusCompleted === "Completed", // Đây chỉ là giả lập, cần thay bằng dữ liệu thực
          })
        );

        setCourses(coursesWithStatus);
        setFilteredCourses(coursesWithStatus);

        setTotalPages(data.totalPages);
      } else {
        console.error("Invalid data format received");
      }
    } catch (error) {
      console.error("Error fetching paginated course data:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCourseData();
      fetchCoursesWithPagination();
    } else {
      console.error("No user ID found in localStorage");
    }
  }, [userId, currentPage, size]);

  // Xử lý khi tab thay đổi
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredCourses(courses);
    } else if (activeTab === "studying") {
      setFilteredCourses(
        courses.filter((course) => !course.completedDate && !course.isDeleted)
      );
    } else if (activeTab === "completed") {
      setFilteredCourses(courses.filter((course) => course.completedDate));
    } else if (activeTab === "activate") {
      setFilteredCourses(courses.filter((course) => course.isDeleted));
    } else if (activeTab === "exams") {
      fetchMyExams();
    }
  }, [activeTab, courses]);

  // Handle exams pagination
  useEffect(() => {
    if (activeTab === "exams") {
      fetchMyExams();
    }
  }, [examsPage, examsSize, activeTab]);

  // Handle courses pagination
  useEffect(() => {
    if (activeTab !== "exams" && userId) {
      fetchCoursesWithPagination();
    }
  }, [currentPage, size, activeTab, userId]);

  const handleExamsPageChange = (page: number) => {
    if (page >= 0 && page < examsTotalPages) {
      setExamsPage(page);
    }
  };

  const handleExamsSizeChange = (newSize: number) => {
    setExamsSize(newSize);
    setExamsPage(0); // Reset to first page when changing size
  };

  const handleGoToCoursePlayer = async (course: CourseUserProfile) => {
    if (course.isDeleted) {
      toast.error(
        "Khóa học đang được bảo trì! Vui lòng đợi quản trị viên hoàn tất!"
      );
      return;
    }

    try {
      let token = localStorage.getItem("authToken");
      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return;
        }
        localStorage.setItem("authToken", token);
      }

      // Directly call the progress/add API to create or update progress
      const responseProgress = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/progress/add?accountId=${userId}&courseId=${course.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (responseProgress.ok) {
        const progressData = await responseProgress.json();

        // Extract the necessary data from the response
        const { courseId, chapterId, lessonId } = progressData.data;

        // Encrypt and store the necessary IDs
        const encryptedCourseId = encryptData(courseId);
        const encryptedChapterId = encryptData(chapterId);
        const encryptedLessonId = encryptData(lessonId);

        localStorage.setItem("encryptedCourseId", encryptedCourseId);
        localStorage.setItem("encryptedChapterId", encryptedChapterId);
        localStorage.setItem("encryptedLessonId", encryptedLessonId);

        window.location.href = `/khoa-hoc-thu/vao-hoc`;
      } else {
        toast.error("Không thể tạo tiến trình học. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      toast.error("Đã xảy ra lỗi khi kiểm tra thông tin khóa học.");
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const getTabIcon = () => {
    switch (activeTab) {
      case "all":
        return <Collection className="tab-icon" />;
      case "studying":
        return <Clock className="tab-icon" />;
      case "completed":
        return <CheckCircle className="tab-icon" />;
      case "activate":
        return <Key className="tab-icon" />;
      case "exams":
        return <FileEarmarkText className="tab-icon" />;
      default:
        return <Collection className="tab-icon" />;
    }
  };
  const getAuthData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      try {
        return JSON.parse(authData);
      } catch (error) {
        console.error("Error parsing authData:", error);
        return null;
      }
    }
    return null;
  };

  const closeDialogHandler = () => {
    setOpenDialog(false);
    setShowForm(false);
  };

  const refreshToken = localStorage.getItem("refreshToken");

  const handleCourseCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCourseCode(event.target.value);
    setErrorMessage(""); // Reset error message when user types
  };

  const handleActivateCourseCheck = async () => {
    const auth = getAuthData();
    setIsLoading(true); // Set loading to true when API call starts
    setErrorMessage(""); // Reset any previous error messages
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    try {
      // Make API call to the backend to validate the course code
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/course-codes/check-enable`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: courseCode, accountId: auth.id }), // Send the code in the request body
      });

      const result = await response.json();
      if (response.ok && result.data.valid) {
        showSuccess("Mã kích hoạt hợp lệ. Vui lòng nhập thông tin để hoàn tất kích hoạt.");
        console.log(result.data.valid);
        setShowForm(true);
        setOpenDialog(true);
      } else if (result.message === "Đã thu thập dữ liệu sinh viên") {
        showInfo("Tài khoản đã được thu thập. Đang tiến hành kích hoạt khóa học...");
        setTimeout(() => {
          activateCourse();
        }, 1500);
      } else {
        showError(result.message || "Mã khóa học không hợp lệ.");
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi kích hoạt khóa học. Vui lòng thử lại.");

    } finally {
      setIsLoading(false); // Set loading to false after API call finishes
    }
  };

  const activateCourse = async () => {
    const auth = getAuthData();
    setIsLoading(true);
    setErrorMessage("");
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/course-codes/enable-not-huit`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: courseCode, accountId: auth.id }),
      });
      const result = await response.json();
      if (response.ok && result.status === 200) {
        showSuccess("Kích hoạt khóa học thành công.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showError("Kích hoạt khóa học thất bại.");
      }
    } catch (error) {
      showError("Có lỗi xảy ra khi kích hoạt khóa học. Vui lòng thử lại.");
      setErrorMessage("Có lỗi xảy ra khi kích hoạt khóa học. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const activateCoursePlaceholder = () => {
    return (
      <div className="activate-course-placeholder">
        <div className="placeholder-content">
          <Key size={48} className="placeholder-icon" />
          <h3>Kích hoạt khóa học mới</h3>
          <p>Nhập mã khóa học của bạn để kích hoạt</p>
          <div className="activation-form">
            <input
              type="text"
              className="form-control"
              placeholder="Nhập mã kích hoạt"
              value={courseCode}
              onChange={handleCourseCodeChange}
            />
            <button
              className="btn btn-primary activation-btn"
              onClick={handleActivateCourseCheck}
              disabled={isLoading}
            >
              {isLoading ? "Đang kích hoạt..." : "Kích hoạt"}
            </button>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {showForm && <DialogFormInformation open={openDialog} onClose={closeDialogHandler} courseCode={courseCode} />}
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      {" "}
      <div id="myCourse" className="course-containerr">
        {/* Course stats summary */}
        <div className="course-stats">
          <div className="stat-card total-courses">
            <div className="stat-icon">
              <Book size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalCourse}</div>
              <div className="stat-label">Tổng khóa học</div>
            </div>
          </div>

          <div className="stat-card completed-courses">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalCourseCompleted}</div>
              <div className="stat-label">Đã hoàn thành</div>
            </div>
          </div>

          <div className="stat-card studying-courses">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalCourseStudying}</div>
              <div className="stat-label">Đang học</div>
            </div>
          </div>
        </div>

        {/* Course tabs */}
        <div className="course-tabs">
          <div
            className={`tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <Collection size={18} />
            <span>Tất cả khóa học</span>
          </div>
          <div
            className={`tab ${activeTab === "studying" ? "active" : ""}`}
            onClick={() => setActiveTab("studying")}
          >
            <Clock size={18} />
            <span>Đang học</span>
          </div>
          <div
            className={`tab ${activeTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            <CheckCircle size={18} />
            <span>Đã hoàn thành</span>
          </div>
          <div
            className={`tab ${activeTab === "activate" ? "active" : ""}`}
            onClick={() => setActiveTab("activate")}
          >
            <Key size={18} />
            <span>Kích hoạt khóa học</span>
          </div>
          <div
            className={`tab ${activeTab === "exams" ? "active" : ""}`}
            onClick={() => setActiveTab("exams")}
          >
            <FileEarmarkText size={18} />
            <span>Đề thi của tôi</span>
          </div>
        </div>

        {/* Tab content */}
        <div className="tab-content">
          <div className="tab-header">
            <h2 className="tab-title">
              {getTabIcon()}
              {activeTab === "all" && "Tất cả khóa học"}
              {activeTab === "studying" && "Khóa học đang học"}
              {activeTab === "completed" && "Khóa học đã hoàn thành"}
              {activeTab === "activate" && "Kích hoạt khóa học mới"}
              {activeTab === "exams" && "Đề thi của tôi"}
            </h2>
            <div className="tab-description">
              {(activeTab === "all" || activeTab === "studying" || activeTab === "completed") && (
                <div className="exams-tab-controls">
                  <span>
                    {activeTab === "all" && `Hiển thị tất cả ${filteredCourses.length} khóa học của bạn`}
                    {activeTab === "studying" && `Bạn đang học ${filteredCourses.length} khóa học`}
                    {activeTab === "completed" && `Bạn đã hoàn thành ${filteredCourses.length} khóa học`}
                  </span>
                  <div className="exams-size-selector">
                    <label>Hiển thị:</label>
                    <select
                      className="form-select form-select-sm"
                      value={size}
                      onChange={(e) => {
                        setSize(Number(e.target.value));
                        setCurrentPage(0); // Reset to first page when changing size
                      }}
                    >
                      <option value={3}>3 khóa học / trang</option>
                      <option value={6}>6 khóa học / trang</option>
                      <option value={9}>9 khóa học / trang</option>
                      <option value={12}>12 khóa học / trang</option>
                    </select>
                  </div>
                </div>
              )}
              {activeTab === "activate" &&
                "Kích hoạt các khóa học mới bằng mã kích hoạt"}
              {activeTab === "exams" && (
                <div className="exams-tab-controls">
                  <span>Hiển thị tất cả {totalExams} đề thi của bạn</span>
                  <div className="exams-size-selector">
                    <label>Hiển thị:</label>
                    <select
                      className="form-select form-select-sm"
                      value={examsSize}
                      onChange={(e) => handleExamsSizeChange(Number(e.target.value))}
                    >
                      <option value={4}>4 đề thi / trang</option>
                      <option value={8}>8 đề thi / trang</option>
                      <option value={12}>12 đề thi / trang</option>
                      <option value={16}>16 đề thi / trang</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {activeTab === "activate" ? (
            activateCoursePlaceholder()
          ) : activeTab === "exams" ? (
            <div className="exams-container">
              {myExams.length === 0 ? (
                <div className="empty-course-state">
                  <div className="empty-course-content">
                    <div className="empty-icon">
                      <FileEarmarkText size={48} />
                    </div>
                    <h3>Không có đề thi nào</h3>
                    <p>Bạn chưa được phân công đề thi nào</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="exams-grid">
                    {myExams.map((exam) => (
                      <div className="exam-card" key={exam.testId}>
                        <div className="exam-thumbnail">
                          <img src={exam.imageUrl} alt={exam.testTitle} />
                          <div className="exam-date">
                            {new Date(exam.testCreatedAt).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                        <div className="exam-details">
                          <h3 className="exam-title">{exam.testTitle}</h3>
                          <div className="exam-description" dangerouslySetInnerHTML={{ __html: exam.testDescription }}></div>
                          <div className="exam-actions">
                            <button
                              className="btn btn-primary take-exam-button"
                              onClick={() => {
                                // Navigate to exam page
                                navigate(`/test/${exam.testId}`);
                              }}
                            >
                              Làm bài thi <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination for exams */}
                  {examsTotalPages > 1 && (
                    <div className="pagination-container">
                      <button
                        className={`pagination-button ${examsPage === 0 ? "disabled" : ""}`}
                        onClick={() => handleExamsPageChange(examsPage - 1)}
                        disabled={examsPage === 0}
                      >
                        <span className="pagination-arrow">←</span>
                      </button>

                      <div className="pagination-numbers">
                        {examsTotalPages <= 7 ? (
                          // Hiển thị tất cả trang khi có ít trang
                          [...Array(examsTotalPages)].map((_, index) => (
                            <button
                              key={index}
                              className={`pagination-number ${index === examsPage ? "active" : ""}`}
                              onClick={() => handleExamsPageChange(index)}
                            >
                              {index + 1}
                            </button>
                          ))
                        ) : (
                          // Logic phân trang cho nhiều trang
                          <>
                            {/* Luôn hiển thị trang đầu tiên */}
                            <button
                              className={`pagination-number ${0 === examsPage ? "active" : ""}`}
                              onClick={() => handleExamsPageChange(0)}
                            >
                              1
                            </button>

                            {/* Hiển thị dấu "..." nếu trang hiện tại > 3 */}
                            {examsPage > 3 && (
                              <span className="pagination-ellipsis">...</span>
                            )}

                            {/* Hiển thị các trang xung quanh trang hiện tại */}
                            {[...Array(examsTotalPages)].map((_, index) => {
                              if (
                                (index > 0 && index < examsTotalPages - 1) && // Không phải trang đầu hoặc cuối
                                (index >= examsPage - 1 && index <= examsPage + 1) // Trong phạm vi hiển thị
                              ) {
                                return (
                                  <button
                                    key={index}
                                    className={`pagination-number ${index === examsPage ? "active" : ""}`}
                                    onClick={() => handleExamsPageChange(index)}
                                  >
                                    {index + 1}
                                  </button>
                                );
                              }
                              return null;
                            })}

                            {/* Hiển thị dấu "..." nếu trang hiện tại < examsTotalPages - 4 */}
                            {examsPage < examsTotalPages - 4 && (
                              <span className="pagination-ellipsis">...</span>
                            )}

                            {/* Luôn hiển thị trang cuối cùng */}
                            <button
                              className={`pagination-number ${examsTotalPages - 1 === examsPage ? "active" : ""}`}
                              onClick={() => handleExamsPageChange(examsTotalPages - 1)}
                            >
                              {examsTotalPages}
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        className={`pagination-button ${examsPage === examsTotalPages - 1 ? "disabled" : ""}`}
                        onClick={() => handleExamsPageChange(examsPage + 1)}
                        disabled={examsPage === examsTotalPages - 1}
                      >
                        <span className="pagination-arrow">→</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <>
              {filteredCourses.length === 0 ? (
                <div className="empty-course-state">
                  <div className="empty-course-content">
                    <div className="empty-icon">
                      {activeTab === "studying" && <Clock size={48} />}
                      {activeTab === "completed" && <CheckCircle size={48} />}
                      {activeTab === "all" && <Collection size={48} />}
                    </div>
                    <h3>Không có khóa học nào</h3>
                    <p>
                      {activeTab === "studying" &&
                        "Bạn chưa có khóa học nào đang học"}
                      {activeTab === "completed" &&
                        "Bạn chưa hoàn thành khóa học nào"}
                      {activeTab === "all" && "Bạn chưa đăng ký khóa học nào"}
                    </p>
                    {activeTab !== "completed" && (
                      <button className="btn btn-primary browse-courses-btn">
                        Tìm khóa học mới
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="course-grid">
                  {filteredCourses.map((course) => (
                    <div className="course-card" key={course.id}>
                      <div className="course-thumbnail">
                        <img src={course.imageUrl} alt={course.title} />
                        <div className="course-duration">{course.duration}</div>
                        {course.completedDate && (
                          <div className="course-completed-badge">
                            <CheckCircle size={16} /> Hoàn thành
                          </div>
                        )}
                      </div>
                      <div className="course-detailss">
                        <h3 className="course-title">{course.title}</h3>
                        <div className="course-meta">
                          <div className="enrollment-date">
                            <span>Ngày bắt đầu:</span>{" "}
                            {new Date(
                              course.createdAt
                            ).toLocaleDateString("vi-VN")}
                          </div>
                          <div
                            className={`course-status ${course.isDeleted
                              ? "status-maintenance"
                              : "status-active"
                              }`}
                          >
                            {course.isDeleted
                              ? "Đang bảo trì"
                              : "Đang hoạt động"}
                          </div>
                        </div>
                        <div className="course-actions">
                          <button
                            className={`btn ${course.isDeleted ? "btn-secondary" : "btn-primary"
                              } continue-button`}
                            onClick={() => handleGoToCoursePlayer(course)}
                            disabled={course.isDeleted}
                          >
                            {course.completedDate ? "Xem lại" : "Tiếp tục học"}{" "}
                            <ChevronRight size={16} />
                          </button>
                          <a
                            href={`/khoa-hoc/${course.id}`}
                            className="btn btn-outline-secondary details-button"
                          >
                            Chi tiết
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {filteredCourses.length > 0 && totalPages > 1 && (
                <div className="pagination-container">
                  <button
                    className={`pagination-button ${currentPage === 0 ? "disabled" : ""}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    <span className="pagination-arrow">←</span>
                  </button>

                  <div className="pagination-numbers">
                    {totalPages <= 7 ? (
                      // Hiển thị tất cả trang khi có ít trang
                      [...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          className={`pagination-number ${index === currentPage ? "active" : ""}`}
                          onClick={() => handlePageChange(index)}
                        >
                          {index + 1}
                        </button>
                      ))
                    ) : (
                      // Logic phân trang cho nhiều trang
                      <>
                        {/* Luôn hiển thị trang đầu tiên */}
                        <button
                          className={`pagination-number ${0 === currentPage ? "active" : ""}`}
                          onClick={() => handlePageChange(0)}
                        >
                          1
                        </button>

                        {/* Hiển thị dấu "..." nếu trang hiện tại > 3 */}
                        {currentPage > 3 && (
                          <span className="pagination-ellipsis">...</span>
                        )}

                        {/* Hiển thị các trang xung quanh trang hiện tại */}
                        {[...Array(totalPages)].map((_, index) => {
                          if (
                            (index > 0 && index < totalPages - 1) && // Không phải trang đầu hoặc cuối
                            (index >= currentPage - 1 && index <= currentPage + 1) // Trong phạm vi hiển thị
                          ) {
                            return (
                              <button
                                key={index}
                                className={`pagination-number ${index === currentPage ? "active" : ""}`}
                                onClick={() => handlePageChange(index)}
                              >
                                {index + 1}
                              </button>
                            );
                          }
                          return null;
                        })}

                        {/* Hiển thị dấu "..." nếu trang hiện tại < totalPages - 4 */}
                        {currentPage < totalPages - 4 && (
                          <span className="pagination-ellipsis">...</span>
                        )}

                        {/* Luôn hiển thị trang cuối cùng */}
                        <button
                          className={`pagination-number ${totalPages - 1 === currentPage ? "active" : ""}`}
                          onClick={() => handlePageChange(totalPages - 1)}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    className={`pagination-button ${currentPage === totalPages - 1 ? "disabled" : ""}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                  >
                    <span className="pagination-arrow">→</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCourse;
