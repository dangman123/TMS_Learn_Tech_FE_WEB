import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CourseDemo.css"; // Import your custom CSS file
import { CourseSideBarComponent } from "./Component_VaoHoc/CourseSideBarComponent";
import { CourseMainComponent } from "./Component_VaoHoc/CourseMainComponent";
import { useNavigate, useParams } from "react-router-dom";
import { authTokenLogin, isTokenExpired, refreshToken } from "../util/fucntion/auth";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import { decryptData, encryptData } from "../util/encryption";
import { Test_Chapter, Test_Lesson, VideoContent } from "../courseConvert/CoursePageConvert";
interface Progress {
  accountId: number;
  courseId: number;
  chapterId: number;
  lessonId: number;
  videoStatus: boolean;
  testStatus: boolean;
  testScore: number | null;
  chapterTest: boolean;
}

interface Lesson {
  lesson_id: number;
  lesson_title: string;
  lesson_duration: number;
  video: {
    video_id: number;
    video_title: string;
    video_url: string;
    document_short: string;
    document_url: string;
  } | null;
  lesson_test: {
    test_id: number;
    test_title: string;
    test_type: string;
  } | null;
}

interface Chapter {
  chapter_id: number;
  chapter_title: string;
  lessons: Lesson[];
  chapter_test: {
    test_id: number;
    test_title: string;
    test_type: string;
  } | null;
}

interface CourseData {
  course_id: number;
  course_title: string;
  chapters: Chapter[];
}

const CourseVaoHoc: React.FC = () => {
  const [courseId, setCourseId] = useState("");
  const [videoId, setVideoId] = useState("");
  const [testId, setTestId] = useState("");
  const [testChapterId, setTestChapterId] = useState("");

  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");

  const [openChapters, setOpenChapters] = useState<boolean[]>(
    Array(10).fill(false)
  );
  const [openLessons, setOpenLessons] = useState<{ [key: number]: boolean[] }>(
    {}
  );

  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const authData = localStorage.getItem("authData");
  const accountId = authData ? JSON.parse(authData).id : null;


  const [selectedVideoContent, setSelectedVideoContent] = useState<VideoContent | null>(null);
  const [selectedTestContent, setSelectedTestContent] = useState<Test_Lesson | null>(null);
  const [selectedTestChapterContent, setSelectedTestChapterContent] = useState<Test_Chapter | null>(null);



  useEffect(() => {
    const storedEncryptedCourseId = localStorage.getItem("encryptedCourseId");
    const storedEncryptedVideoId = localStorage.getItem("encryptedVideoId");
    const storedEncryptedTestId = localStorage.getItem("encryptedTestId");
    const storedEncryptedTestChapterId = localStorage.getItem(
      "encryptedTestChapterId"
    );
    if (storedEncryptedCourseId) {
      const decryptedCourseId = decryptData(storedEncryptedCourseId);
      setCourseId(decryptedCourseId);
    }

    if (storedEncryptedVideoId) {
      const decryptedVideoId = decryptData(storedEncryptedVideoId);
      setVideoId(decryptedVideoId);
    }

    if (storedEncryptedTestId) {
      const decryptedTestId = decryptData(storedEncryptedTestId);
      setTestId(decryptedTestId);
    }

    if (storedEncryptedTestChapterId) {
      const decryptedTestChapterId = decryptData(storedEncryptedTestChapterId);
      setTestChapterId(decryptedTestChapterId);
      // console.log(testChapterId);
    }
  }, []);

  const fetchCourseData = async () => {
    const token = await authTokenLogin(refreshToken, refresh, navigate);


    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/take-course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch course data. Status: ${response.status}`
        );
      }

      const data = await response.json();
      setCourseData(data);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching course data:", error);
      setIsLoading(false);
    }
  };
  const fetchVideoData = async (videoId: string) => {
    const token = await authTokenLogin(refreshToken, refresh, navigate);


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
      setSelectedVideoContent(videoData);
    } catch (error) {
      console.error("Error fetching video data:", error);
    }
  };
  const fetchTestData = async (testId: number) => {
    const token = await authTokenLogin(refreshToken, refresh, navigate);


    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/tests/${testId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch test data. Status: ${response.status}`
        );
      }

      const testData = await response.json();
      setSelectedTestContent({
        test_id: testData.id,
        type: "test",
        title: testData.title,
      });
    } catch (error) {
      console.error("Error fetching test data:", error);
    }
  };
  const fetchTestChapterData = async (testChapterId: number) => {
    const token = await authTokenLogin(refreshToken, refresh, navigate);


    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/tests/${testChapterId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch test data. Status: ${response.status}`
        );
      }

      const testData = await response.json();
      setSelectedTestChapterContent({
        test_id: testData.id,
        type: "test_chapter",
        title: testData.title,
      });
    } catch (error) {
      console.error("Error fetching test data:", error);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  useEffect(() => {
    if (courseData) {
      const initialOpenChapters = Array(courseData.chapters.length).fill(false);
      const initialOpenLessons: { [key: number]: boolean[] } = {};

      courseData.chapters.forEach((chapter, chapterIndex) => {
        initialOpenLessons[chapterIndex] = Array(chapter.lessons.length).fill(
          false
        );
      });

      setOpenChapters(initialOpenChapters);
      setOpenLessons(initialOpenLessons);
    }
  }, [courseData]);

  useEffect(() => {
    const fetchProgressData = async () => {
      const token = await authTokenLogin(refreshToken, refresh, navigate);


      if (courseData) {
        const courseId = courseData.course_id;
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/progress/${courseId}/progress/${accountId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProgressData(data);
        } else {
          console.error("Failed to fetch progress data");
        }
      }
    };

    fetchProgressData();
  }, [courseData, accountId]);

  useEffect(() => {
    if (videoId) {
      fetchVideoData(videoId);
      setSelectedTestContent(null);
      setSelectedTestChapterContent(null);
    } else if (testId) {
      fetchTestData(Number(testId));
      setSelectedVideoContent(null);
      setSelectedTestChapterContent(null);
    } else if (testChapterId) {
      fetchTestChapterData(Number(testChapterId));
      setSelectedVideoContent(null);
      setSelectedTestContent(null);
    }
  }, [videoId, testId, testChapterId]);




  const toggleChapter = (index: number) => {
    setOpenChapters((prev) =>
      prev.map((open, i) => (i === index ? !open : open))
    );
  };

  const toggleLesson = (chapterIndex: number, lessonIndex: number) => {
    setOpenLessons((prev) => ({
      ...prev,
      [chapterIndex]: prev[chapterIndex].map((open, i) =>
        i === lessonIndex ? !open : open
      ),
    }));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };


  const handleVideoClick = (videoId: number) => {
    const encryptedVideoId = encryptData(videoId.toString());
    localStorage.setItem("encryptedVideoId", encryptedVideoId);
    localStorage.removeItem("encryptedTestChapterId");
    localStorage.removeItem("encryptedTestId");
    // window.location.href = `/khoa-hoc/vao-hoc/video`;
  };

  const handleTestClick = (testId: number) => {
    const encryptedTestId = encryptData(testId.toString());

    localStorage.setItem("encryptedTestId", encryptedTestId);
    localStorage.removeItem("encryptedVideoId");
    localStorage.removeItem("encryptedTestChapterId");

    // window.location.href = `/khoa-hoc/vao-hoc/test`;
  };

  // const handleTestChapterClick = (testChapterId: number) => {
  //   const encryptedTestChapterId = encryptData(testChapterId.toString());
  //   localStorage.setItem("encryptedTestChapterId", encryptedTestChapterId);
  //   localStorage.removeItem("encryptedVideoId");
  //   localStorage.removeItem("encryptedTestId");
  //   navigate(`/khoa-hoc/vao-hoc/test-chapter`);
  // };

  const goHome = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    if (courseData && progressData) {
      let targetChapterId: number | null = null;
      let targetLessonId: number | null = null;
      let targetVideoId: number | null = null;
      let targetTestId: number | null = null;
      let targetChapterTestId: number | null = null;
      console.log(targetChapterId);
      console.log(targetLessonId);
      // Ưu tiên xác định vị trí dựa trên `videoId`, `testId`, hoặc `chapterTestId`
      if (videoId) {
        const videoLesson = courseData.chapters
          .flatMap((chapter) =>
            chapter.lessons.map((lesson) => ({
              chapterId: chapter.chapter_id,
              lessonId: lesson.lesson_id,
              videoId: lesson.video?.video_id,
            }))
          )
          .find((item) => item.videoId === Number(videoId));

        if (videoLesson) {
          targetChapterId = videoLesson.chapterId;
          targetLessonId = videoLesson.lessonId;
          targetVideoId = videoLesson.videoId!;
        }
      } else if (testId) {
        const testLesson = courseData.chapters
          .flatMap((chapter) =>
            chapter.lessons.map((lesson) => ({
              chapterId: chapter.chapter_id,
              lessonId: lesson.lesson_id,
              testId: lesson.lesson_test?.test_id,
            }))
          )
          .find((item) => item.testId === Number(testId));

        if (testLesson) {
          targetChapterId = testLesson.chapterId;
          targetLessonId = testLesson.lessonId;
          targetTestId = testLesson.testId!;
        }
      } else if (testChapterId) {
        const testChapter = courseData.chapters.find(
          (chapter) => chapter.chapter_test?.test_id === Number(testChapterId)
        );
        if (testChapter) {
          targetChapterId = testChapter.chapter_id;
          targetChapterTestId = testChapter.chapter_test?.test_id!;
        }
      }

      // Nếu không tìm thấy target từ các ID, sử dụng `progressData` để xác định vị trí gần nhất
      if (!targetChapterId && !targetLessonId) {
        const latestProgress = progressData.find(
          (progress) =>
            (!progress.videoStatus ||
              !progress.testStatus ||
              !progress.chapterTest) &&
            (progress.testScore === 0 || progress.testScore === null)
        );

        console.log(latestProgress);

        if (latestProgress) {
          targetChapterId = latestProgress.chapterId;
          targetLessonId = latestProgress.lessonId;
          console.log(targetChapterId);
          console.log(targetLessonId);
          // Lấy ra video hoặc bài test từ tiến trình này
          const chapter = courseData.chapters.find(
            (ch) => ch.chapter_id === latestProgress.chapterId
          );
          if (chapter) {
            const lesson = chapter.lessons.find(
              (ls) => ls.lesson_id === latestProgress.lessonId
            );
            if (lesson) {
              // Kiểm tra trạng thái của bài kiểm tra trong bài học (lesson)
              if (
                lesson.lesson_test && // Bài học có bài kiểm tra
                (latestProgress.testScore === 0 ||
                  latestProgress.testScore === null) // testScore = 0 hoặc null
              ) {
                targetTestId = lesson.lesson_test.test_id; // Gán test_id của bài kiểm tra vào targetTestId
              }
            }

            if (!latestProgress.chapterTest && chapter.chapter_test) {
              targetChapterTestId = chapter.chapter_test.test_id;
            }
          }
        }
      }

      // Nếu tìm thấy vị trí (chapterId và lessonId hoặc chỉ chapterId)
      if (targetChapterId !== null) {
        const newOpenChapters = courseData.chapters.map((chapter) => {
          return chapter.chapter_id === targetChapterId;
        });

        const newOpenLessons = courseData.chapters.reduce(
          (acc, chapter, chapterIndex) => {
            if (chapter.chapter_id === targetChapterId) {
              acc[chapterIndex] = chapter.lessons.map((lesson) => {
                return lesson.lesson_id === targetLessonId;
              });
            } else {
              acc[chapterIndex] = Array(chapter.lessons.length).fill(false);
            }
            return acc;
          },
          {} as { [key: number]: boolean[] }
        );

        setOpenChapters(newOpenChapters);
        setOpenLessons(newOpenLessons);

        // Lưu trữ trạng thái để hiển thị
        if (targetVideoId) {
          setVideoId(targetVideoId.toString());
        }
        if (targetTestId) {
          setTestId(targetTestId.toString());
        }
        if (targetChapterTestId) {
          setTestChapterId(targetChapterTestId.toString());
        }
      }
    }
  }, [progressData, courseData, videoId, testId, testChapterId]);

  return (
    <div className="course-demo-container">
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        {isSidebarOpen ? (
          <i className="fa-solid fa-xmark"></i>
        ) : (
          <i className="fa-solid fa-bars"></i>
        )}
      </button>

      <button className="sidebar-toggle-btn" style={{ display: "block" }} onClick={goHome} >
        Về trang chủ
      </button>
      {isSidebarOpen && (
        <div className="overlay-course" onClick={handleOverlayClick}></div>
      )}

      <div className="row">
        <CourseSideBarComponent
          isSidebarOpen={isSidebarOpen}
          openChapters={openChapters}
          openLessons={openLessons}
          setOpenChapters={setOpenChapters}
          setOpenLessons={setOpenLessons}
          toggleChapter={toggleChapter}
          toggleLesson={toggleLesson}

          courseData={courseData}
          progressData={progressData}

          onVideoClick={handleVideoClick}
          onTestClick={handleTestClick}

          accountId={accountId}

        />

        <CourseMainComponent
          key={selectedVideoContent?.url || selectedTestContent?.title}

          selectedVideoContent={selectedVideoContent}
          selectedTestContent={selectedTestContent}
          selectedTestChapterContent={selectedTestChapterContent}
        />
      </div>
    </div>
  );
};

export default CourseVaoHoc;
