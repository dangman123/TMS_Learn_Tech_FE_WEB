import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../../util/fucntion/useRefreshToken';
import { isTokenExpired } from '../../../util/fucntion/auth';
import styles from './LearningResultsPage.module.css';
import {
    Book, BarChart, PieChart, CheckCircle, PersonCircle,
    Clock, Calendar3, Star, GraphUp, Activity,
    Award, ClipboardData, BookHalf, Folder, Person,
    ExclamationTriangle, Lightbulb, XLg, ArrowRight
} from 'react-bootstrap-icons';
import CustomPieChart from './CustomPieChart';
import Chart from './Chart';
import { Modal, Button } from 'react-bootstrap';

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

interface PredictionData {
    riskLevel: 'high' | 'medium' | 'low';
    riskScore: number;
    reasons: string[];
    suggestions: string[];
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

    // Stats
    const [progress, setProgress] = useState<number>(0);

    // UI states
    const [loading, setLoading] = useState<boolean>(true);
    const [showPredictionModal, setShowPredictionModal] = useState<boolean>(false);

    const navigate = useNavigate();
    const refresh = useRefreshToken();

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

            // Remove automatic course selection
            // if (coursesList.length > 0 && !selectedCourseId) {
            //     setSelectedCourseId(coursesList[0].id.toString());
            // }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when course changes
    const fetchProgressData = async () => {
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
            // Find the selected course to get its progress
            const selectedCourse = courses.find(c => c.id.toString() === selectedCourseId);
            const progress = selectedCourse ? parseFloat(selectedCourse.completionPercentage?.toString() || "0") : 0;

            // Create progress data based on the actual course progress
            const completedLessons = Math.floor(Math.random() * 20) + 5;
            const totalLessons = completedLessons + Math.floor(Math.random() * 10) + 5;
            const strongestTopic = ['HTML/CSS', 'JavaScript', 'React', 'TypeScript', 'Node.js'][Math.floor(Math.random() * 5)];
            const weakestTopic = ['Database', 'Testing', 'Security', 'Performance', 'Accessibility'][Math.floor(Math.random() * 5)];

            setProgressData({
                courseId: parseInt(selectedCourseId),
                progress: progress,
                completedLessons: completedLessons,
                totalLessons: totalLessons,
                completedTime: Math.floor(progress * 0.6 * 3600),
                totalTime: 3600 * 6,
                lastActivity: new Date(Date.now() - Math.floor(Math.random() * 5 + 1) * 86400000),
                strongestTopic: strongestTopic,
                weakestTopic: weakestTopic
            });

            setProgress(progress);

            // Tạo dữ liệu dự đoán ảo
            const riskScore = Math.floor(Math.random() * 100);
            let riskLevel: 'high' | 'medium' | 'low' = 'low';

            if (riskScore > 70) {
                riskLevel = 'high';
            } else if (riskScore > 40) {
                riskLevel = 'medium';
            }

            setPredictionData({
                riskLevel: riskLevel,
                riskScore: riskScore,
                reasons: [
                    'Tiến độ học tập chậm so với lộ trình',
                    'Thời gian hoàn thành bài tập quá lâu',
                    'Điểm số các bài kiểm tra thấp hơn trung bình lớp'
                ],
                suggestions: [
                    'Tăng cường thời gian học tập mỗi ngày',
                    'Tham gia các buổi học nhóm và thảo luận',
                    'Đặt lịch học cố định và tuân thủ nghiêm ngặt',
                    'Tập trung vào các chủ đề còn yếu'
                ]
            });
        } catch (error) {
            console.error("Error fetching progress data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial data loading
    useEffect(() => {
        fetchCourses();
    }, []);

    // Fetch data when course changes
    useEffect(() => {
        if (selectedCourseId) {
            fetchProgressData();
        }
    }, [selectedCourseId]);

    // Toggle prediction modal
    const togglePredictionModal = () => {
        setShowPredictionModal(!showPredictionModal);
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
                                                        <span>{progress.toFixed(0)}%</span>
                                                    </div>
                                                    <div className={styles.progressBar}>
                                                        <div
                                                            className={styles.progressFill}
                                                            style={{ width: `${progress}%` }}
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
                                            {/* Tiến độ học tập chi tiết */}
                                            <div className={styles.card}>
                                                <div className={styles.cardHeader}>
                                                    <h2 className={styles.cardTitle}>
                                                        <GraphUp className="me-2" />
                                                        Tiến độ học tập chi tiết
                                                    </h2>
                                                </div>
                                                <div className={styles.cardBody}>
                                                    <div className={styles.progressStats}>
                                                        <div className={styles.progressStat}>
                                                            <div className={styles.progressStatLabel}>Hoàn thành khóa học</div>
                                                            <div className={styles.progressStatValue}>{progressData.progress.toFixed(0)}%</div>
                                                            <div className={styles.progressBar}>
                                                                <div
                                                                    className={`${styles.progressFill} ${styles.progressFillPrimary}`}
                                                                    style={{ width: `${progressData.progress}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={styles.improvementSection}>
                                                        <h3 className={styles.sectionTitle}>Cần cải thiện</h3>
                                                        <div className={styles.infoCard}>
                                                            <div className={styles.infoCardIcon}>
                                                                <BookHalf size={24} />
                                                            </div>
                                                            <div className={styles.infoCardContent}>
                                                                <p>{progressData.weakestTopic || 'CSS & Styling'}</p>
                                                                <div className={styles.infoCardAction}>
                                                                    <button className={styles.actionLink}>
                                                                        Xem bài học liên quan <ArrowRight size={14} />
                                                                    </button>
                                                                </div>
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
                                                    <div className={styles.chartContainer}>
                                                        <Chart
                                                            data={[
                                                                { name: 'Bài 1', score: Math.random() * 3 + 7 },
                                                                { name: 'Bài 2', score: Math.random() * 3 + 7 },
                                                                { name: 'Bài 3', score: Math.random() * 3 + 7 },
                                                                { name: 'Bài 4', score: Math.random() * 3 + 7 },
                                                                { name: 'Bài 5', score: Math.random() * 3 + 7 },
                                                                { name: 'Bài 6', score: Math.random() * 3 + 7 },
                                                                { name: 'Bài 7', score: Math.random() * 3 + 7 },
                                                            ]}
                                                        />
                                                    </div>
                                                    <div className={styles.chartInfo}>
                                                        <div className={styles.chartInfoItem}>
                                                            <div className={styles.chartInfoTitle}>Điểm trung bình</div>
                                                            <div className={styles.chartInfoValue}>8.5</div>
                                                        </div>
                                                        <div className={styles.chartInfoItem}>
                                                            <div className={styles.chartInfoTitle}>Điểm cao nhất</div>
                                                            <div className={styles.chartInfoValue}>9.8</div>
                                                        </div>
                                                        <div className={styles.chartInfoItem}>
                                                            <div className={styles.chartInfoTitle}>Số bài đã làm</div>
                                                            <div className={styles.chartInfoValue}>7/10</div>
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
                                                                { name: 'Pass', value: Math.floor(Math.random() * 30) + 60 },
                                                                { name: 'Fail', value: Math.floor(Math.random() * 20) + 20 },
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
                                <Button variant="outline-primary" className={styles.actionButton}>
                                    Đặt lịch tư vấn học tập
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