import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../../util/fucntion/useRefreshToken';
import { authTokenLogin, isTokenExpired } from '../../../util/fucntion/auth';
import styles from './LearningResultsPage.module.css';
import {
    Book, BarChart, PieChart, CheckCircle, PersonCircle,
    Clock, Calendar3, Star, GraphUp, Activity,
    Award, ClipboardData, BookHalf, Folder, Person,
    ExclamationTriangle, Lightbulb, XLg, ArrowRight
} from 'react-bootstrap-icons';
import CustomPieChart from './CustomPieChart';
import { Modal, Button, Tab, Nav } from 'react-bootstrap';
import axios from 'axios';

// Interfaces
interface CourseData {
    id: number;
    title: string;
    duration: string;
    enrollment_date: string;
    imageUrl?: string;
    instructor?: string;
    category?: string;
    completionPercentage?: number;
}

interface ProgressData {
    courseId: number;
    progress: number;
    completedLessons: number;
    totalLessons: number;
    completedTime: number;
    totalTime: number;
    lastActivity?: Date;
    strongestTopic?: string;
    weakestTopic?: string;
    averageScore?: number;
    passRate?: number;
}

interface UserProfile {
    id: number;
    name: string;
    level: string;
    totalCourses: number;
    completedCourses: number;
    totalTests: number;
    averageScore: number;
    memberSince: Date;
}
interface TestResult {
    result: string;
    total: number;
}

interface Test {
    testResultId: number;
    testName: string;
    score: number;
    result: string;
    completedAt: Date;
}

interface PredictionData {
    riskLevel: 'high' | 'medium' | 'low';
    riskScore: number;
    reasons: string[];
    suggestions: string[];
}

interface ProgressResponse {
    progress: number;
    accountId: number;
    courseId: number;
    lessonCompleted: number;
    totalLesson: number;
    maxScore: number;
}

// Main Component
const LearningResultsPage: React.FC = () => {
    // States for data
    const [courses, setCourses] = useState<CourseData[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(() => {
        // Khôi phục selectedCourseId từ localStorage nếu có
        const savedCourseId = localStorage.getItem("selectedCourseId");
        return savedCourseId || null;
    });


    const [progressData, setProgressData] = useState<ProgressData | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [predictionData, setPredictionData] = useState<PredictionData | null>(null);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [tests, setTests] = useState<Test[]>([]);
    const [averageScore, setAverageScore] = useState<number>(0);
    const [passRate, setPassRate] = useState<number>(0);

    // Phân trang
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(5);
    const [totalElements, setTotalElements] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [loadingTests, setLoadingTests] = useState<boolean>(false);
    const [initialLoad, setInitialLoad] = useState<boolean>(true);
    const [tableInitialized, setTableInitialized] = useState<boolean>(false);

    // Stats
    const [progress, setProgress] = useState<ProgressResponse | null>(null);

    // UI states
    const [loading, setLoading] = useState<boolean>(true);
    const [showPredictionModal, setShowPredictionModal] = useState<boolean>(false);
    const navigate = useNavigate();
    const refresh = useRefreshToken();
    const refreshToken = localStorage.getItem("refreshToken");

    // Tính toán các chỉ số phân trang
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    // Thay đổi trang
    const paginate = (pageNumber: number) => {
        if (pageNumber < 1) return;
        if (pageNumber > totalPages) return;
        if (pageNumber === currentPage) return;

        // Chỉ cập nhật trang hiện tại, useEffect sẽ tự động gọi API
        setCurrentPage(pageNumber);
    };

    // Get user data
    const getUserData = () => {
        const authData = localStorage.getItem("authData");
        if (authData) {
            return JSON.parse(authData);
        }
        return null;
    };

    const user = getUserData();

    // Fetch courses
    const fetchCourses = async () => {
        setLoading(true);
        const token = await authTokenLogin(refreshToken, refresh, navigate);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_HOST}/api/courses/account/enrolled/${user.id}?page=0&size=100`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();
            let coursesList = data.content || [];

            // Map API response to our CourseData interface
            coursesList = coursesList.map((course: any) => ({
                ...course,
                enrollment_date: course.createdAt || new Date().toISOString(),
                instructor: course.author || "Không có thông tin",
                category: "Khóa học",
                completionPercentage: parseFloat(course.progress || "0")
            }));

            // Thêm dữ liệu ảo nếu coursesList rỗng hoặc có ít hơn 3 khóa học
            if (coursesList.length < 3) {
                const demoCourses: CourseData[] = [
                    {
                        id: 10001,
                        title: "Lập trình Web với React và TypeScript",
                        duration: "40 giờ",
                        enrollment_date: new Date(Date.now() - 30 * 86400000).toISOString(),
                        imageUrl: "https://img-c.udemycdn.com/course/750x422/2323508_a3ef.jpg",
                        instructor: "Nguyễn Văn A",
                        category: "Lập trình Web",
                        completionPercentage: 78
                    },
                    {
                        id: 10002,
                        title: "Machine Learning cơ bản đến nâng cao",
                        duration: "60 giờ",
                        enrollment_date: new Date(Date.now() - 60 * 86400000).toISOString(),
                        imageUrl: "https://img-c.udemycdn.com/course/750x422/3482452_4a11_3.jpg",
                        instructor: "Trần Văn B",
                        category: "AI & Machine Learning",
                        completionPercentage: 45
                    },
                    {
                        id: 10003,
                        title: "Lập trình di động với Flutter",
                        duration: "36 giờ",
                        enrollment_date: new Date(Date.now() - 15 * 86400000).toISOString(),
                        imageUrl: "https://img-c.udemycdn.com/course/750x422/1708340_7108_4.jpg",
                        instructor: "Lê Thị C",
                        category: "Mobile App Development",
                        completionPercentage: 92
                    }
                ];

                coursesList = [...coursesList, ...demoCourses.filter(c => !coursesList.find((ec: any) => ec.id === c.id))];
            }

            setCourses(coursesList);

            // Tạo dữ liệu hồ sơ người dùng ảo
            setUserProfile({
                id: user.id,
                name: user.fullName || "Học viên",
                level: "Intermediate",
                totalCourses: coursesList.length,
                completedCourses: Math.floor(coursesList.length * 0.3),
                totalTests: 24,
                averageScore: 7.8,
                memberSince: new Date(Date.now() - 180 * 86400000)
            });


        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when course changes
    const fetchTestData = async () => {
        if (!selectedCourseId) return;

        setLoading(true);
        let token = localStorage.getItem("authToken");

        if (isTokenExpired(token)) {
            token = await refresh();
            if (!token) {
                window.location.href = "/dang-nhap";
                return;
            }
            localStorage.setItem("authToken", token);
        }

        try {
            // Fetch thông tin tiến độ, điểm trung bình và tỷ lệ đạt
            const [progressRes, avgScoreRes, passRateRes, testResultsRes] =
                await Promise.all([
                    fetch(
                        `${process.env.REACT_APP_SERVER_HOST}/api/progress/calculate-user?accountId=${user.id}&courseId=${selectedCourseId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    ),
                    fetch(
                        `${process.env.REACT_APP_SERVER_HOST}/api/test-results/average-score?accountId=${user.id}&courseId=${selectedCourseId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    ),
                    fetch(
                        `${process.env.REACT_APP_SERVER_HOST}/api/test-results/pass-rate?accountId=${user.id}&courseId=${selectedCourseId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    ),
                    fetch(
                        `${process.env.REACT_APP_SERVER_HOST}/api/test-results/result-count?accountId=${user.id}&courseId=${selectedCourseId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    ),
                ]);

            // Xử lý dữ liệu trả về
            let currentProgress = 0;
            let currentAverageScore = 0;
            let currentPassRate = 0;
            let newProgress: ProgressResponse | null = null;

            if (progressRes.ok) {
                const responseData = await progressRes.json();
                if (responseData.data) {
                    newProgress = responseData.data;
                    currentProgress = newProgress?.progress || 0;
                    setProgress(newProgress);
                }
            }

            if (avgScoreRes.ok) {
                const scoreText = await avgScoreRes.text();
                currentAverageScore = parseFloat(scoreText) || 0;
                setAverageScore(currentAverageScore);
            }

            if (passRateRes.ok) {
                const rateText = await passRateRes.text();
                currentPassRate = parseFloat(rateText) || 0;
                setPassRate(currentPassRate);
            }

            if (testResultsRes.ok) {
                const data = await testResultsRes.json();
                setTestResults(data.data || []);
            }

            // Tạo progressData dựa trên dữ liệu đã lấy
            const newProgressData: ProgressData = {
                courseId: parseInt(selectedCourseId),
                progress: currentProgress,
                completedLessons: newProgress?.lessonCompleted || 0,
                totalLessons: newProgress?.totalLesson || 0,
                completedTime: Math.floor(Math.random() * 1000) * 60,
                totalTime: 3600 * 20,
                lastActivity: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000),
                strongestTopic: "JavaScript",
                weakestTopic: "CSS & Styling",
                averageScore: currentAverageScore,
                passRate: currentPassRate
            };

            setProgressData(newProgressData);

            // Reset tableInitialized khi đổi khóa học
            setTableInitialized(false);

            // Gọi API lấy chi tiết kết quả bài kiểm tra (phân trang)
            await fetchTestResultsDetail();

        } catch (error) {
            console.error("Error fetching test data:", error);
        } finally {
            setLoading(false); // Kết thúc loading cho toàn trang
        }
    };

    // Hàm riêng để lấy chi tiết kết quả bài kiểm tra (phân trang)
    const fetchTestResultsDetail = async () => {
        if (!selectedCourseId) return;

        setLoadingTests(true);
        let token = localStorage.getItem("authToken");

        if (isTokenExpired(token)) {
            token = await refresh();
            if (!token) {
                window.location.href = "/dang-nhap";
                return;
            }
            localStorage.setItem("authToken", token);
        }

        try {
            // Gọi API với tham số phân trang
            const response = await fetch(
                `${process.env.REACT_APP_SERVER_HOST}/api/test-results/result/detail?accountId=${user.id}&courseId=${selectedCourseId}&page=${currentPage - 1}&size=${itemsPerPage}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data && data.data) {
                    // Cấu trúc phản hồi mới
                    setTests(data.data.content || []);
                    setTotalElements(data.data.totalElements || 0);
                    setTotalPages(data.data.totalPages || 0);
                    setItemsPerPage(data.data.size || 5);
                } else {
                    // Tương thích ngược với cấu trúc cũ
                    setTests(data || []);
                    setTotalElements(data.length || 0);
                    setTotalPages(Math.ceil((data.length || 0) / itemsPerPage));
                }

                // Đánh dấu bảng đã được khởi tạo
                setTableInitialized(true);
            }
        } catch (error) {
            console.error("Error fetching test results detail:", error);
        } finally {
            setLoadingTests(false);
        }
    };

    // Tạo dữ liệu dự đoán
    const generatePredictionData = (progressData: ProgressData) => {
        // Generate prediction data based on progress and scores
        const riskScore = Math.floor(
            (100 - progressData.progress) * 0.4 +
            (100 - (progressData.averageScore || 0) * 10) * 0.4 +
            (100 - (progressData.passRate || 0)) * 0.2
        );

        let riskLevel: 'high' | 'medium' | 'low' = 'low';
        if (riskScore > 70) {
            riskLevel = 'high';
        } else if (riskScore > 40) {
            riskLevel = 'medium';
        }

        const reasonsPool = [
            "Tiến độ học tập chậm hơn so với trung bình của lớp.",
            "Điểm số trong các bài kiểm tra gần đây có xu hướng giảm.",
            "Thời gian tương tác với nội dung học tập không đều đặn.",
            "Tỷ lệ hoàn thành bài tập về nhà thấp hơn mức trung bình.",
            `Khó khăn trong chủ đề ${progressData.weakestTopic || 'CSS & Styling'}.`,
            "Thời gian giữa các phiên học quá dài, ảnh hưởng đến việc ghi nhớ kiến thức."
        ];

        const suggestionsPool = [
            "Tập trung hoàn thành các bài học còn lại trong tuần này.",
            `Dành thêm thời gian cho chủ đề ${progressData.weakestTopic || 'CSS & Styling'}.`,
            "Tham gia diễn đàn thảo luận để được hỗ trợ từ giảng viên và bạn học.",
            "Lập lịch học tập đều đặn mỗi ngày để duy trì sự liên tục.",
            "Thực hành giải thêm các bài tập nâng cao để củng cố kiến thức.",
            "Xem lại các bài học đã hoàn thành để ôn tập và củng cố kiến thức.",
            "Tham gia học nhóm để trao đổi kiến thức và giải quyết khó khăn."
        ];

        setPredictionData({
            riskLevel: riskLevel,
            riskScore: riskScore,
            reasons: reasonsPool.sort(() => Math.random() - 0.5).slice(0, 3),
            suggestions: suggestionsPool.sort(() => Math.random() - 0.5).slice(0, 4)
        });
    };

    // Initial data loading
    useEffect(() => {
        fetchCourses();
    }, []);

    // Fetch data when course changes
    useEffect(() => {
        if (selectedCourseId) {
            setCurrentPage(1); // Reset trang về 1 khi đổi khóa học
            setLoading(true); // Chỉ set loading cho toàn trang khi đổi khóa học
            setInitialLoad(true); // Đặt lại initialLoad khi đổi khóa học
            fetchTestData();
        }
    }, [selectedCourseId]); // Chỉ gọi lại khi selectedCourseId thay đổi

    // Theo dõi thay đổi trang để cập nhật dữ liệu bài kiểm tra
    useEffect(() => {
        // Chỉ gọi API khi đã chọn khóa học và không phải lần đầu render
        if (selectedCourseId && !initialLoad) {
            fetchTestResultsDetail();
        }
        // Đánh dấu đã load xong lần đầu
        setInitialLoad(false);
    }, [currentPage]); // Chỉ gọi lại khi currentPage thay đổi

    // Toggle prediction modal
    const togglePredictionModal = () => {
        setShowPredictionModal(!showPredictionModal);
    };

    // Function to regenerate prediction data
    const regeneratePrediction = () => {
        if (progressData) {
            generatePredictionData(progressData);
        } else {
            const newPredictionData: PredictionData = {
                riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
                riskScore: Math.floor(Math.random() * 100),
                reasons: [
                    "Tiến độ học tập chậm hơn so với trung bình của lớp.",
                    "Điểm số trong các bài kiểm tra gần đây có xu hướng giảm.",
                    "Thời gian tương tác với nội dung học tập không đều đặn.",
                    "Tỷ lệ hoàn thành bài tập về nhà thấp hơn mức trung bình.",
                ].sort(() => Math.random() - 0.5).slice(0, 3),
                suggestions: [
                    "Tập trung hoàn thành các bài học còn lại trong tuần này.",
                    "Dành thêm thời gian cho chủ đề CSS & Styling.",
                    "Tham gia diễn đàn thảo luận để được hỗ trợ từ giảng viên và bạn học.",
                    "Lập lịch học tập đều đặn mỗi ngày để duy trì sự liên tục.",
                    "Thực hành giải thêm các bài tập nâng cao để củng cố kiến thức.",
                ].sort(() => Math.random() - 0.5).slice(0, 4)
            };

            setPredictionData(newPredictionData);
        }
    };

    // Format time duration
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`;
        }

        return `${minutes}m`;
    };

    // Format date
    const formatDate = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    // Hàm wrapper cho setSelectedCourseId để lưu vào localStorage
    const handleSelectCourse = (courseId: string | null) => {
        if (courseId) {
            localStorage.setItem("selectedCourseId", courseId);
        } else {
            localStorage.removeItem("selectedCourseId");
        }
        setSelectedCourseId(courseId);
    };

    return (
        <div className={styles.container}>
            {/* Header Dashboard */}
            <div className={styles.dashboardHeader}>
                <div className={styles.dashboardHeaderBg}></div>
                <div className={styles.dashboardHeaderContent}>
                    <h1 className={styles.title}>Kết quả học tập</h1>

                </div>
            </div>

            <div className={styles.contentWrapper}>
                <div className={styles.contentHeader}>
                    <h2 className={styles.sectionTitle}>Khóa học của bạn</h2>

                    <button
                        className={styles.predictionButton}
                        onClick={togglePredictionModal}
                        title="Xem dự đoán và gợi ý"
                    >
                        <Lightbulb size={18} />
                        Dự đoán & Gợi ý
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p className={styles.loadingText}>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <>
                        {!selectedCourseId ? (
                            <div className={styles.coursesGrid}>
                                {courses.map((course) => (
                                    <div
                                        key={course.id}
                                        className={styles.courseCard}
                                        onClick={() => handleSelectCourse(course.id.toString())}
                                    >
                                        {course.imageUrl ? (
                                            <div className={styles.courseCardImage}>
                                                <img src={course.imageUrl} alt={course.title} />
                                            </div>
                                        ) : (
                                            <div className={styles.courseCardImagePlaceholder}>
                                                <Book size={32} />
                                            </div>
                                        )}
                                        <div className={styles.courseCardContent}>
                                            <h3 className={styles.courseCardTitle}>{course.title}</h3>
                                            <div className={styles.courseCardDetails}>
                                                {course.instructor && (
                                                    <div className={styles.courseCardDetail}>
                                                        <Person size={14} />
                                                        <span>{course.instructor}</span>
                                                    </div>
                                                )}
                                                {course.duration && (
                                                    <div className={styles.courseCardDetail}>
                                                        <Clock size={14} />
                                                        <span>{typeof course.duration === 'number' ? formatTime(course.duration) : course.duration}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.courseProgressBar}>
                                                <div className={styles.progressLabel}>
                                                    <span>Tiến độ</span>
                                                    <span>{course.completionPercentage?.toFixed(1) || '0'}%</span>
                                                </div>
                                                <div className={styles.progressBar}>
                                                    <div
                                                        className={styles.progressFill}
                                                        style={{ width: `${course.completionPercentage || 0}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className={styles.courseNavigation}>
                                    <button
                                        className={styles.backButton}
                                        onClick={() => handleSelectCourse(null)}
                                    >
                                        <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />
                                        Quay lại danh sách khóa học
                                    </button>
                                </div>

                                <div className={styles.selectedCourseCard}>
                                    {courses.filter(course => course.id.toString() === selectedCourseId).map((course) => (
                                        <div key={course.id} className={styles.courseOverview}>
                                            {course.imageUrl && (
                                                <div className={styles.courseImage}>
                                                    <img src={course.imageUrl} alt={course.title} />
                                                </div>
                                            )}
                                            <div className={styles.courseDetails}>
                                                <h3 className={styles.courseTitle}>{course.title}</h3>

                                                <div className={styles.courseProgressBar}>
                                                    <div className={styles.progressLabel}>
                                                        <span>Tiến độ hoàn thành</span>
                                                        <span>{progress?.progress.toFixed(0)}%</span>
                                                    </div>
                                                    <div className={styles.progressBar}>
                                                        <div
                                                            className={styles.progressFill}
                                                            style={{ width: `${progress?.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className={styles.courseOverviewDetails}>
                                                    {course.instructor && (
                                                        <div className={styles.courseOverviewDetail}>
                                                            <Person size={16} />
                                                            <span>Giảng viên: {course.instructor}</span>
                                                        </div>
                                                    )}

                                                    {course.duration && (
                                                        <div className={styles.courseOverviewDetail}>
                                                            <Clock size={16} />
                                                            <span>Thời lượng: {typeof course.duration === 'number' ? formatTime(course.duration) : course.duration}</span>
                                                        </div>
                                                    )}

                                                    {course.category && (
                                                        <div className={styles.courseOverviewDetail}>
                                                            <Folder size={16} />
                                                            <span>Danh mục: {course.category}</span>
                                                        </div>
                                                    )}

                                                    <div className={styles.courseOverviewDetail}>
                                                        <Calendar3 size={16} />
                                                        <span>Ngày đăng ký: {formatDate(course.enrollment_date)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {progressData && (
                                    <div className={styles.dashboardContent}>
                                        <div className={styles.mainColumn}>
                                            {/* Điểm trung bình và Tỷ lệ bài kiểm tra đạt */}
                                            <div className={styles.card}>
                                                <div className={styles.cardHeader}>
                                                    <h2 className={styles.cardTitle}>
                                                        <GraphUp className="me-2" />
                                                        Tổng quan học tập
                                                    </h2>
                                                </div>
                                                <div className={styles.cardBody}>
                                                    <div className={styles.learningOverview}>
                                                        <div className={styles.overviewItem}>
                                                            <div className={styles.overviewIcon}>
                                                                <BarChart size={24} />
                                                            </div>
                                                            <div className={styles.overviewContent}>
                                                                <div className={styles.overviewLabel}>Điểm trung bình</div>
                                                                <div className={styles.overviewValue}>
                                                                    {progressData.averageScore ? progressData.averageScore.toFixed(1) : '0.0'}/10
                                                                </div>
                                                                <div className={styles.overviewDescription}>Trên thang điểm 10</div>
                                                            </div>
                                                        </div>

                                                        <div className={styles.overviewItem}>
                                                            <div className={styles.overviewIcon}>
                                                                <CheckCircle size={24} />
                                                            </div>
                                                            <div className={styles.overviewContent}>
                                                                <div className={styles.overviewLabel}>Tỷ lệ bài kiểm tra đạt</div>
                                                                <div className={styles.overviewValue}>
                                                                    {progressData.passRate ? progressData.passRate.toFixed(0) : '0'}%
                                                                </div>
                                                                <div className={styles.overviewDescription}>Đạt điểm tối thiểu</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Lịch sử bài kiểm tra */}
                                            <div className={styles.card}>
                                                <div className={styles.cardHeader}>
                                                    <h2 className={styles.cardTitle}>
                                                        <BarChart className="me-2" />
                                                        Lịch sử bài kiểm tra
                                                    </h2>
                                                </div>
                                                <div className={styles.cardBody}>
                                                    <div className={styles.testResultsTable}>
                                                        {!tableInitialized || (initialLoad && loadingTests) ? (
                                                            <>
                                                                <table className="table table-striped">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Tên bài kiểm tra</th>
                                                                            <th>Điểm số</th>
                                                                            <th>Kết quả</th>
                                                                            <th>Ngày làm bài</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {/* Hiển thị 5 dòng trống để giữ kích thước */}
                                                                        {[...Array(5)].map((_, index) => (
                                                                            <tr key={`loading-${index}`}>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                                <td>&nbsp;</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                                <div className={styles.loadingTableContainer}>
                                                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                                        <span className="visually-hidden">Đang tải...</span>
                                                                    </div>
                                                                    <p className={styles.loadingText}>Đang tải dữ liệu...</p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <table className="table table-striped">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Tên bài kiểm tra</th>
                                                                            <th>Điểm số</th>
                                                                            <th>Kết quả</th>
                                                                            <th>Ngày làm bài</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {tests && tests.length > 0 ? (
                                                                            <>
                                                                                {tests.map((test, index) => (
                                                                                    <tr key={`data-${index}`}>
                                                                                        <td>{test.testName}</td>
                                                                                        <td>{test.score.toFixed(1)}</td>
                                                                                        <td>
                                                                                            <span className={`badge ${test.result === 'Pass' ? 'bg-success' : 'bg-danger'}`}>
                                                                                                {test.result}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td>{formatDate(test.completedAt)}</td>
                                                                                    </tr>
                                                                                ))}
                                                                                {/* Thêm dòng trống nếu dữ liệu ít hơn 5 dòng */}
                                                                                {tests.length < 5 && [...Array(5 - tests.length)].map((_, index) => (
                                                                                    <tr key={`empty-${index}`}>
                                                                                        <td>&nbsp;</td>
                                                                                        <td>&nbsp;</td>
                                                                                        <td>&nbsp;</td>
                                                                                        <td>&nbsp;</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <tr>
                                                                                    <td colSpan={4} className="text-center">
                                                                                        <div className={styles.noResultsMessage}>
                                                                                            <p>Chưa có kết quả bài kiểm tra nào</p>
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                                {/* Thêm 4 dòng trống để giữ kích thước */}
                                                                                {[...Array(4)].map((_, index) => (
                                                                                    <tr key={`empty-no-data-${index}`}>
                                                                                        <td>&nbsp;</td>
                                                                                        <td>&nbsp;</td>
                                                                                        <td>&nbsp;</td>
                                                                                        <td>&nbsp;</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                                {/* Hiển thị overlay loading khi chuyển trang */}
                                                                {loadingTests && !initialLoad && (
                                                                    <div className={styles.loadingTableContainer}>
                                                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                                            <span className="visually-hidden">Đang tải...</span>
                                                                        </div>
                                                                        <p className={styles.loadingText}>Đang tải dữ liệu...</p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Phân trang */}
                                                    {totalPages > 1 && (
                                                        <div className={styles.pagination}>
                                                            <button
                                                                className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
                                                                onClick={() => paginate(currentPage - 1)}
                                                                disabled={currentPage === 1 || loadingTests}
                                                            >
                                                                <ArrowRight style={{ transform: 'rotate(180deg)' }} size={12} />
                                                            </button>

                                                            {totalPages <= 5 ? (
                                                                // Hiển thị tất cả trang nếu ít hơn 5 trang
                                                                [...Array(totalPages)].map((_, i) => (
                                                                    <button
                                                                        key={i}
                                                                        className={`${styles.pageButton} ${currentPage === i + 1 ? styles.active : ''}`}
                                                                        onClick={() => paginate(i + 1)}
                                                                        disabled={loadingTests}
                                                                    >
                                                                        {i + 1}
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                // Hiển thị phân trang thông minh nếu nhiều hơn 5 trang
                                                                <>
                                                                    {/* Luôn hiển thị trang đầu */}
                                                                    <button
                                                                        className={`${styles.pageButton} ${currentPage === 1 ? styles.active : ''}`}
                                                                        onClick={() => paginate(1)}
                                                                        disabled={loadingTests}
                                                                    >
                                                                        1
                                                                    </button>

                                                                    {/* Hiển thị "..." nếu không ở gần trang đầu */}
                                                                    {currentPage > 3 && <span className={styles.pageEllipsis}>...</span>}

                                                                    {/* Hiển thị trang trước trang hiện tại nếu không phải trang đầu hoặc thứ 2 */}
                                                                    {currentPage > 2 && (
                                                                        <button
                                                                            className={styles.pageButton}
                                                                            onClick={() => paginate(currentPage - 1)}
                                                                            disabled={loadingTests}
                                                                        >
                                                                            {currentPage - 1}
                                                                        </button>
                                                                    )}

                                                                    {/* Hiển thị trang hiện tại nếu không phải trang đầu hoặc cuối */}
                                                                    {currentPage !== 1 && currentPage !== totalPages && (
                                                                        <button
                                                                            className={`${styles.pageButton} ${styles.active}`}
                                                                            onClick={() => paginate(currentPage)}
                                                                            disabled={loadingTests}
                                                                        >
                                                                            {currentPage}
                                                                        </button>
                                                                    )}

                                                                    {/* Hiển thị trang sau trang hiện tại nếu không phải trang cuối hoặc áp cuối */}
                                                                    {currentPage < totalPages - 1 && (
                                                                        <button
                                                                            className={styles.pageButton}
                                                                            onClick={() => paginate(currentPage + 1)}
                                                                            disabled={loadingTests}
                                                                        >
                                                                            {currentPage + 1}
                                                                        </button>
                                                                    )}

                                                                    {/* Hiển thị "..." nếu không ở gần trang cuối */}
                                                                    {currentPage < totalPages - 2 && <span className={styles.pageEllipsis}>...</span>}

                                                                    {/* Luôn hiển thị trang cuối */}
                                                                    <button
                                                                        className={`${styles.pageButton} ${currentPage === totalPages ? styles.active : ''}`}
                                                                        onClick={() => paginate(totalPages)}
                                                                        disabled={loadingTests}
                                                                    >
                                                                        {totalPages}
                                                                    </button>
                                                                </>
                                                            )}

                                                            <button
                                                                className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
                                                                onClick={() => paginate(currentPage + 1)}
                                                                disabled={currentPage === totalPages || loadingTests}
                                                            >
                                                                <ArrowRight size={12} />
                                                            </button>
                                                        </div>
                                                    )}

                                                    <div className={styles.chartInfo}>
                                                        <div className={styles.chartInfoItem}>
                                                            <div className={styles.chartInfoTitle}>Điểm trung bình</div>
                                                            <div className={styles.chartInfoValue}>
                                                                {progressData.averageScore ? progressData.averageScore.toFixed(1) : '0.0'}
                                                            </div>
                                                        </div>
                                                        <div className={styles.chartInfoItem}>
                                                            <div className={styles.chartInfoTitle}>Điểm cao nhất</div>
                                                            <div className={styles.chartInfoValue}>
                                                                {progress?.maxScore}
                                                            </div>
                                                        </div>
                                                        <div className={styles.chartInfoItem}>
                                                            <div className={styles.chartInfoTitle}>Số bài đã làm</div>
                                                            <div className={styles.chartInfoValue}>
                                                                {progress?.lessonCompleted} / {progress?.totalLesson}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.sideColumn}>
                                            {/* Tỉ lệ kết quả bài tập */}
                                            <div className={styles.card}>
                                                <div className={styles.cardHeader}>
                                                    <h2 className={styles.cardTitle}>
                                                        <PieChart className="me-2" />
                                                        Tỉ lệ kết quả bài tập
                                                    </h2>
                                                </div>
                                                <div className={styles.cardBody}>
                                                    <div className={styles.pieChartContainer}>
                                                                <CustomPieChart
                                                                    data={[
                                                                        {
                                                                            name: 'Pass',
                                                                            value: testResults.filter(test => test.result === 'Pass').reduce((acc, test) => acc + test.total, 0),
                                                                        },
                                                                        {
                                                                            name: 'Fail',
                                                                            value: testResults.filter(test => test.result === 'Fail').reduce((acc, test) => acc + test.total, 0),
                                                                        },
                                                                    ]}
                                                                />

                                                    </div>
                                                    <div className={styles.chartLegend}>
                                                        <div className={styles.legendItem}>
                                                            <span className={`${styles.legendColor} ${styles.color1}`}></span>
                                                            <span>Pass</span>
                                                        </div>
                                                        <div className={styles.legendItem}>
                                                            <span className={`${styles.legendColor} ${styles.color2}`}></span>
                                                            <span>Fail</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Gợi ý học tập */}
                                            <div className={`${styles.card} ${styles.tipsCard}`}>
                                                <div className={styles.cardHeader}>
                                                    <h2 className={styles.cardTitle}>
                                                        <Lightbulb className="me-2" />
                                                        Gợi ý học tập
                                                    </h2>
                                                </div>
                                                <div className={styles.cardBody}>
                                                    <div className={styles.tipsList}>
                                                        <div className={styles.tipItem}>
                                                            <div className={styles.tipIcon}>
                                                                <ArrowRight size={16} />
                                                            </div>
                                                            <div className={styles.tipContent}>
                                                                Tập trung vào chủ đề <strong>{progressData.weakestTopic || 'CSS & Styling'}</strong> để cải thiện kết quả học tập.
                                                            </div>
                                                        </div>
                                                        <div className={styles.tipItem}>
                                                            <div className={styles.tipIcon}>
                                                                <ArrowRight size={16} />
                                                            </div>
                                                            <div className={styles.tipContent}>
                                                                Tập trung ôn lại các câu hỏi trả lời sai để cải thiện điểm số.
                                                            </div>
                                                        </div>
                                                        <div className={styles.tipItem}>
                                                            <div className={styles.tipIcon}>
                                                                <ArrowRight size={16} />
                                                            </div>
                                                            <div className={styles.tipContent}>
                                                                Hoàn thành thêm {10 - 7} bài kiểm tra còn lại để đánh giá toàn diện.
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button className={styles.viewMoreButton} onClick={togglePredictionModal}>
                                                        Xem thêm gợi ý <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Prediction Modal */}
            <Modal
                show={showPredictionModal}
                onHide={togglePredictionModal}
                centered
                size="lg"
                className={styles.predictionModal}
            >
                <Modal.Header>
                    <Modal.Title>
                        <div className={styles.modalTitle}>
                            <ExclamationTriangle className={`me-2 ${styles.warningIcon}`} />
                            Dự đoán và Gợi ý Lộ trình Học tập
                        </div>
                    </Modal.Title>
                    <Button variant="link" className={styles.closeButton} onClick={togglePredictionModal}>
                        <XLg />
                    </Button>
                </Modal.Header>
                <Modal.Body>
                    {predictionData && (
                        <div className={styles.predictionContent}>
                            <div className={`${styles.riskIndicator} ${predictionData.riskLevel === 'high' ? styles.highRisk :
                                predictionData.riskLevel === 'medium' ? styles.mediumRisk :
                                    styles.lowRisk
                                }`}>
                                <div className={styles.riskLabel}>
                                    {predictionData.riskLevel === 'high' ? 'Nguy cơ cao' :
                                        predictionData.riskLevel === 'medium' ? 'Nguy cơ trung bình' :
                                            'Nguy cơ thấp'}
                                </div>
                                <div className={styles.riskScore}>
                                    {predictionData.riskScore}%
                                </div>
                                <div className={styles.riskDescription}>
                                    {predictionData.riskLevel === 'high' ? 'Khả năng không hoàn thành khóa học cao' :
                                        predictionData.riskLevel === 'medium' ? 'Cần cải thiện để hoàn thành khóa học' :
                                            'Tiến độ học tập tốt, tiếp tục phát huy'}
                                </div>
                            </div>

                            <div className={styles.predictionSection}>
                                <h4>
                                    <ExclamationTriangle className="me-2" />
                                    Các yếu tố ảnh hưởng
                                </h4>
                                <ul className={styles.reasonsList}>
                                    {predictionData.reasons.map((reason, index) => (
                                        <li key={index}>
                                            <span className={styles.reasonBullet}>•</span>
                                            {reason}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles.predictionSection}>
                                <h4>
                                    <Lightbulb className="me-2" />
                                    Gợi ý cải thiện
                                </h4>
                                <ul className={styles.suggestionsList}>
                                    {predictionData.suggestions.map((suggestion, index) => (
                                        <li key={index}>
                                            <ArrowRight className={styles.suggestionIcon} />
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={styles.predictionActions}>
                                <Button variant="primary" className={styles.actionButton}>
                                    Xem lộ trình học tập chi tiết
                                </Button>

                                <Button
                                    variant="outline-secondary"
                                    className={styles.actionButton}
                                    onClick={regeneratePrediction}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-clockwise me-2" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                                    </svg>
                                    Dự đoán lại
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default LearningResultsPage;