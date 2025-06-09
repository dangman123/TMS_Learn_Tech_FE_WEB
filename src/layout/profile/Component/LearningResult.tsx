// import React, { useEffect, useState } from "react";
// import { isTokenExpired } from "../../util/fucntion/auth";
// import useRefreshToken from "../../util/fucntion/useRefreshToken";
// // import Dashboard from "./ComponentResultLearning/Dashboard";
// import TestList from "./ComponentResultLearning/TestList";
// import Chart from "./ComponentResultLearning/Chart";
// import CustomPieChart from "./ComponentResultLearning/CustomPieChart";

// interface CourseData {
//     id: number;
//     duration: string;
//     title: string;
//     enrollment_date: string;
// }

// interface TestData {
//     id: number;
//     title: string;
//     score: number;
//     status: string;
//     date: Date;
// }

// interface TestResult {
//     status: string;
//     countTest: number;
// }

// function LearningResult() {
//     const itemsPerPage = 5; // Số lượng bài kiểm tra hiển thị mỗi trang
//     const [currentPage, setCurrentPage] = useState(0);
//     const [loading, setLoading] = useState(true);
//     const [activeTab, setActiveTab] = useState("test"); // "test" hoặc "exam"

//     const [progress, setProgress] = useState<string>("0");
//     const [averageScore, setAverageScore] = useState<string>("0");
//     const [passRate, setPassRate] = useState<string>("0");
//     const [tests, setTests] = useState<TestData[]>([]);
//     const [exams, setExams] = useState<TestData[]>([]);
//     const [testResults, setTestResults] = useState<TestResult[]>([]);
//     const [courses, setCourses] = useState<CourseData[]>([]);
//     const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
//     const refresh = useRefreshToken();

//     const getUserData = () => {
//         const authData = localStorage.getItem("authData");
//         if (authData) {
//             return JSON.parse(authData);
//         }
//         return null;
//     };

//     const user = getUserData();

//     // Fetch danh sách khóa học
//     const fetchCourses = async () => {
//         setLoading(true);
//         let token = localStorage.getItem("authToken");

//         if (isTokenExpired(token)) {
//             token = await refresh();
//             if (!token) {
//                 window.location.href = "/dang-nhap";
//                 return;
//             }
//             localStorage.setItem("authToken", token);
//         }

//         try {
//             const response = await fetch(
//                 `${process.env.REACT_APP_SERVER_HOST}/api/courses/account/enrolled/${user.id}?page=0&size=100`,
//                 {
//                     method: "GET",
//                     headers: {
//                         "Content-Type": "application/json",
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );
//             const data = await response.json();
//             setCourses(data.content || []);

//             // Nếu có khóa học, mặc định chọn khóa học đầu tiên
//             if (data.content && data.content.length > 0) {
//                 setSelectedCourseId(data.content[0].id.toString());
//             }
//         } catch (error) {
//             console.error("Error fetching courses:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fetch dữ liệu bài kiểm tra
//     const fetchTestData = async () => {
//         if (!selectedCourseId) return;

//         setLoading(true);
//         let token = localStorage.getItem("authToken");

//         if (isTokenExpired(token)) {
//             token = await refresh();
//             if (!token) {
//                 window.location.href = "/dang-nhap";
//                 return;
//             }
//             localStorage.setItem("authToken", token);
//         }

//         try {
//             // Fetch thông tin tiến độ, điểm trung bình và tỷ lệ đạt
//             const [progressRes, avgScoreRes, passRateRes, testsRes, testResultsRes] =
//                 await Promise.all([
//                     fetch(
//                         `${process.env.REACT_APP_SERVER_HOST}/api/progress/calculate?accountId=${user.id}&courseId=${selectedCourseId}`,
//                         {
//                             headers: {
//                                 Authorization: `Bearer ${token}`,
//                             },
//                         }
//                     ),
//                     fetch(
//                         `${process.env.REACT_APP_SERVER_HOST}/api/test-results/average-score?accountId=${user.id}&courseId=${selectedCourseId}`,
//                         {
//                             headers: {
//                                 Authorization: `Bearer ${token}`,
//                             },
//                         }
//                     ),
//                     fetch(
//                         `${process.env.REACT_APP_SERVER_HOST}/api/test-results/pass-rate?accountId=${user.id}&courseId=${selectedCourseId}`,
//                         {
//                             headers: {
//                                 Authorization: `Bearer ${token}`,
//                             },
//                         }
//                     ),
//                     fetch(
//                         `${process.env.REACT_APP_SERVER_HOST}/api/test-results/result/detail?accountId=${user.id}&courseId=${selectedCourseId}`,
//                         {
//                             headers: {
//                                 Authorization: `Bearer ${token}`,
//                             },
//                         }
//                     ),
//                     fetch(
//                         `${process.env.REACT_APP_SERVER_HOST}/api/test-results/result-count?accountId=${user.id}&courseId=${selectedCourseId}`,
//                         {
//                             headers: {
//                                 Authorization: `Bearer ${token}`,
//                             },
//                         }
//                     ),
//                 ]);

//             // Xử lý dữ liệu trả về
//             if (progressRes.ok) setProgress(await progressRes.text());
//             if (avgScoreRes.ok) setAverageScore(await avgScoreRes.text());
//             if (passRateRes.ok) setPassRate(await passRateRes.text());

//             if (testsRes.ok) {
//                 const data = await testsRes.json();
//                 setTests(
//                     data.map((test: any) => ({
//                         id: test[0],
//                         title: test[1],
//                         score: test[2],
//                         status: test[3],
//                         date: new Date(test[4]),
//                     }))
//                 );
//             }

//             if (testResultsRes.ok) {
//                 const data = await testResultsRes.json();
//                 setTestResults(
//                     data.map((result: any) => ({
//                         status: result[0],
//                         countTest: result[1],
//                     }))
//                 );
//             }
//         } catch (error) {
//             console.error("Error fetching test data:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fetch dữ liệu bài thi
//     const fetchExamData = async () => {
//         setLoading(true);
//         let token = localStorage.getItem("authToken");

//         if (isTokenExpired(token)) {
//             token = await refresh();
//             if (!token) {
//                 window.location.href = "/dang-nhap";
//                 return;
//             }
//             localStorage.setItem("authToken", token);
//         }

//         try {
//             const response = await fetch(
//                 `${process.env.REACT_APP_SERVER_HOST}/api/exams/history/${user.id}?page=0&size=10`,
//                 {
//                     method: "GET",
//                     headers: {
//                         "Content-Type": "application/json",
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             if (response.ok) {
//                 const data = await response.json();
//                 setExams(
//                     (data.content || []).map((exam: any) => ({
//                         id: exam.examId,
//                         title: exam.examTitle,
//                         score: exam.score,
//                         status: exam.passed ? "Đạt" : "Chưa đạt",
//                         date: new Date(exam.completionDate),
//                     }))
//                 );
//             }
//         } catch (error) {
//             console.error("Error fetching exam data:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchCourses();
//     }, []);

//     useEffect(() => {
//         if (activeTab === "test" && selectedCourseId) {
//             fetchTestData();
//         } else if (activeTab === "exam") {
//             fetchExamData();
//         }
//     }, [selectedCourseId, activeTab]);

//     const handleCourseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
//         setSelectedCourseId(e.target.value);
//     };

//     const handleTabChange = (tab: string) => {
//         setActiveTab(tab);
//     };

//     const handlePageChange = (newPage: number) => {
//         setCurrentPage(newPage);
//     };

//     // Phân trang dữ liệu bài kiểm tra hoặc bài thi
//     const displayData = activeTab === "test" ? tests : exams;
//     const totalPages = Math.ceil(displayData.length / itemsPerPage);
//     const startIndex = currentPage * itemsPerPage;
//     const endIndex = startIndex + itemsPerPage;
//     const paginatedData = displayData.slice(startIndex, endIndex);

//     // Dữ liệu cho biểu đồ
//     const chartData = paginatedData.map((item) => ({
//         name: item.title,
//         score: item.score,
//     }));

//     const pieData = testResults.map((item) => ({
//         name: item.status,
//         value: item.countTest,
//     }));

//     return (
//         <div id="learningResult" className="container-fluid py-4">
//             {/* Header Section */}
//             <div className="row mb-4">
//                 <div className="col-12">
//                     <h3 className="text-primary fw-bold mb-2">Kết quả học tập</h3>
//                     <p className="text-muted">
//                         Theo dõi tiến độ học tập và kết quả kiểm tra của bạn
//                     </p>
//                 </div>
//             </div>

//             {/* Tab Navigation */}
//             <div className="row mb-4">
//                 <div className="col-12">
//                     <div className="card border-0 shadow-sm">
//                         <div className="card-header bg-white pt-4 pb-0 border-0">
//                             <ul className="nav nav-tabs border-0">
//                                 <li className="nav-item">
//                                     <button
//                                         className={`nav-link ${activeTab === "test" ? "active fw-semibold" : ""}`}
//                                         onClick={() => handleTabChange("test")}
//                                     >
//                                         <i className="bi bi-journal-check me-2"></i>
//                                         Bài kiểm tra
//                                     </button>
//                                 </li>
//                                 <li className="nav-item">
//                                     <button
//                                         className={`nav-link ${activeTab === "exam" ? "active fw-semibold" : ""}`}
//                                         onClick={() => handleTabChange("exam")}
//                                     >
//                                         <i className="bi bi-file-earmark-text me-2"></i>
//                                         Bài thi
//                                     </button>
//                                 </li>
//                             </ul>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {activeTab === "test" && (
//                 <>
//                     {/* Course Selection */}
//                     <div className="row mb-4">
//                         <div className="col-12">
//                             <div className="card border-0 shadow-sm">
//                                 <div className="card-body">
//                                     <div className="form-group">
//                                         <label htmlFor="courseSelect" className="form-label">Chọn khóa học:</label>
//                                         <select
//                                             id="courseSelect"
//                                             className="form-select"
//                                             value={selectedCourseId || ""}
//                                             onChange={handleCourseSelect}
//                                         >
//                                             {courses.map((course) => (
//                                                 <option key={course.id} value={course.id}>
//                                                     {course.title}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Dashboard Cards */}
//                     {/* <div className="row mb-4">
//                         <div className="col-12">
//                             <Dashboard
//                                 progress={progress}
//                                 averageScore={averageScore}
//                                 passRate={passRate}
//                             />
//                         </div>
//                     </div> */}
//                 </>
//             )}

//             {/* Test/Exam Results */}
//             <div className="row mb-4">
//                 <div className="col-md-8">
//                     <div className="card border-0 shadow-sm h-100">
//                         <div className="card-body">
//                             <TestList tests={paginatedData} />

//                             {/* Pagination */}
//                             {totalPages > 1 && (
//                                 <div className="d-flex justify-content-center mt-4">
//                                     <nav aria-label="Page navigation">
//                                         <ul className="pagination">
//                                             <li className={`page-item ${currentPage === 0 ? "disabled" : ""}`}>
//                                                 <button
//                                                     className="page-link"
//                                                     onClick={() => handlePageChange(currentPage - 1)}
//                                                 >
//                                                     <i className="bi bi-chevron-left"></i>
//                                                 </button>
//                                             </li>

//                                             {[...Array(totalPages)].map((_, i) => (
//                                                 <li
//                                                     key={i}
//                                                     className={`page-item ${currentPage === i ? "active" : ""}`}
//                                                 >
//                                                     <button
//                                                         className="page-link"
//                                                         onClick={() => handlePageChange(i)}
//                                                     >
//                                                         {i + 1}
//                                                     </button>
//                                                 </li>
//                                             ))}

//                                             <li className={`page-item ${currentPage === totalPages - 1 ? "disabled" : ""}`}>
//                                                 <button
//                                                     className="page-link"
//                                                     onClick={() => handlePageChange(currentPage + 1)}
//                                                 >
//                                                     <i className="bi bi-chevron-right"></i>
//                                                 </button>
//                                             </li>
//                                         </ul>
//                                     </nav>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="col-md-4">
//                     <div className="card border-0 shadow-sm h-100">
//                         <div className="card-body">
//                             <h5 className="card-title mb-4">Phân tích kết quả</h5>
//                             {activeTab === "test" && pieData.length > 0 && (
//                                 <CustomPieChart data={pieData} />
//                             )}

//                             {activeTab === "test" && pieData.length === 0 && (
//                                 <div className="text-center py-5 text-muted">
//                                     <i className="bi bi-bar-chart-line fs-1 mb-3 d-block"></i>
//                                     <p>Chưa có dữ liệu để hiển thị biểu đồ</p>
//                                 </div>
//                             )}

//                             {activeTab === "exam" && (
//                                 <div className="text-center py-5 text-muted">
//                                     <i className="bi bi-pie-chart fs-1 mb-3 d-block"></i>
//                                     <p>Biểu đồ thống kê bài thi sẽ được cập nhật sau</p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Performance Chart */}
//             <div className="row">
//                 <div className="col-12">
//                     <div className="card border-0 shadow-sm">
//                         <div className="card-body">
//                             <h5 className="card-title mb-4">Biểu đồ điểm số</h5>
//                             {chartData.length > 0 ? (
//                                 <div className="chart-container" style={{ height: "400px" }}>
//                                     <Chart data={chartData} />
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-5 text-muted">
//                                     <i className="bi bi-bar-chart-line fs-1 mb-3 d-block"></i>
//                                     <p>Chưa có dữ liệu để hiển thị biểu đồ</p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default LearningResult; 