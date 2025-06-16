import React, { useEffect, useRef, useState } from "react";
import "./CoursePageConvert.css";
import { isTokenExpired } from "../util/fucntion/auth";
import { useNavigate } from "react-router-dom";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { decryptData, encryptData } from "../util/encryption";
import LoadingSpinner from "./component/LoadingSpinner";
import ContentLoader from "./component/ContentLoader";
import { VideoContent } from "./CoursePageConvert";
import { sendActionActivity } from "../../service/WebSocketActions";

// Add custom CSS for the video component
const videoComponentStyles = `
  .video-player-container {
    padding: 20px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    margin: 20px;
  }

  .video-title {
    font-size: 20px;
    font-weight: 600;
    color: #344767;
    margin-bottom: 20px;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    line-height: 1.4;
  }

  .video-wrapper {
    position: relative;
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }

  .video-controls {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    flex-wrap: wrap;
    gap: 15px;
  }

  .document-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 10px rgba(78, 115, 223, 0.2);
    font-size: 14px;
  }

  .document-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(78, 115, 223, 0.3);
  }

  .navigation-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    flex-wrap: wrap;
    gap: 15px;
  }

  .nav-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background-color: #f8f9fa;
    color: #495057;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 14px;
  }

  .nav-button:hover {
    background-color: #e9ecef;
    transform: translateY(-2px);
  }

  .nav-button.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  .comments-section {
    margin-top: 30px;
    background-color: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .comments-title {
    font-size: 16px;
    font-weight: 600;
    color: #344767;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .comment-form {
    margin-bottom: 20px;
  }

  .comment-input {
    width: 100%;
    padding: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    resize: none;
    transition: all 0.3s;
    margin-bottom: 10px;
  }

  .comment-input:focus {
    outline: none;
    border-color: #4e73df;
    box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.1);
  }

  .comment-submit {
    padding: 10px 20px;
    background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    float: right;
    font-size: 14px;
  }

  .comment-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(78, 115, 223, 0.2);
  }

  .comment-list {
    margin-top: 20px;
  }

  .comment-item {
    padding: 15px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    margin-bottom: 15px;
    background-color: #f8f9fa;
  }

  .comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    align-items: center;
  }
  
  .comment-author-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .comment-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    background-color: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-weight: 600;
    font-size: 14px;
    overflow: hidden;
  }
  
  .comment-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .comment-author {
    font-weight: 600;
    color: #344767;
    font-size: 14px;
  }

  .comment-date {
    font-size: 12px;
    color: #6c757d;
  }

  .comment-content {
    font-size: 14px;
    color: #495057;
    margin-bottom: 10px;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    line-height: 1.5;
  }

  .comment-actions {
    display: flex;
    gap: 15px;
    font-size: 13px;
  }

  .comment-action {
    font-size: 12px;
    color: #6c757d;
    cursor: pointer;
    transition: color 0.3s;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .comment-action:hover {
    color: #4e73df;
  }

  .comment-replies {
    margin-left: 20px;
    margin-top: 15px;
    padding-left: 15px;
    border-left: 2px solid #e9ecef;
  }

  .reply-form {
    margin-top: 15px;
    margin-bottom: 15px;
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 20px;
  }

  .pagination-button {
    padding: 8px 15px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .pagination-button:hover {
    background-color: #e9ecef;
  }

  .pagination-button.active {
    background-color: #4e73df;
    color: white;
    border-color: #4e73df;
  }

  .lesson-top-bar {
    background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .lesson-top-bar h5 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: white;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    line-height: 1.4;
    max-width: 80%;
  }

  .rbt-lesson-toggle button {
    background-color: rgba(255,255,255,0.2);
    border-radius: 50%;
    width: 35px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition: all 0.3s;
  }

  .rbt-lesson-toggle button:hover {
    background-color: rgba(255,255,255,0.3);
    transform: scale(1.05);
  }

  .lesson-top-left {
    display: flex;
    align-items: center;
    gap: 15px;
    overflow: hidden;
    width: 80%;
  }

  /* Responsive styles */
  @media (max-width: 991px) {
    .rbt-lesson-rightsidebar {
      width: 100% !important;
    }
    
    .video-player-container {
      margin: 15px 10px;
      padding: 15px;
    }
    
    .comments-section {
      padding: 15px;
    }
  }

  @media (max-width: 768px) {
    .video-title {
      font-size: 17px;
    }
    
    .comments-title {
      font-size: 15px;
    }
    
    .lesson-top-bar h5 {
      font-size: 14px;
      max-width: 70%;
    }
    
    .document-button, .nav-button, .comment-submit {
      font-size: 13px;
      padding: 10px 15px;
    }
    
    .cover-test-body {
      padding: 30px 20px;
    }
    
    .comment-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .comment-date {
      margin-top: 5px;
      margin-left: 46px; /* Align with author name after avatar */
    }
    
    .comment-replies {
      margin-left: 10px;
      padding-left: 10px;
    }
  }
  
  @media (max-width: 576px) {
    .video-player-container {
      margin: 10px 5px;
      padding: 12px;
    }
    
    .video-title {
      font-size: 16px;
      margin-bottom: 15px;
    }
    
    .lesson-top-bar {
      padding: 12px 15px;
    }
    
    .lesson-top-bar h5 {
      font-size: 13px;
    }
    
    .rbt-lesson-toggle button {
      width: 30px;
      height: 30px;
    }
    
    .comment-avatar {
      width: 30px;
      height: 30px;
      font-size: 12px;
    }
    
    .comment-author {
      font-size: 13px;
    }
    
    .comment-content {
      font-size: 13px;
    }
    
    .comment-item {
      padding: 12px;
    }
    
    .comment-input {
      padding: 12px;
    }
    
    .comment-submit {
      padding: 8px 15px;
      font-size: 12px;
    }
  }

  /* Note Section */
  .note-section {
    margin-top: 30px;
    background-color: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .note-title {
    font-size: 16px;
    font-weight: 600;
    color: #344767;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .note-input {
    width: 100%;
    min-height: 120px;
    padding: 15px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    resize: vertical;
    transition: all 0.3s;
  }

  .note-input:focus {
    outline: none;
    border-color: #4e73df;
    box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.1);
  }

  .note-save {
    margin-top: 10px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 14px;
  }

  .note-save:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(78, 115, 223, 0.2);
  }

  .note-list {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .note-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    font-size: 14px;
  }

  .note-timestamp {
    font-weight: 600;
    color: #4e73df;
    cursor: pointer;
    min-width: 70px;
    font-size: 16px;
  }

  .note-delete {
    margin-left: auto;
    color: #e74c3c;
    cursor: pointer;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 4px;
  }

  .note-delete:hover {
    color: #c0392b;
  }

  /* Tabs */
  .tab-buttons {
    display: flex;
    border-bottom: 1px solid #e9ecef;
    margin-top: 30px;
  }

  .tab-button {
    padding: 12px 20px;
    background: none;
    border: none;
    font-weight: 600;
    color: #6c757d;
    cursor: pointer;
    font-size: 15px;
    position: relative;
  }

  .tab-button:hover {
    color: #4e73df;
  }

  .tab-button.active {
    color:rgb(244, 245, 248);
  }

  .tab-button.active::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: #4e73df;
    border-radius: 2px 2px 0 0;
  }
`;

interface LessonRightSidebarProps {
  isSidebarOpen: boolean;
  handleToggleSidebar: () => void;
  content: VideoContent
  progressData: any;
  coursesData: any;
}
interface Note {
  id?: number;
  time: number;
  content: string;
  accountId: number;
  videoId: number;
  lessonId: number;
  createdAt?: string;
  updatedAt?: string;
} 
interface Comment {
  id: number;
  content: string;
  accountName: string;
  accountId: number;
  createdAt: string;
  accountAvatar: string;
  replies?: Comment[];
}

export const LessonVideoRight: React.FC<LessonRightSidebarProps> = ({
  isSidebarOpen,
  handleToggleSidebar,
  content,
  progressData,
  coursesData,
}) => {
  // Add custom styles to document head when component mounts
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = videoComponentStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const [rootComments, setRootComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [childrenComments, setChildrenComments] = useState<{
    [key: number]: Comment[];
  }>({});
  const [expandedComments, setExpandedComments] = useState<{
    [key: number]: boolean;
  }>({});
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [rootCommentContent, setRootCommentContent] = useState("");

  const [childCommentContent, setChildCommentContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  // Note state & handlers (timestamped notes)
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"notes" | "comments">("notes");

  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const [video, setVideo] = useState<VideoContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showChatbot, setShowChatbot] = useState(false);

  const fetchVideoData = async (videoId: string) => {
    setIsLoading(true);
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/login";
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/videos/${videoId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch video data. Status: ${response.status}`
        );
      }

      

      const videoData = await response.json();
      setVideo(videoData);
    } catch (error) {
      console.error("Error fetching video data:", error);
      showToast("Không thể tải video. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    localStorage.removeItem("encryptedVideoId");
    localStorage.removeItem("encryptedTestId");
    localStorage.removeItem("encryptedCourseId");
    localStorage.removeItem("encryptedLessonId");
    localStorage.removeItem("encryptedTestChapterId");
    localStorage.removeItem("encryptedChapterId");
    window.location.href = "/";
  };

  const handleLoadedData = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.error("Video playback failed:", err);
      });
    }
  };

  const findLessonIndex = (
    chapterId: number,
    lessonId: number,
    courseData: any
  ) => {
    for (let i = 0; i < courseData.chapters.length; i++) {
      const chapter = courseData.chapters[i];
      if (chapter.chapter_id === chapterId) {
        const lessonIndex = chapter.lessons.findIndex(
          (lesson: any) => lesson.lesson_id === lessonId
        );
        return { chapterIndex: i, lessonIndex };
      }
    }
    return null; // Không tìm thấy
  };

  const getNextLesson = (
    chapterId: number,
    lessonId: number,
    courseData: any
  ) => {
    const indices = findLessonIndex(chapterId, lessonId, courseData);
    if (!indices) return null;

    const { chapterIndex, lessonIndex } = indices;
    const currentChapter = courseData.chapters[chapterIndex];

    // Bài học tiếp theo trong cùng một chương
    if (lessonIndex < currentChapter.lessons.length - 1) {
      return currentChapter.lessons[lessonIndex + 1];
    }

    // Chuyển sang bài học đầu tiên của chương kế tiếp
    if (chapterIndex < courseData.chapters.length - 1) {
      const nextChapter = courseData.chapters[chapterIndex + 1];
      return nextChapter.lessons[0];
    }

    return null; // Không có bài học tiếp theo
  };

  const getPreviousLesson = (
    chapterId: number,
    lessonId: number,
    courseData: any
  ) => {
    const indices = findLessonIndex(chapterId, lessonId, courseData);
    if (!indices) return null;

    const { chapterIndex, lessonIndex } = indices;
    const currentChapter = courseData.chapters[chapterIndex];

    // Bài học trước trong cùng một chương
    if (lessonIndex > 0) {
      return currentChapter.lessons[lessonIndex - 1];
    }

    // Chuyển sang bài học cuối cùng của chương trước đó
    if (chapterIndex > 0) {
      const prevChapter = courseData.chapters[chapterIndex - 1];
      return prevChapter.lessons[prevChapter.lessons.length - 1];
    }

    return null; // Không có bài học trước
  };

  const showToast = (message: string) => {
    toast.warning(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  const isLessonUnlocked = (
    chapterId: number,
    lessonId: number,
    courseData: any
  ) => {
    const progress = progressData.find(
      (p: any) => p.chapterId === chapterId && p.lessonId === lessonId
    );
    return progress?.videoStatus === true || progress?.testStatus === true;
  };


  const handleVideoClick = (
    videoId: string,
    lessonId: string,
    chapterId: string
  ) => {
    console.log("handleVideoClick được gọi với:", videoId, lessonId, chapterId);
    const encryptedVideoId = encryptData(videoId);
    localStorage.setItem("encryptedVideoId", encryptedVideoId);
    localStorage.removeItem("encryptedTestId");
    localStorage.removeItem("encryptedTestChapterId");

    const encryptedChapterId = encryptData(chapterId);
    const encryptedLessonId = encryptData(lessonId);
    localStorage.setItem("encryptedChapterId", encryptedChapterId);
    localStorage.setItem("encryptedLessonId", encryptedLessonId);

    const authData = localStorage.getItem("authData");
    const accountId = authData ? JSON.parse(authData).id : null;

    if (accountId) {
      const data = { "testId": null, "courseId": coursesData.course_id, "lessonId": lessonId, "videoId": videoId, "action": "Xem video" + content.title }
      sendActionActivity(accountId.toString(), "/app/watch_video", data, "Xem video " + content.title)
    }
    // sendActionActivity(accountId, "/app/watch_video", data, "Xem video " + content.title)



    window.location.reload();
  };

  const navigateToLesson = (
    direction: string,
    chapterId: number,
    lessonId: number,
    courseData: any,
    progressData: any
  ) => {
    let targetLesson;
    console.log("NavigateToLesson:", direction, chapterId, lessonId);

    if (direction === "next") {
      targetLesson = getNextLesson(chapterId, lessonId, courseData);
    } else if (direction === "previous") {
      targetLesson = getPreviousLesson(chapterId, lessonId, courseData);
    }

    if (!targetLesson) {
      showToast("Không có bài học để chuyển.");
      return;
    }

    console.log("Target lesson found:", targetLesson);

    // Kiểm tra xem targetLesson có video không
    if (!targetLesson.video || !targetLesson.video.video_id) {
      showToast("Không tìm thấy video cho bài học tiếp theo.");
      return;
    }

    let isUnlocked = true; // Mặc định cho phép chuyển đến bài học trước

    if (direction === "next") {
      // Kiểm tra xem đây có phải là bài học đầu tiên của chương đầu tiên
      const isFirstChapter = courseData.chapters.length > 0 &&
        courseData.chapters[0].chapter_id === chapterId;
      const isFirstLesson = isFirstChapter &&
        courseData.chapters[0].lessons.length > 0 &&
        courseData.chapters[0].lessons[0].lesson_id === lessonId;

      // Nếu không phải bài đầu tiên, cần kiểm tra trạng thái mở khóa
      if (!isFirstLesson) {
        isUnlocked = isLessonUnlocked(
          chapterId,
          targetLesson.lesson_id,
          progressData
        );
      }

      if (!isUnlocked) {
        showToast("Bài học này chưa được mở khóa!");
        return;
      }
    }

    try {
      handleVideoClick(
        targetLesson.video.video_id.toString(),
        targetLesson.lesson_id.toString(),
        chapterId.toString()
      );
    } catch (error) {
      console.error("Lỗi khi chuyển bài học:", error);
      showToast("Có lỗi xảy ra khi chuyển bài học!");
    }
  };

  const fetchRootComments = async (page: number) => {
    // setLoading(true);
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
        `${process.env.REACT_APP_SERVER_HOST}/api/comments/video/${content.id}/lesson/${lessonId}?page=${page}&size=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setRootComments(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching root comments:", error);
    }
  };

  const fetchChildrenComments = async (parentId: number) => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/comments/${parentId}/children/video/${content.id}/lesson/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setChildrenComments((prev) => ({ ...prev, [parentId]: data }));
    } catch (error) {
      console.error("Error fetching children comments:", error);
    }
  };

  const postComment = async (
    content: string,
    accId: number,
    lessonId: number,
    videoId: number,
    contentId: number | null = null
  ) => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/comments/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            accId,
            lessonId,
            videoId,
            contentId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể thêm bình luận. Vui lòng thử lại.");
      }
      const data = await response.json();
      return data; // Trả về bình luận đã được thêm
    } catch (error) {
      console.error("Error posting comment:", error);
      throw error; // Để xử lý thêm nếu cần
    }
  };

  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData); // Parse JSON từ localStorage
    }
    return null; // Trả về null nếu không tìm thấy
  };

  const handleAddRootComment = async (content1: string) => {
    if (!lessonId || !content.id) {
      console.error("LessonId hoặc VideoId không hợp lệ.");
      return;
    }
    const user = getUserData();

    try {
      const newComment = await postComment(
        content1,
        user.id,
        lessonId,
        content.id,
        null
      );
      setRootComments((prev) => [newComment, ...prev]);
      toast.success(`Bình luận thành công !`);
      // setTimeout(() => {
      //   window.location.reload();
      // }, 2500);
    } catch (error) {
      toast.error(`Không thể thêm bình luận. Vui lòng thử lại.`);
      // setTimeout(() => {
      //   window.location.reload();
      // }, 2500);
    }
  };

  const handleAddChildComment = async (content1: string, parentId: number) => {
    if (!lessonId || !content.id) {
      console.error("LessonId hoặc VideoId không hợp lệ.");
      return;
    }
    const user = getUserData();
    try {
      const newChildComment = await postComment(
        content1,
        user.id,
        lessonId,
        content.id,
        parentId
      );
      // console.log(newChildComment);
      setChildrenComments((prev) => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), newChildComment], // Thêm bình luận con vào danh sách
      }));

      toast.success(`Bình luận thành công !`);
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (error) {
      toast.success(`Không thể thêm bình luận con. Vui lòng thử lại.`);
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    }
  };

  const handleReplyToggle = (parentId: number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));

    // Fetch children comments only if they haven't been fetched before
    if (!childrenComments[parentId]) {
      fetchChildrenComments(parentId);
    }
  };

  const handleReplyClick = (commentId: number) => {
    setActiveReplyId((prev) => (prev === commentId ? null : commentId));
  };

  const btnDelete = async (commentId: number) => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/comments/delete/${commentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`Comment đã được xóa thành công!`);
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(
          `Không thể xóa comment : ${errorData.message || response.statusText}`
        );
        // window.location.reload();
      }
    } catch (error) {
      console.error("Error fetching children comments:", error);
    }

    // console.log(commentId);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    const storedEncryptedLessonId = localStorage.getItem("encryptedLessonId");
    if (storedEncryptedLessonId) {
      const decryptedLessonId = decryptData(storedEncryptedLessonId);
      setLessonId(decryptedLessonId);
    }
  }, []);

  useEffect(() => {
    if (content.id) {
      fetchVideoData(String(content.id));
    }
  }, [content.id]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load(); // Tải lại video khi URL thay đổi
      // videoRef.current.play();
    }
  }, [video?.url]);
  useEffect(() => {
    if (lessonId) {
      fetchRootComments(currentPage);
    }
  }, [lessonId, currentPage]);

  // Hàm đánh dấu bài học hiện tại là đã hoàn thành
  const markCurrentLessonCompleted = async () => {
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

      // Lấy thông tin từ localStorage
      const authData = localStorage.getItem("authData");
      const accountId = authData ? JSON.parse(authData).id : null;

      const storedCourseId = localStorage.getItem("encryptedCourseId");
      const storedChapterId = localStorage.getItem("encryptedChapterId");
      const storedLessonId = localStorage.getItem("encryptedLessonId");

      if (!accountId || !storedCourseId || !storedChapterId || !storedLessonId) {
        console.error("Missing required information for updating progress");
        return;
      }

      const courseId = decryptData(storedCourseId);
      const chapterId = decryptData(storedChapterId);
      const lessonId = decryptData(storedLessonId);

      // Mark the lesson as completed
      const requestData = {
        accountId: accountId,
        courseId: parseInt(courseId),
        chapterId: parseInt(chapterId),
        lessonId: parseInt(lessonId),
        videoStatus: true,
      };

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/progress/update-progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update lesson progress");
      }

      console.log("Bài học đã được đánh dấu hoàn thành");

      // Get the lesson information to check if it has a test
      const chapter = coursesData?.chapters.find(
        (ch: any) => ch.chapter_id === parseInt(chapterId)
      );
      const lesson = chapter?.lessons.find(
        (l: any) => l.lesson_id === parseInt(lessonId)
      );

      // If the lesson doesn't have a test, call the unlock-next API
      if (lesson && lesson.lesson_test === null) {
        try {
          const unlockResponse = await fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/progress/unlock-next?accountId=${accountId}&courseId=${courseId}&chapterId=${chapterId}&lessonId=${lessonId}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (unlockResponse.ok) {
            console.log("Successfully unlocked next lesson");
            showToast("Bài học đã hoàn thành! Bài tiếp theo đã được mở khóa.");
          } else {
            console.error("Failed to unlock next lesson");
            showToast("Bài học đã hoàn thành! Bạn có thể tiếp tục bài học tiếp theo.");
          }
        } catch (error) {
          console.error("Error unlocking next lesson:", error);
          showToast("Bài học đã hoàn thành! Bạn có thể tiếp tục bài học tiếp theo.");
        }
      } else {
        showToast("Bài học đã hoàn thành! Hãy làm bài kiểm tra để mở khóa bài tiếp theo.");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật tiến trình:", error);
    }
  };

  useEffect(() => {
    // Khi video tải xong và bắt đầu phát
    if (videoRef.current) {
      const handleVideoEnded = () => {
        console.log("Video đã kết thúc, đánh dấu bài học hoàn thành");
        markCurrentLessonCompleted();
      };

      videoRef.current.addEventListener('ended', handleVideoEnded);

      // Dọn dẹp
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('ended', handleVideoEnded);
        }
      };
    }
  }, [videoRef.current]);

  // Thêm script Coze ChatBot
  useEffect(() => {
    const userData = getUserData();
    if (userData && (userData.roleId === 4 || userData.roleId === 5)) {
      setShowChatbot(true);
      
      // Tạo script element cho Coze SDK
      const sdkScript = document.createElement('script');
      sdkScript.src = "https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/oversea/index.js";
      sdkScript.async = true;
      
      // Chờ script SDK được tải xong
      sdkScript.onload = () => {
        // Tạo script khởi tạo Coze Client
        const initScript = document.createElement('script');
        initScript.textContent = `
          new CozeWebSDK.WebChatClient({
            config: {
              bot_id: '7511766903497523208',
            },
            componentProps: {
              title: 'Coze',
            },
            auth: {
              type: 'token',
              token: 'pat_CMP1918CZQKzApsczufSGxJaBdHjcqmwiaBxy6fKKlEamC4hc2WL3ZF8Fx4rAWBe',
              onRefreshToken: function () {
                return 'pat_CMP1918CZQKzApsczufSGxJaBdHjcqmwiaBxy6fKKlEamC4hc2WL3ZF8Fx4rAWBe'
              }
            }
          });
        `;
        document.body.appendChild(initScript);
      };
      
      document.body.appendChild(sdkScript);
      
      // Cleanup function to remove scripts when component unmounts
      return () => {
        // Tìm và xóa các script đã thêm
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => {
          if (script.src && script.src.includes('coze.com')) {
            script.parentNode?.removeChild(script);
          }
          
          // Xóa script khởi tạo (không có src)
          if (!script.src && script.textContent && script.textContent.includes('CozeWebSDK')) {
            script.parentNode?.removeChild(script);
          }
        });
      };
    }
  }, []);

  // Helpers & handlers for timestamped notes
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const fetchNotes = async (videoIdParam: number) => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/notes/by-video/${videoIdParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setNotes(data.data);
      } else {
        console.error("Failed to fetch notes");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleSaveNote = async () => {
    if (!lessonId) {
      showToast("Không thể lưu ghi chú.");
      return;
    }
    if (noteText.trim().length === 0) {
      showToast("Bạn chưa nhập ghi chú.");
      return;
    }

    const currentTime = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;
    const user = getUserData();
    const accId = user ? user.id : 0;
    const vid = content.id;
    const newNote: Note = { time: currentTime, content: noteText, accountId: accId, videoId: vid, lessonId: lessonId!, createdAt: new Date().toISOString() };

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

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/notes/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNote),
      });

      if (response.ok) {
        const savedNote = await response.json();
        setNotes((prev) => [...prev, savedNote.data]);
        setNoteText("");
        toast.success("Đã lưu ghi chú!");
      } else {
        toast.error("Lưu ghi chú thất bại!");
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Lưu ghi chú thất bại!");
    }
  };

  const handleDeleteNote = async (noteId?: number) => {
    if (!noteId) return;
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
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/notes/delete/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        toast.success("Đã xóa ghi chú!");
      } else {
        toast.error("Xóa ghi chú thất bại!");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Xóa ghi chú thất bại!");
    }
  };

  // Load notes from API when video changes
  useEffect(() => {
    if (content.id) {
      fetchNotes(content.id);
    }
  }, [content.id]);

  return (
    <div
      className="rbt-lesson-rightsidebar"
      style={{ width: isSidebarOpen ? "75%" : "100%", flex: "1" }}
    >
      <div className="lesson-top-bar">
        <div className="lesson-top-left">
          <div className="rbt-lesson-toggle">
            <button
              title="Toggle Sidebar"
              onClick={handleToggleSidebar}
            >
              {isSidebarOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-arrow-bar-left"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.5 15a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5M10 8a.5.5 0 0 1-.5.5H3.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L3.707 7.5H9.5a.5.5 0 0 1 .5.5"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-arrow-bar-right"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8m-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5"
                  />
                </svg>
              )}
            </button>
          </div>
          <h5>
            {video?.title || "Đang tải..."}
          </h5>
        </div>
        <div className="lesson-top-right">
          <div className="rbt-btn-close">
            <a
              href="/"
              title="Go Back to Course"
              className="rbt-round-btn"
              style={{
                width: "35px",
                height: "35px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                transition: "all 0.3s"
              }}
              onClick={(e) => {
                e.preventDefault();
                handleGoBack();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-x-lg"
                viewBox="0 0 16 16"
              >
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="video-player-container">
        <h2 className="video-title">{video?.title || "Đang tải video..."}</h2>
        
        <div className="video-wrapper">
          {isLoading ? (
            <div style={{ padding: "100px 0", textAlign: "center", backgroundColor: "#f5f5f5" }}>
              <div 
                style={{ 
                  display: "inline-block",
                  border: "4px solid rgba(78, 115, 223, 0.1)",
                  borderRadius: "50%",
                  borderTop: "4px solid #4e73df",
                  width: "50px",
                  height: "50px",
                  animation: "spin 1s linear infinite"
                }}
              ></div>
              <p style={{ marginTop: "20px", color: "#555" }}>Đang tải video...</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              controls
              onLoadedData={handleLoadedData}
              onEnded={() => {
                console.log("Video ended, marking lesson as completed");
                markCurrentLessonCompleted();
              }}
              controlsList="nodownload"
              disablePictureInPicture
              src={video?.url}
              style={{ width: "100%" }}
            />
          )}
        </div>

        <div className="video-controls">
          {video?.documentUrl && (
            <button 
              className="document-button"
              onClick={() => {
                if (video.documentUrl) {
                  window.open(video.documentUrl, '_blank');
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
                <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 5 10zM3 5a.5.5 0 0 0 0 1h10a.5.5 0 0 0 0-1H3z"/>
                <path d="M14 4.5V14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4.5A1.5 1.5 0 0 0 1.5 3h11A1.5 1.5 0 0 0 14 4.5zM1 1v1h14V1H1z"/>
              </svg>
              Xem tài liệu
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === "notes" ? "active" : ""}`}
            onClick={() => setActiveTab("notes")}
          >
            Ghi chú
          </button>
          <button
            className={`tab-button ${activeTab === "comments" ? "active" : ""}`}
            onClick={() => setActiveTab("comments")}
          >
            Bình luận
          </button>
        </div>

        {activeTab === "notes" && (
        <div className="note-section">
          <h3 className="note-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-journal-text" viewBox="0 0 16 16">
              <path d="M5 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zM5 10a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 5 10zM3 5a.5.5 0 0 0 0 1h10a.5.5 0 0 0 0-1H3z"/>
              <path d="M14 4.5V14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4.5A1.5 1.5 0 0 0 1.5 3h11A1.5 1.5 0 0 0 14 4.5zM1 1v1h14V1H1z"/>
            </svg>
            <span style={{ marginLeft: '8px' }}>Ghi chú của bạn</span>
          </h3>
          <textarea
            className="note-input"
            placeholder="Viết ghi chú của bạn..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <button
            className="note-save"
            onClick={handleSaveNote}
          >
            Lưu ghi chú
          </button>

          {/* List of saved notes */}
          {notes.length > 0 && (
            <div className="note-list">
              {notes.map((n, idx) => (
                <div key={n.id ?? idx} className="note-item">
                  <span
                    className="note-timestamp"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = n.time;
                        videoRef.current.play();
                      }
                    }}
                  >
                    {formatTime(n.time)}
                  </span>
                  <span style={{ flex: 1 }}>{n.content}</span>
                  <span
                    className="note-delete"
                    title="Xóa ghi chú"
                    onClick={() => handleDeleteNote(n.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0V6H6v6.5a.5.5 0 0 1-1 0v-7z"/>
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4H2.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM3.118 4 3 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L12.882 4H3.118zM14.5 2H9.5v-.5a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 0-.5.5V2H1.5v1h13V2z"/>
                    </svg>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {activeTab === "comments" && (
        <div className="comments-section">
          <h3 className="comments-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-chat-square-text" viewBox="0 0 16 16">
              <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
              <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
            </svg>
            <span style={{ marginLeft: "8px" }}>Bình luận ({rootComments.length})</span>
          </h3>
          
          <div className="comment-form">
            <textarea 
              className="comment-input"
              placeholder="Viết bình luận của bạn..."
              value={rootCommentContent}
              onChange={(e) => setRootCommentContent(e.target.value)}
              style={{
                fontSize: "14px",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid #ddd"
              }}
            ></textarea>
            <button 
              className="comment-submit"
              onClick={() => {
                if (rootCommentContent.trim().length > 0) {
                  const user = getUserData();
                  if (user) {
                    handleAddRootComment(rootCommentContent);
                    setRootCommentContent("");
                  } else {
                    showToast("Bạn cần đăng nhập để bình luận.");
                  }
                } else {
                  showToast("Bạn chưa nhập nội dung bình luận.");
                }
              }}
              style={{
                fontSize: "14px",
                padding: "8px 16px",
                borderRadius: "6px"
              }}
            >
              Gửi bình luận
            </button>
            <div style={{ clear: "both" }}></div>
          </div>
          
          {/* Comments List */}
          {rootComments && rootComments.length > 0 ? (
            <div className="comment-list" style={{ marginTop: "15px" }}>
              {rootComments.map((comment) => (
                <div className="comment-item" key={comment.id} style={{ 
                  marginBottom: "15px", 
                  padding: "12px", 
                  borderRadius: "8px", 
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e9ecef"
                }}>
                  <div className="comment-header" style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    marginBottom: "6px" 
                  }}>
                    <div className="comment-author-container" style={{ display: "flex", alignItems: "center" }}>
                      <div className="comment-avatar" style={{ 
                        width: "28px", 
                        height: "28px", 
                        borderRadius: "50%", 
                        backgroundColor: "#4e73df", 
                        color: "white", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        fontSize: "12px",
                        marginRight: "8px",
                        overflow: "hidden"
                      }}>
                        {comment.accountAvatar ? (
                          <img 
                            src={comment.accountAvatar} 
                            alt={comment.accountName || 'Người dùng'} 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          comment.accountName ? comment.accountName.substring(0, 2).toUpperCase() : 'ND'
                        )}
                      </div>
                      <span className="comment-author" style={{ 
                        fontWeight: "600", 
                        fontSize: "14px",
                        color: "#344767"
                      }}>
                        {comment.accountName || 'Người dùng'}
                      </span>
                    </div>
                    <span className="comment-date" style={{ 
                      fontSize: "12px", 
                      color: "#6c757d"
                    }}>
                      {new Date(comment.createdAt).toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                  <p className="comment-content" style={{ 
                    fontSize: "14px", 
                    margin: "6px 0 8px", 
                    color: "#212529",
                    lineHeight: "1.4"
                  }}>
                    {comment.content}
                  </p>
                  <div className="comment-actions">
                    <button 
                      className="comment-action"
                      onClick={() => handleReplyToggle(comment.id)}
                      style={{ 
                        background: "none", 
                        border: "none", 
                        color: "#4e73df", 
                        fontSize: "13px", 
                        padding: "4px 8px", 
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" className="bi bi-reply" viewBox="0 0 16 16">
                        <path d="M6.598 5.013a.144.144 0 0 1 .202.134V6.3a.5.5 0 0 0 .5.5c.667 0 2.013.005 3.3.822.984.624 1.99 1.76 2.595 3.876-1.02-.983-2.185-1.516-3.205-1.799a8.74 8.74 0 0 0-1.921-.306 7.404 7.404 0 0 0-.798.008h-.013l-.005.001h-.001L7.3 9.9l-.05-.498a.5.5 0 0 0-.45.498v1.153c0 .108-.11.176-.202.134L2.614 8.254a.503.503 0 0 0-.042-.028.147.147 0 0 1 0-.252.499.499 0 0 0 .042-.028l3.984-2.933zM7.8 10.386c.068 0 .143.003.223.006.434.02 1.034.086 1.7.271 1.326.368 2.896 1.202 3.94 3.08a.5.5 0 0 0 .933-.305c-.464-3.71-1.886-5.662-3.46-6.66-1.245-.79-2.527-.942-3.336-.971v-.66a1.144 1.144 0 0 0-1.767-.96l-3.994 2.94a1.147 1.147 0 0 0 0 1.946l3.994 2.94a1.144 1.144 0 0 0 1.767-.96v-.667z"/>
                      </svg>
                      <span style={{ marginLeft: "4px" }}>Trả lời</span>
                    </button>
                  </div>
                  
                  {activeReplyId === comment.id && (
                    <div className="reply-form" style={{ 
                      marginTop: "10px",
                      paddingTop: "10px",
                      borderTop: "1px solid #e9ecef"
                    }}>
                      <textarea 
                        className="comment-input"
                        placeholder="Viết câu trả lời của bạn..."
                        value={childCommentContent}
                        onChange={(e) => setChildCommentContent(e.target.value)}
                        style={{
                          fontSize: "13px",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "1px solid #ddd",
                          width: "100%",
                          height: "60px"
                        }}
                      ></textarea>
                      <div style={{ marginTop: "8px" }}>
                        <button 
                          className="comment-submit"
                          onClick={() => {
                            if (childCommentContent.trim().length > 0) {
                              handleAddChildComment(childCommentContent, comment.id);
                              setChildCommentContent("");
                              setActiveReplyId(null);
                            } else {
                              showToast("Bạn chưa nhập nội dung trả lời.");
                            }
                          }}
                          style={{
                            fontSize: "13px",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            marginRight: "8px"
                          }}
                        >
                          Gửi trả lời
                        </button>
                        <button 
                          style={{ 
                            background: "none", 
                            border: "none", 
                            color: "#666", 
                            cursor: "pointer",
                            fontSize: "13px"
                          }}
                          onClick={() => setActiveReplyId(null)}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Child comments */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="comment-replies" style={{ 
                      marginTop: "10px", 
                      paddingTop: "10px", 
                      paddingLeft: "20px", 
                      borderTop: "1px solid #e9ecef"
                    }}>
                      {comment.replies.map((reply) => (
                        <div className="comment-item" key={reply.id} style={{ 
                          marginBottom: "8px", 
                          padding: "8px", 
                          borderRadius: "6px", 
                          backgroundColor: "#ffffff",
                          border: "1px solid #edf2f7"
                        }}>
                          <div className="comment-header" style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center", 
                            marginBottom: "4px" 
                          }}>
                            <div className="comment-author-container" style={{ display: "flex", alignItems: "center" }}>
                              <div className="comment-avatar" style={{ 
                                width: "24px", 
                                height: "24px", 
                                borderRadius: "50%", 
                                backgroundColor: "#6c757d", 
                                color: "white", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                fontSize: "10px",
                                marginRight: "6px",
                                overflow: "hidden"
                              }}>
                                {reply.accountAvatar ? (
                                  <img 
                                    src={reply.accountAvatar} 
                                    alt={reply.accountName || 'Người dùng'} 
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  reply.accountName ? reply.accountName.substring(0, 2).toUpperCase() : 'ND'
                                )}
                              </div>
                              <span className="comment-author" style={{ 
                                fontWeight: "600", 
                                fontSize: "13px",
                                color: "#344767"
                              }}>
                                {reply.accountName || 'Người dùng'}
                              </span>
                            </div>
                            <span className="comment-date" style={{ 
                              fontSize: "11px", 
                              color: "#6c757d"
                            }}>
                              {new Date(reply.createdAt).toLocaleString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                          <p className="comment-content" style={{ 
                            fontSize: "13px", 
                            margin: "4px 0", 
                            color: "#212529",
                            lineHeight: "1.3"
                          }}>
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination" style={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  marginTop: "15px" 
                }}>
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={`pagination-button ${currentPage === 0 ? "disabled" : ""}`}
                    style={{
                      padding: "5px 10px",
                      fontSize: "13px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      background: currentPage === 0 ? "#f5f5f5" : "#fff",
                      color: currentPage === 0 ? "#aaa" : "#333",
                      cursor: currentPage === 0 ? "not-allowed" : "pointer"
                    }}
                  >
                    Trước
                  </button>
                  <span className="pagination-info" style={{ margin: "0 10px", fontSize: "13px" }}>
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className={`pagination-button ${currentPage === totalPages - 1 ? "disabled" : ""}`}
                    style={{
                      padding: "5px 10px",
                      fontSize: "13px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      background: currentPage === totalPages - 1 ? "#f5f5f5" : "#fff",
                      color: currentPage === totalPages - 1 ? "#aaa" : "#333",
                      cursor: currentPage === totalPages - 1 ? "not-allowed" : "pointer"
                    }}
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              textAlign: "center", 
              padding: "20px 0", 
              color: "#666",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              margin: "15px 0"
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-chat-left" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
              </svg>
              <p style={{ marginTop: "10px", fontSize: "14px" }}>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};
