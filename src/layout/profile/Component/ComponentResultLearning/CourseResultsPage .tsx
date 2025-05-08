import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { toast } from "react-toastify";
import {
  Book,
  CheckCircle,
  Clock,
  Collection,
  Key,
  ChevronRight,
  ArrowLeft,
} from "react-bootstrap-icons";

// Import components from ResultPage
import Filter from "./Filter";
import Dashboard from "./Dashboard";
import TestList from "./TestList";
import Chart from "./Chart";
import CustomPieChart from "./CustomPieChart";

// Course interfaces
interface CourseUserProfile {
  id: number;
  image: string;
  title: string;
  duration: string;
  enrollment_date: string;
  status: boolean;
  isDeleted: boolean;
  completed?: boolean;
}

// Result interfaces
interface TestData {
  id: number;
  title: string;
  score: number;
  status: string;
  date: Date;
}

interface TestResult {
  status: string;
  countTest: number;
}

interface CourseData {
  id: number;
  duration: string;
  title: string;
  enrollment_date: string;
}

const CourseResultsPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams(); // Get courseId from URL params
  const userId = JSON.parse(localStorage.getItem("authData") || "{}").id;
  const refresh = useRefreshToken();

  // State for MyCourse
  const [showResults, setShowResults] = useState(false);
  const [courses, setCourses] = useState<CourseUserProfile[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<CourseUserProfile[]>(
    []
  );
  const [totalCourse, setTotalCourse] = useState(0);
  const [totalCourseCompleted, setTotalCourseCompleted] = useState(0);
  const [totalCourseStudying, setTotalCourseStudying] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [size] = useState(6);
  const [activeTab, setActiveTab] = useState("all");

  // State for ResultPage
  const itemsPerPage = 5;
  const [currentResultPage, setCurrentResultPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<string>("0");
  const [averageScore, setAverageScore] = useState<string>("0");
  const [passRate, setPassRate] = useState<string>("0");
  const [tests, setTests] = useState<TestData[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedCourse, setSelectedCourse] =
    useState<CourseUserProfile | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [resultCourses, setResultCourses] = useState<CourseData[]>([]);

  useEffect(() => {
    // If courseId is provided in URL, show results page
    if (courseId) {
      setShowResults(true);
      setSelectedCourseId(courseId);
    }

    fetchCourseData();
    fetchCoursesWithPagination(currentPage);
  }, [userId, currentPage, courseId]);

  // Effect for filtering courses based on active tab
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredCourses(courses);
    } else if (activeTab === "studying") {
      setFilteredCourses(
        courses.filter((course) => !course.completed && !course.isDeleted)
      );
    } else if (activeTab === "completed") {
      setFilteredCourses(courses.filter((course) => course.completed));
    } else if (activeTab === "activate") {
      setFilteredCourses(courses.filter((course) => course.isDeleted));
    }
  }, [activeTab, courses]);

  // Effect for ResultPage data loading
  useEffect(() => {
    if (showResults && selectedCourseId) {
      fetchResultCourses();
      fetchAllResultData();
    }
  }, [showResults, selectedCourseId]);

  useEffect(() => {
    if (resultCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(resultCourses[0].id.toString());
    }
  }, [resultCourses]);

  // Fetch course summary data
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

  // Fetch courses with pagination
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
        // Giả định dữ liệu có thêm trường để đánh dấu khóa học đã hoàn thành
        const coursesWithStatus = data.content.map(
          (course: CourseUserProfile) => ({
            ...course,
            completed: Math.random() > 0.5, // Đây chỉ là giả lập, cần thay bằng dữ liệu thực
          })
        );

        setCourses(coursesWithStatus);
        setFilteredCourses(coursesWithStatus);
        setTotalPages(data.totalPages);

        // If courseId is provided, find and set the selected course
        if (courseId) {
          const selected = coursesWithStatus.find(
            (course: CourseUserProfile) => course.id.toString() === courseId
          );
          if (selected) {
            setSelectedCourse(selected);
          }
        }
      } else {
        console.error("Invalid data format received");
      }
    } catch (error) {
      console.error("Error fetching paginated course data:", error);
    }
  };

  // Fetch courses for Result page
  const fetchResultCourses = async () => {
    setLoading(true);
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
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/account/enrolled/${userId}?page=0&size=100`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setResultCourses(data.content || []);
    } catch (error) {
      console.error("Error fetching test results:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all result data
  const fetchAllResultData = async () => {
    if (!selectedCourseId) return;

    setLoading(true);
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
      // Fetch từng API song song
      const [progressRes, avgScoreRes, passRateRes, testsRes, testResultsRes] =
        await Promise.all([
          fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/progress/calculate?accountId=${userId}&courseId=${selectedCourseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/test-results/average-score?accountId=${userId}&courseId=${selectedCourseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/test-results/pass-rate?accountId=${userId}&courseId=${selectedCourseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/test-results/result/detail?accountId=${userId}&courseId=${selectedCourseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/test-results/result-count?accountId=${userId}&courseId=${selectedCourseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

      // Xử lý response
      if (progressRes.ok) setProgress(await progressRes.text());
      if (avgScoreRes.ok) setAverageScore(await avgScoreRes.text());
      if (passRateRes.ok) setPassRate(await passRateRes.text());
      if (testsRes.ok) {
        const data = await testsRes.json();
        setTests(
          data.map((test: any) => ({
            id: test[0],
            title: test[1],
            score: test[2],
            status: test[3],
            date: new Date(test[4]),
          }))
        );
      }
      if (testResultsRes.ok) {
        const data = await testResultsRes.json();
        setTestResults(
          data.map((result: any) => ({
            status: result[0],
            countTest: result[1],
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle course click to show results
  const handleViewCourseResults = (course: CourseUserProfile) => {
    setSelectedCourse(course);
    setSelectedCourseId(course.id.toString());
    setShowResults(true);
    // Update URL without refreshing the page
  };

  // Handle page change for course list
  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle page change for test results
  const handleResultPageChange = (page: number) => {
    if (page >= 0 && page < totalResultPages) {
      setCurrentResultPage(page);
    }
  };

  // Handle back to course list
  const handleBackToCourses = () => {
    setShowResults(false);
    setSelectedCourse(null);
  };

  // Handle course select in result page
  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  // Calculate paginated tests
  const totalResultPages = Math.ceil(tests.length / itemsPerPage);
  const startIndex = currentResultPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTests = tests.slice(startIndex, endIndex);

  // Prepare chart data
  const chartData = paginatedTests.map((test) => ({
    name: test.title,
    score: test.score,
  }));

  const pieData = testResults.map((item) => ({
    name: item.status,
    value: item.countTest,
  }));

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
      default:
        return <Collection className="tab-icon" />;
    }
  };

  // Render course list or result page based on showResults state
  return (
    <div className="container-fluid">
      {!showResults ? (
        // MyCourse Component
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
              </h2>
              <div className="tab-description">
                {activeTab === "all" &&
                  `Hiển thị tất cả ${filteredCourses.length} khóa học của bạn`}
                {activeTab === "studying" &&
                  `Bạn đang học ${filteredCourses.length} khóa học`}
                {activeTab === "completed" &&
                  `Bạn đã hoàn thành ${filteredCourses.length} khóa học`}
                {activeTab === "activate" &&
                  "Kích hoạt các khóa học mới bằng mã kích hoạt"}
              </div>
            </div>

            {activeTab === "activate" ? (
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
                    />
                    <button className="btn btn-primary activation-btn">
                      Kích hoạt
                    </button>
                  </div>
                </div>
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
                          <img src={course.image} alt={course.title} />
                          <div className="course-duration">
                            {course.duration}
                          </div>
                          {course.completed && (
                            <div className="course-completed-badge">
                              <CheckCircle size={16} /> Hoàn thành
                            </div>
                          )}
                        </div>
                        <div className="course-details">
                          <h3 className="course-title">{course.title}</h3>
                          <div className="course-meta">
                            <div className="enrollment-date">
                              <span>Ngày bắt đầu:</span>{" "}
                              {new Date(
                                course.enrollment_date
                              ).toLocaleDateString("vi-VN")}
                            </div>
                            <div
                              className={`course-status ${
                                course.isDeleted
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
                              className="btn btn-primary continue-button"
                              onClick={() => handleViewCourseResults(course)}
                            >
                              Xem kết quả <ChevronRight size={16} />
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
                      className={`pagination-button ${
                        currentPage === 0 ? "disabled" : ""
                      }`}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                    >
                      <span className="pagination-arrow">←</span>
                    </button>

                    <div className="pagination-numbers">
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          className={`pagination-number ${
                            index === currentPage ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(index)}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      className={`pagination-button ${
                        currentPage === totalPages - 1 ? "disabled" : ""
                      }`}
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
      ) : (
        // ResultPage Component
        <div className="result-page mt-20">
          <div className="back-to-courses mb-4">
            <button
              className="btn btn-outline-primary"
              onClick={handleBackToCourses}
            >
              <ArrowLeft size={16} /> Quay lại danh sách khóa học
            </button>
            {selectedCourse && (
              <h2 className="selected-course-title mt-2">
                Kết quả học tập: {selectedCourse.title}
              </h2>
            )}
          </div>

          <Filter
            courses={resultCourses}
            onCourseSelect={handleCourseSelect}
            selectCourseID={selectedCourseId}
          />

          <Dashboard
            progress={progress}
            averageScore={averageScore}
            passRate={passRate}
          />

          <TestList tests={paginatedTests} />

          <div className="row">
            <div className="col-md-8">
              <div className="chart-container">
                <Chart data={chartData} />
              </div>

              <div className="pegi justify-content-center mt-60">
                <a
                  href="#0"
                  onClick={() => handleResultPageChange(currentResultPage - 1)}
                  className={`border-none ${
                    currentResultPage === 0 ? "disabled" : ""
                  }`}
                >
                  <i className="fa-regular fa-arrow-left primary-color transition"></i>
                </a>
                {[...Array(totalResultPages)].map((_, index) => (
                  <a
                    key={index}
                    href="#0"
                    onClick={() => handleResultPageChange(index)}
                    className={index === currentResultPage ? "active" : ""}
                  >
                    {index + 1}
                  </a>
                ))}
                <a
                  href="#0"
                  onClick={() => handleResultPageChange(currentResultPage + 1)}
                  className={`border-none ${
                    currentResultPage === totalResultPages - 1 ? "disabled" : ""
                  }`}
                >
                  <i className="fa-regular fa-arrow-right primary-color transition"></i>
                </a>
              </div>
            </div>

            <div className="col-md-4">
              <CustomPieChart data={pieData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseResultsPage;
