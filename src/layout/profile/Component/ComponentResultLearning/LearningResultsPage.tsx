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
import { jwtDecode } from 'jwt-decode';

// Interface for JWT payload
interface JwtPayload {
    isHuitStudent: boolean;
    [key: string]: any;
}

// Type for suggestion categories
type SuggestionCategory =
    | "studyAgain"
    | "notCompleted"
    | "lessonsToImprove"
    | "learningSuggestions"
    | "notAttempted"
    | "quizToRetake";

// Type for suggestion item
interface SuggestionItem {
    item: string;
    videoLink: string | null;
    testLink: string | null;
    note: string | null;
}

// Interface for categorized suggestions
interface CategorizedSuggestions {
    studyAgain: SuggestionItem[];
    notCompleted: SuggestionItem[];
    lessonsToImprove: SuggestionItem[];
    learningSuggestions: SuggestionItem[];
    notAttempted: SuggestionItem[];
    quizToRetake: SuggestionItem[];
}

// Interface for student prediction data
interface StudentPrediction {
    studentId: string;
    accountId: number;
    cluster: string;
    clusterDescription: string;
    clusterLabel: string;
    learningPathSuggestion: string[];
    prediction: number;
    probability: number;
    riskLevel: string;
    createdAt: string;
}

// Interface for student information
interface StudentInformation {
    id: number;
    studentId: string;
    fullName: string;
    courseData: any[];
    [key: string]: any;
}

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
    totalTime?: number;
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
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(() => {// Khôi phục selectedCourseId từ localStorage nếu có
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

    // States for HUIT student prediction
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [studentPrediction, setStudentPrediction] = useState<StudentPrediction | null>(null);
    const [categorizedSuggestions, setCategorizedSuggestions] = useState<CategorizedSuggestions | null>(null);
    const [studentInformation, setStudentInformation] = useState<StudentInformation | null>(null);
    const [progressInfo, setProgressInfo] = useState<string | null>(null);

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
    const authData = user;

    // Dictionary for suggestion categories
    const suggestionDictionary: Record<SuggestionCategory, { keywords: string[]; note: string; message: string }> = {
        //Học lại 
        studyAgain: {
            keywords: ["Nên học lại", "Chưa hoàn thành", "Có bài cần làm lại"],
            note: "Bạn có xu hướng tiếp thu hiệu quả qua hình ảnh – nên ưu tiên các video có sơ đồ, biểu đồ và hình minh họa trực quan.",
            message: "Hãy ôn lại và làm lại bài học để đạt điểm tối thiểu.",
        },

        //Chưa học hoàn thành 
        notCompleted: {
            keywords: ["bạn chưa hoàn thành chương này", "chưa hoàn thành", "Chương chưa bắt đầu học"],
            note: "Hãy tiếp tục học nhé! Hoàn thành chương học này để đạt kết quả tốt nhất.",
            message: "Chương này chưa hoàn thành. Hãy tiếp tục học để đạt kết quả tốt nhất.",
        },

        //điểm chưa cao , có thể cải thiện ( điểm mức khá)
        lessonsToImprove: {
            keywords: ["có thể cải thiện hơn", "điểm chưa cao", "Một số bài có điểm chưa cao, nên ôn thêm"],
            note: "Cần ôn lại các bài học này để nâng cao điểm số.",
            message: "Điểm của bạn chưa cao, cần ôn lại để cải thiện điểm số.",
        },

        // Gợi ý học tập
        learningSuggestions: {
            keywords: ["gợi ý học tập", "phương pháp học", "học hiệu quả"],
            note: "Áp dụng phương pháp học mới để cải thiện hiệu quả.",
            message: "Áp dụng phương pháp học mới để cải thiện hiệu quả học tập.",
        },

        // Các bài học chưa làm
        notAttempted: {
            keywords: ["cần học và làm bài", "bài chưa làm", "chưa học", "Các bài chưa học/chưa làm"],
            note: "Cần học và làm bài để hoàn thành khóa học.",
            message: "Bạn chưa làm bài học này. Hãy bắt đầu ngay để hoàn thành khóa học.",
        },

        // Thông điệp cho Quiz nếu cần làm lại, điểm thấp
        quizToRetake: {
            keywords: ["Có bài cần làm lại", "Làm lại quiz", "Điểm quiz thấp", "cần cải thiện"],
            note: "Ôn tập các bài học trong chương trước khi làm lại quiz để đạt điểm cao hơn.",
            message: "Điểm quiz của bạn thấp. Hãy làm lại quiz sau khi ôn lại bài học trong chương.",
        },
    };

    // Extract links and notes from suggestions
    const extractDetails = (suggestion: string) => {
        const videoLinkMatch = suggestion.match(/▶️.*?(http:\/\/[^\s]+)/);
        const testLinkMatch = suggestion.match(/📝.*?(http:\/\/[^\s]+)/);
        const noteMatch = suggestion.match(/🗒️ Ghi chú: (.*)/);

        return {
            videoLink: videoLinkMatch ? videoLinkMatch[1] : null,
            testLink: testLinkMatch ? testLinkMatch[1] : null,
            note: noteMatch ? noteMatch[1] : null,
        };
    };

    // Get next three values from array
    const getNextThreeValues = (array: any[], startIndex: number) => {
        if (startIndex < 0 || startIndex >= array.length) {
            return [];
        }
        const nextValues = array.slice(startIndex + 1, startIndex + 4);
        return nextValues;
    };

    // Function to categorize suggestions from API
    const categorizeSuggestions = (suggestions: string[]): CategorizedSuggestions => {
        const categorizedSuggestions: CategorizedSuggestions = {
            studyAgain: [],
            notCompleted: [],
            lessonsToImprove: [],
            learningSuggestions: [],
            notAttempted: [],
            quizToRetake: [],
        };

        suggestions.forEach((suggestion, index) => {
            let category: SuggestionCategory | null = null;

            // Xác định danh mục dựa trên từ khóa
            for (const [key, value] of Object.entries(suggestionDictionary)) {
                if (value.keywords.some((keyword) => suggestion.includes(keyword))) {
                    category = key as SuggestionCategory;
                    break;
                }
            }

            if (category === "notCompleted") {
                let check = suggestion.includes("bạn chưa hoàn thành chương này")
                    || suggestion.includes("hãy tiếp tục học nhé")
                if (check) {
                    return;
                } else {
                    const nextValues = getNextThreeValues(suggestions, index);
                    const videoLink = nextValues
                        .map((val) => extractDetails(val).videoLink)
                        .find((link) => link !== null) || null;

                    const testLink = nextValues
                        .map((val) => extractDetails(val).testLink)
                        .find((link) => link !== null) || null;

                    const note = nextValues
                        .map((val) => extractDetails(val).note)
                        .find((note) => note !== null) || null;

                    categorizedSuggestions.notCompleted.push({
                        item: suggestion,
                        videoLink,
                        testLink: null,
                        note,
                    });
                }
            } else if (category === "lessonsToImprove") {
                if (suggestion.includes("Một số bài có điểm chưa cao")) {
                    categorizedSuggestions.lessonsToImprove.push({
                        item: suggestion,
                        videoLink: null,
                        testLink: null,
                        note: null,
                    });
                } else {
                    // Thêm vào danh mục lessonsToImprove
                    const nextValues = getNextThreeValues(suggestions, index);
                    const videoLink = nextValues
                        .map((val) => extractDetails(val).videoLink)
                        .find((link) => link !== null) || null;

                    const testLink = nextValues
                        .map((val) => extractDetails(val).testLink)
                        .find((link) => link !== null) || null;

                    const note = nextValues
                        .map((val) => extractDetails(val).note)
                        .find((note) => note !== null) || null;

                    categorizedSuggestions.lessonsToImprove.push({
                        item: suggestion,
                        videoLink,
                        testLink,
                        note,
                    });
                }
            } else if (category === "notAttempted") {
                if (suggestion.includes("Các bài chưa học/chưa làm")) {
                    categorizedSuggestions.notAttempted.push({
                        item: suggestion,
                        videoLink: null,
                        testLink: null,
                        note: null,
                    });
                } else {
                    const nextValues = getNextThreeValues(suggestions, index);
                    const videoLink = nextValues
                        .map((val) => extractDetails(val).videoLink)
                        .find((link) => link !== null) || null;

                    const testLink = nextValues
                        .map((val) => extractDetails(val).testLink)
                        .find((link) => link !== null) || null;

                    const note = nextValues
                        .map((val) => extractDetails(val).note)
                        .find((note) => note !== null) || null;

                    categorizedSuggestions.notAttempted.push({
                        item: suggestion,
                        videoLink,
                        testLink: null,
                        note,
                    });
                }
            } else if (category === "studyAgain") {
                const nextValues = getNextThreeValues(suggestions, index);
                const videoLink = nextValues
                    .map((val) => extractDetails(val).videoLink)
                    .find((link) => link !== null) || null;

                const testLink = nextValues
                    .map((val) => extractDetails(val).testLink)
                    .find((link) => link !== null) || null;

                const note = nextValues
                    .map((val) => extractDetails(val).note)
                    .find((note) => note !== null) || null;

                categorizedSuggestions.studyAgain.push({
                    item: suggestion,
                    videoLink,
                    testLink,
                    note,
                });
            } else if (category === "learningSuggestions") {
                const nextValues = getNextThreeValues(suggestions, index);
                const videoLink = nextValues
                    .map((val) => extractDetails(val).videoLink)
                    .find((link) => link !== null) || null;

                const testLink = nextValues
                    .map((val) => extractDetails(val).testLink)
                    .find((link) => link !== null) || null;

                const note = nextValues
                    .map((val) => extractDetails(val).note)
                    .find((note) => note !== null) || null;

                categorizedSuggestions.learningSuggestions.push({
                    item: suggestion,
                    videoLink,
                    testLink,
                    note,
                });
            } else if (category === "quizToRetake") {
                const nextValues = getNextThreeValues(suggestions, index);
                const videoLink = nextValues
                    .map((val) => extractDetails(val).videoLink)
                    .find((link) => link !== null) || null;

                const testLink = nextValues
                    .map((val) => extractDetails(val).testLink)
                    .find((link) => link !== null) || null;

                const note = nextValues
                    .map((val) => extractDetails(val).note)
                    .find((note) => note !== null) || null;

                categorizedSuggestions.quizToRetake.push({
                    item: suggestion,
                    videoLink,
                    testLink,
                    note,
                });
            }
        });

        return categorizedSuggestions;
    };

    // Fetch prediction data for HUIT students
    useEffect(() => {
        const fetchPredictionData = async () => {
            const authToken = localStorage.getItem("authToken");
            if (authToken) {
                try {
                    const decodedToken = jwtDecode(authToken) as JwtPayload;
                    const isHuitStudentFlag = (decodedToken as any).isHuitStudent ?? (decodedToken as any).huitStudent ?? true;
                    setHasPermission(isHuitStudentFlag);
                    if (isHuitStudentFlag) {
                        const token = await authTokenLogin(refreshToken, refresh, navigate);

                        const response = await fetch(
                            `${process.env.REACT_APP_SERVER_HOST}/api/prediction-result/student?accountId=${authData.id}&courseId=${selectedCourseId}`,
                            {
                                method: 'GET',
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                },
                            }
                        );

                        const data = await response.json();
                        if (data.status === 200 ) {
                            setStudentPrediction(data.data);
                            if (data.data.learningPathSuggestion) {
                                const categorized = categorizeSuggestions(data.data.learningPathSuggestion);
                                setCategorizedSuggestions(categorized);

                                // Extract progress information from learningPathSuggestion
                                const progressSuggestion = data.data.learningPathSuggestion.find((suggestion: string) => suggestion.includes('Tiến độ hoàn thành'));
                                if (progressSuggestion) {
                                    setProgressInfo(progressSuggestion);
                                }
                            }
                            if (data.data.progressInfo) {
                                setProgressInfo(data.data.progressInfo);
                            }

                            // Generate prediction data based on API response
                            const newPredictionData: PredictionData = {
                                riskLevel: data.data.riskLevel.toLowerCase() as 'high' | 'medium' | 'low',
                                riskScore: Math.round(data.data.probability * 100),
                                reasons: data.data.learningPathSuggestion
                                    .filter((s: string) => s.includes('❗') || s.includes('cần cải thiện'))
                                    .slice(0, 3),
                                suggestions: data.data.learningPathSuggestion
                                    .filter((s: string) => s.includes('Gợi ý') || s.includes('cần học'))
                                    .slice(0, 4)
                            };
                            setPredictionData(newPredictionData);
                        } else {
                            console.warn("Lỗi logic từ API:", data.message);
                        }

                        try {
                            const studentDataResponse = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/prediction-result/student-huit-item?id=${authData.id}`, {
                                method: 'GET',
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json',
                                },
                            });

                            if (studentDataResponse.ok) {
                                const studentData = await studentDataResponse.json();
                                setStudentInformation(studentData.data);
                            } else {
                                console.error('Failed to fetch student course data');
                            }
                        } catch (error) {
                            console.error('Error fetching student course data:', error);
                        }
                    }
                } catch (error) {
                    console.error("Token không hợp lệ hoặc không thể giải mã.", error);
                    setHasPermission(false);
                }
            } else {
                setHasPermission(false);
            }
        };

        fetchPredictionData();
    }, []);

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
                    if (newProgress?.progress === undefined || isNaN(newProgress?.progress)) {
                        currentProgress = 0;
                    }
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

            // // Tạo progressData dựa trên dữ liệu đã lấy
            const newProgressData: ProgressData = {
                courseId: parseInt(selectedCourseId),
                progress: currentProgress,
                completedLessons: newProgress?.lessonCompleted || 0,
                totalLessons: newProgress?.totalLesson || 0,
                completedTime: Math.floor(Math.random() * 1000) * 60,
                // totalTime: 3600 * 20,
                // lastActivity: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000),
                // strongestTopic: "JavaScript",
                // weakestTopic: "CSS & Styling",
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

    const regeneratePrediction = () => {
        // If we have student prediction data from API, use it
        if (studentPrediction) {
            const newPredictionData: PredictionData = {
                riskLevel: studentPrediction.riskLevel.toLowerCase() as 'high' | 'medium' | 'low',
                riskScore: Math.round(studentPrediction.probability * 100),
                reasons: studentPrediction.learningPathSuggestion
                    .filter(s => s.includes('❗') || s.includes('cần cải thiện'))
                    .slice(0, 3),
                suggestions: studentPrediction.learningPathSuggestion
                    .filter(s => s.includes('Gợi ý') || s.includes('cần học'))
                    .slice(0, 4)
            };
            setPredictionData(newPredictionData);
            return;
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
                                                        <span>{typeof progress?.progress === "number" && !isNaN(progress?.progress) ? progress?.progress.toFixed(0) : 0}%</span>
                                                    </div>
                                                    <div className={styles.progressBar}>
                                                        <div
                                                            className={styles.progressFill}
                                                            style={{ width: `${progress?.progress ? progress?.progress : 0}%` }}
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

                                {/* Hiển thị bảng điều khiển bất kể có progressData hay không */}
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
                                                                    {(progressData?.averageScore || 0).toFixed(1)}/10
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
                                                                    {(progressData?.passRate || 0).toFixed(0)}%
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
                                                                {(progressData?.averageScore || 0).toFixed(1)}
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
                                        </div>
                                    </div>
                            </>
                        )}
                    </>
                )}
            </div>

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
                            {studentPrediction && (
                                <div className={styles.studentPredictionInfo}>
                                    <div className={styles.clusterInfo}>
                                        <h4>Thông tin phân nhóm</h4>
                                        <p>{studentPrediction.clusterLabel}</p>
                                        <p>{studentPrediction.clusterDescription}</p>
                                    </div>
                                </div>
                            )}

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

                            {categorizedSuggestions && (
                                <>
                                    {/* Gợi ý học tập */}
                                    {categorizedSuggestions.learningSuggestions.length > 0 && (
                                        <div className={styles.predictionSection}>
                                            <h4>
                                                <Lightbulb className="me-2" />
                                                Gợi ý học tập
                                            </h4>
                                            <ul className={styles.suggestionsList}>
                                                {categorizedSuggestions.learningSuggestions.map((suggestion, index) => (
                                                    <li key={`learning-${index}`}>
                                                        <ArrowRight className={styles.suggestionIcon} />
                                                        {suggestion.item}
                                                        {suggestion.note && (
                                                            <div className={styles.suggestionNote}>
                                                                <small>{suggestion.note}</small>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Bài học cần làm lại */}
                                    {categorizedSuggestions.studyAgain.length > 0 && (
                                        <div className={styles.predictionSection}>
                                            <h4>
                                                <ExclamationTriangle className="me-2" />
                                                Bài học cần học lại
                                            </h4>
                                            <ul className={styles.reasonsList}>
                                                {categorizedSuggestions.studyAgain.map((suggestion, index) => (
                                                    <li key={`studyagain-${index}`}>
                                                        <span className={styles.reasonBullet}>•</span>
                                                        {suggestion.item}
                                                        {suggestion.videoLink && (
                                                            <div className={styles.suggestionLinks}>
                                                                <a href={suggestion.videoLink} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
                                                                    Xem bài học
                                                                </a>
                                                            </div>
                                                        )}
                                                        {suggestion.testLink && (
                                                            <div className={styles.suggestionLinks}>
                                                                <a href={suggestion.testLink} target="_blank" rel="noopener noreferrer" className={styles.testLink}>
                                                                    Làm bài kiểm tra
                                                                </a>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Bài học chưa hoàn thành */}
                                    {categorizedSuggestions.notCompleted.length > 0 && (
                                        <div className={styles.predictionSection}>
                                            <h4>
                                                <Clock className="me-2" />
                                                Chương học chưa hoàn thành
                                            </h4>
                                            <ul className={styles.suggestionsList}>
                                                {categorizedSuggestions.notCompleted.map((suggestion, index) => (
                                                    <li key={`notcompleted-${index}`}>
                                                        <ArrowRight className={styles.suggestionIcon} />
                                                        {suggestion.item}
                                                        {suggestion.videoLink && (
                                                            <div className={styles.suggestionLinks}>
                                                                <a href={suggestion.videoLink} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
                                                                    Bắt đầu học
                                                                </a>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Bài học cần cải thiện */}
                                    {categorizedSuggestions.lessonsToImprove.length > 0 && (
                                        <div className={styles.predictionSection}>
                                            <h4>
                                                <GraphUp className="me-2" />
                                                Bài học cần cải thiện điểm số
                                            </h4>
                                            <ul className={styles.suggestionsList}>
                                                {categorizedSuggestions.lessonsToImprove.map((suggestion, index) => (
                                                    <li key={`improve-${index}`}>
                                                        <ArrowRight className={styles.suggestionIcon} />
                                                        {suggestion.item}
                                                        {suggestion.videoLink && (
                                                            <div className={styles.suggestionLinks}>
                                                                <a href={suggestion.videoLink} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
                                                                    Xem lại bài học
                                                                </a>
                                                            </div>
                                                        )}
                                                        {suggestion.testLink && (
                                                            <div className={styles.suggestionLinks}>
                                                                <a href={suggestion.testLink} target="_blank" rel="noopener noreferrer" className={styles.testLink}>
                                                                    Làm lại bài kiểm tra
                                                                </a>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Bài học chưa làm */}
                                    {categorizedSuggestions.notAttempted.length > 0 && (
                                        <div className={styles.predictionSection}>
                                            <h4>
                                                <BookHalf className="me-2" />
                                                Bài học chưa làm
                                            </h4>
                                            <ul className={styles.suggestionsList}>
                                                {categorizedSuggestions.notAttempted.map((suggestion, index) => (
                                                    <li key={`notattempted-${index}`}>
                                                        <ArrowRight className={styles.suggestionIcon} />
                                                        {suggestion.item}
                                                        {suggestion.videoLink && (
                                                            <div className={styles.suggestionLinks}>
                                                                <a href={suggestion.videoLink} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
                                                                    Xem bài học
                                                                </a>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Quiz cần làm lại */}
                                    {categorizedSuggestions.quizToRetake.length > 0 && (
                                        <div className={styles.predictionSection}>
                                            <h4>
                                                <ClipboardData className="me-2" />
                                                Quiz cần làm lại
                                            </h4>
                                            <ul className={styles.suggestionsList}>
                                                {categorizedSuggestions.quizToRetake.map((suggestion, index) => (
                                                    <li key={`quiz-${index}`}>
                                                        <ArrowRight className={styles.suggestionIcon} />
                                                        {suggestion.item}
                                                        {suggestion.videoLink && (
                                                            <div className={styles.suggestionLinks}>
                                                                <a href={suggestion.videoLink} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
                                                                    Ôn tập
                                                                </a>
                                                            </div>
                                                        )}
                                                        {suggestion.testLink && (
                                                            <div className={styles.suggestionLinks}>
                                                                <a href={suggestion.testLink} target="_blank" rel="noopener noreferrer" className={styles.testLink}>
                                                                    Làm lại quiz
                                                                </a>
                                                            </div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}

                            {!categorizedSuggestions && (
                                <>
                            <div className={styles.predictionSection}>
                                <h4>
                                    <ExclamationTriangle className="me-2" />
                                    Các yếu tố ảnh hưởng
                                </h4>
                                <ul className={styles.reasonsList}>
                                            {predictionData.reasons.length > 0 ? (
                                                predictionData.reasons.map((reason, index) => (
                                        <li key={index}>
                                            <span className={styles.reasonBullet}>•</span>
                                            {reason}
                                        </li>
                                                ))
                                            ) : (
                                                <li>
                                                    <span className={styles.reasonBullet}>•</span>
                                                    Không có yếu tố nguy cơ được phát hiện.
                                                </li>
                                            )}
                                </ul>
                            </div>

                            <div className={styles.predictionSection}>
                                <h4>
                                    <Lightbulb className="me-2" />
                                    Gợi ý cải thiện
                                </h4>
                                <ul className={styles.suggestionsList}>
                                            {predictionData.suggestions.length > 0 ? (
                                                predictionData.suggestions.map((suggestion, index) => (
                                        <li key={index}>
                                            <ArrowRight className={styles.suggestionIcon} />
                                            {suggestion}
                                        </li>
                                                ))
                                            ) : (
                                                <li>
                                                    <ArrowRight className={styles.suggestionIcon} />
                                                    Tiếp tục duy trì phương pháp học tập hiện tại.
                                                </li>
                                            )}
                                </ul>
                            </div>
                                </>
                            )}

                            {progressInfo && (
                                <div className={styles.predictionSection}>
                                    <h4>
                                        <GraphUp className="me-2" />
                                        Tiến độ học tập
                                    </h4>
                                    <p>{progressInfo}</p>
                                </div>
                            )}

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