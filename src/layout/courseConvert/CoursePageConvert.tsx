import React, { useEffect, useState } from "react";
import "./CoursePageConvert.css";
import { TestQuickConvert } from "./TestQuickConvert";
import { LessonVideoRight } from "./LessonVideoRight";
import { useNavigate } from "react-router-dom";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import { authTokenLogin, isTokenExpired } from "../util/fucntion/auth";
import { decryptData, encryptData } from "../util/encryption";
import { TestChapterConvert } from "./TestChapterConvert";
import { ToastContainer, toast } from "react-toastify";
import "./CourseDemo.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import CoverTest from "./CoverTest";
import { start } from "repl";
import { Client, Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import DocumentCourse from "./component/DocumentCourse";

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

export interface Test_Lesson {
  test_id: number;
  type: "test";
  title: string;
}
export interface Test_Chapter {
  test_id: number;
  type: "test_chapter";
  title: string;
}
export interface VideoContent {
  id: number;
  type: "video";
  title: string;
  url: string;
  documentUrl?: string;
  documentShort?: string;
}

export const CoursePageConvert = () => {
  const [courseId, setCourseId] = useState("");
  const [videoId, setVideoId] = useState("");
  const [testId, setTestId] = useState("");
  const [testChapterId, setTestChapterId] = useState("");
  const [currentContent, setCurrentContent] = useState<
    "video" | "test" | "test_chapter" | null
  >(null);
  const navigate = useNavigate();
  const refresh = useRefreshToken();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [openChapters, setOpenChapters] = useState<boolean[]>([]);
  const [openLessons, setOpenLessons] = useState<{ [key: number]: boolean[] }>(
    {}
  );
  const [isDocumentPopupVisible, setIsDocumentPopupVisible] = useState(false);

  const handleOpenDocumentPopup = () => {
    setIsDocumentPopupVisible(true);
  };

  const handleCloseDocumentPopup = () => {
    setIsDocumentPopupVisible(false);
  };
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [progressData, setProgressData] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const authData = localStorage.getItem("authData");
  const accountId = authData ? JSON.parse(authData).id : null;

  const [selectedVideoContent, setSelectedVideoContent] =
    useState<VideoContent | null>(null);
  const [selectedTestContent, setSelectedTestContent] =
    useState<Test_Lesson | null>(null);
  const [selectedTestChapterContent, setSelectedTestChapterContent] =
    useState<Test_Chapter | null>(null);

  const refreshToken = localStorage.getItem("refreshToken");
  const listenAndSendVideoClick = (accountId: number, videoId: number) => {
    const socket = new SockJS(`${process.env.REACT_APP_SERVER_HOST}/ws`); // URL to your WebSocket server
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame: any) {
      console.log("WebSocket connected: " + frame);

      // Create the video click activity data
      const data = {
        activityType: "video_clicked",
        accountId: accountId,
        videoId: videoId,
        timestamp: new Date().toISOString(),
      };

      // Send the data to the server
      stompClient.send("/app/video-clicked", {}, JSON.stringify(data));
    });
  };
  const listenAndSendTestClick = (accountId: number, testId: number) => {
    const socket = new SockJS(`${process.env.REACT_APP_SERVER_HOST}/ws`); // URL to your WebSocket server
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame: any) {
      console.log("WebSocket connected: " + frame);

      // Create the test click activity data
      const data = {
        activityType: "test_clicked",
        accountId: accountId,
        testId: testId,
        timestamp: new Date().toISOString(),
      };

      // Send the data to the server
      stompClient.send("/app/test-clicked", {}, JSON.stringify(data));
    });
  };

  useEffect(() => {
    const storedEncryptedCourseId = localStorage.getItem("encryptedCourseId");
    const storedEncryptedVideoId = localStorage.getItem("encryptedVideoId");
    const storedEncryptedTestId = localStorage.getItem("encryptedTestId");
    const storedEncryptedTestChapterId = localStorage.getItem(
      "encryptedTestChapterId"
    );

    const storedChapterId = localStorage.getItem("encryptedChapterId");
    const storedLessonId = localStorage.getItem("encryptedLessonId");
    if (storedEncryptedCourseId) {
      const decryptedCourseId = decryptData(storedEncryptedCourseId);
      setCourseId(decryptedCourseId);
    }

    if (storedEncryptedVideoId) {
      const decryptedVideoId = decryptData(storedEncryptedVideoId);
      // console.log("Xin chao hi");
      setVideoId(decryptedVideoId);
    }

    if (storedEncryptedTestId) {
      const decryptedTestId = decryptData(storedEncryptedTestId);
      setTestId(decryptedTestId);
    }

    if (storedEncryptedTestChapterId) {
      const decryptedTestChapterId = decryptData(storedEncryptedTestChapterId);
      setTestChapterId(decryptedTestChapterId);
    }
    if (storedChapterId) {
      setActiveChapter(`chapter${storedChapterId}`);
    }
    if (storedLessonId) {
      setActiveChapter(`lesson${storedLessonId}`);
    }
  }, []);

  useEffect(() => {
    if (courseData && (videoId || testId || testChapterId)) {
      const storedChapterId = localStorage.getItem("encryptedChapterId");

      const targetChapterId = storedChapterId ? Number(storedChapterId) : null;

      if (targetChapterId) {
        const newOpenChapters = courseData.chapters.map((chapter) => {
          return chapter.chapter_id === targetChapterId;
        });

        setOpenChapters(newOpenChapters);
      }
    }
  }, [courseData, videoId, testId, testChapterId]);

  const fetchCourseData = async () => {
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
    if (videoId) {
      setSelectedTestContent(null);
      setSelectedTestChapterContent(null);
      setSelectedVideoContent({
        id: parseInt(videoId),
        type: "video",
        title: "",
        url: "",
        documentUrl: "",
        documentShort: "",
      });
      setCurrentContent("video");
    } else if (testId) {
      setSelectedVideoContent(null);
      setSelectedTestChapterContent(null);
      setSelectedTestContent({
        test_id: Number(testId),
        type: "test",
        title: "",
      });
      setCurrentContent("test");
    } else if (testChapterId) {
      setCurrentContent("test_chapter");
      setSelectedVideoContent(null);
      setSelectedTestContent(null);

      setSelectedTestChapterContent({
        test_id: Number(testChapterId),
        type: "test_chapter",
        title: "",
      });
    }
  }, [videoId, testId, testChapterId, courseId]);

  useEffect(() => {
    const fetchProgressData = async () => {
      let token = localStorage.getItem("authToken");

      if (isTokenExpired(token)) {
        token = await refresh();
        if (!token) {
          window.location.href = "/dang-nhap";
          return;
        }
        localStorage.setItem("authToken", token);
      }

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
    const storedChapterId = localStorage.getItem("currentChapterId");
    const storedLessonId = localStorage.getItem("currentLessonId");

    if (storedChapterId && storedLessonId && courseData) {
      const chapterIndex = courseData.chapters.findIndex(
        (chapter) => chapter.chapter_id === parseInt(storedChapterId)
      );

      if (chapterIndex !== -1) {
        setOpenChapters((prev) => {
          const newOpenChapters = [...prev];
          newOpenChapters[chapterIndex] = true;
          return newOpenChapters;
        });

        const lessonIndex = courseData.chapters[chapterIndex].lessons.findIndex(
          (lesson) => lesson.lesson_id === parseInt(storedLessonId)
        );

        if (lessonIndex !== -1) {
          setOpenLessons((prev) => {
            const newOpenLessons = { ...prev };
            newOpenLessons[chapterIndex] = newOpenLessons[chapterIndex] || [];
            newOpenLessons[chapterIndex][lessonIndex] = true;
            return newOpenLessons;
          });
        }
      }
    }
  }, [courseData]);

  // Hàm gọi cập nhật tiến trình nếu k có bài test của bài đó
  const updateProgressNoTest = async (lessonId: string, chapterId: string) => {
    // const chapter = courseData?.chapters[chapterIndex];
    // const lesson = chapter?.lessons[lessonIndex];
    const token = await authTokenLogin(refreshToken, refresh, navigate);

    const requestData = {
      accountId: accountId, // ID của người dùng
      courseId: courseId, // ID khóa học
      chapterId: chapterId, // ID chương
      lessonId: lessonId, // ID bài học
      videoStatus: true,
      testStatus: true,
      isChapterTest: false, // Bài kiểm tra chương không có
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/user-answers/submit-progress-no-test`,
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
        throw new Error("Failed to submit progress");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleVideoClick = (
    videoId: string,
    lessonId: string,
    chapterId: string,
    lessonIDText: string,
    chapterIndex: number,
    lessonIndex: number,
    lesson: Lesson
  ) => {
    if (lesson.lesson_test === null) {
      updateProgressNoTest(lessonId, chapterId);
      window.location.reload();
    }

    listenAndSendVideoClick(accountId, selectedVideoContent?.id!);
    setSelectedTestContent(null);
    setSelectedTestChapterContent(null);
    setVideoId(videoId);

    // const encryptedVideoId = encryptData(videoId.toString());
    // localStorage.setItem("encryptedVideoId", encryptedVideoId);
    localStorage.setItem("currentChapterId", chapterId.toString());
    localStorage.setItem("currentLessonId", lessonId.toString());

    console.log(lessonIDText);
    setSelectedVideoContent({
      id: parseInt(videoId),
      type: "video",
      title: "",
      url: "",
      documentUrl: "",
      documentShort: "",
    });
    setCurrentContent("video");

    const encryptedVideoId = encryptData(videoId);
    localStorage.setItem("encryptedVideoId", encryptedVideoId);
    localStorage.removeItem("encryptedTestId");
    localStorage.removeItem("encryptedTestChapterId");

    const encryptedChapterId = encryptData(chapterId);
    const encryptedLessonId = encryptData(lessonId);
    localStorage.setItem("encryptedChapterId", encryptedChapterId);
    localStorage.setItem("encryptedLessonId", encryptedLessonId);

    // localStorage.setItem("activeChapter", chapterId);
    // localStorage.setItem("activeLesson", lessonId);
    localStorage.setItem("activeLesson", lessonIDText);
    // window.location.reload();
  };

  const handleTestClick = (
    testId: string,
    lessonId: string,
    chapterId: string,
    lessonIDText: string,
    chapterIndex: number,
    lessonIndex: number,
    lesson: Lesson
  ) => {
    if (lesson.lesson_test === null) {
      updateProgressNoTest(lessonId, chapterId);
      window.location.reload();
    }
    listenAndSendTestClick(accountId, selectedTestContent?.test_id!);
    let testIDStore = localStorage.getItem("testIDSTORE");
    if (testId !== testIDStore) {
      localStorage.removeItem("testIDSTORE");
      setIsStarted(false);
    }

    localStorage.removeItem("encryptedVideoId");
    setSelectedVideoContent(null);
    setVideoId("");
    setSelectedTestChapterContent(null);
    setTestId(testId);
    setCurrentContent("test");
    setSelectedTestContent({
      test_id: Number(testId),
      type: "test",
      title: "",
    });
    const encryptedTestId = encryptData(testId);
    localStorage.setItem("encryptedTestId", encryptedTestId);

    localStorage.setItem("currentChapterId", chapterId.toString());
    localStorage.setItem("currentLessonId", lessonId.toString());

    localStorage.removeItem("encryptedTestChapterId");
    const encryptedChapterId = encryptData(chapterId);
    const encryptedLessonId = encryptData(lessonId);
    localStorage.setItem("encryptedChapterId", encryptedChapterId);
    localStorage.setItem("encryptedLessonId", encryptedLessonId);

    localStorage.setItem("activeLesson", lessonIDText);
  };
  const handleTestChapClick = (
    testChapId: string,
    chapterId: string,
    chapterIDText: string
  ) => {
    setTestChapterId(testChapId);
    setCurrentContent("test_chapter");

    const encryptedTestChapterId = encryptData(testChapId);
    localStorage.setItem("encryptedTestChapterId", encryptedTestChapterId);
    localStorage.removeItem("encryptedVideoId");
    localStorage.removeItem("encryptedTestId");
    const encryptedChapterId = encryptData(chapterId);
    localStorage.setItem("encryptedChapterId", encryptedChapterId);

    setSelectedVideoContent(null);
    setSelectedTestContent(null);

    setSelectedTestChapterContent({
      test_id: Number(testChapId),
      type: "test_chapter",
      title: "",
    });

    localStorage.setItem("activeChapter", chapterIDText);
    localStorage.removeItem("activeLesson");
    // window.location.reload();
  };

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
    }
  }, [courseId, testId, testChapterId, videoId]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isVideoCompleted = (chapterId: number, lessonId: number) => {
    const lessonProgress = progressData?.find(
      (p) => p.chapterId === chapterId && p.lessonId === lessonId
    );
    return lessonProgress?.videoStatus || false;
  };

  const isTestChapterCompleted = (chapterId: number) => {
    const chapterTestProgress = progressData?.find(
      (p) => p.chapterId === chapterId && p.lessonId === null
    );
    return chapterTestProgress?.chapterTest || false;
  };

  const isTestCompleted = (chapterId: number, lessonId: number) => {
    const lessonProgress = progressData?.find(
      (p) => p.chapterId === chapterId && p.lessonId === lessonId
    );
    return lessonProgress?.testStatus || false;
  };

  useEffect(() => {
    if (courseData && progressData) {
      let targetChapterId: number | null = null;
      let targetLessonId: number | null = null;
      let targetVideoId: number | null = null;
      let targetTestId: number | null = null;
      let targetChapterTestId: number | null = null;

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
          // setVideoId(targetVideoId.toString());
          setSelectedVideoContent({
            id: targetVideoId,
            type: "video",
            title: "",
            url: "",
            documentUrl: "",
            documentShort: "",
          });
          localStorage.setItem("activeChapter", `chapter${targetChapterId}`);
          localStorage.setItem("activeLesson", `lesson${targetLessonId}`);
        }
        if (targetTestId) {
          // setTestId(targetTestId.toString());
          setSelectedTestContent({
            test_id: targetTestId,
            type: "test",
            title: "",
          });
          localStorage.setItem("activeChapter", `chapter${targetChapterId}`);
          localStorage.setItem("activeLesson", `lesson${targetLessonId}`);
        }
        if (targetChapterTestId) {
          // setTestChapterId(targetChapterTestId.toString());
          setSelectedTestChapterContent({
            test_id: targetChapterTestId,
            type: "test_chapter",
            title: "",
          });
          localStorage.setItem("activeChapter", `chapter${targetChapterId}`);
          localStorage.setItem("activeLesson", `lesson${targetLessonId}`);
        }
      }
    }
  }, [progressData, courseData, videoId, testId, testChapterId]);

  useEffect(() => {
    const storedActiveChapter = localStorage.getItem("activeChapter");
    const storedActiveLesson = localStorage.getItem("activeLesson");

    if (storedActiveChapter) {
      setActiveChapter(storedActiveChapter);
    }

    if (storedActiveLesson) {
      setActiveLesson(storedActiveLesson);
    }
  }, []);

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
  const toggleChapter = (chapterIndex: number) => {
    setOpenChapters((prev) => {
      const newOpenChapters = [...prev];
      newOpenChapters[chapterIndex] = !newOpenChapters[chapterIndex];
      return newOpenChapters;
    });
  };

  const toggleLesson = (chapterIndex: number, lessonIndex: number) => {
    setOpenLessons((prev) => {
      const newOpenLessons = { ...prev };
      newOpenLessons[chapterIndex] = newOpenLessons[chapterIndex] || [];
      newOpenLessons[chapterIndex][lessonIndex] =
        !newOpenLessons[chapterIndex][lessonIndex];
      return newOpenLessons;
    });
  };
  const handleChapterTestClick = (testId: number) => {
    // Implement the logic for handling chapter test clicks
    console.log(`Chapter test clicked with ID: ${testId}`);
  };
  const handleChapterClick = (chapterId: string, chapterIndex: number) => {
    const newActiveChapter = activeChapter === chapterId ? null : chapterId;
    setActiveChapter(newActiveChapter);
    localStorage.setItem("activeChapter", newActiveChapter || "");
    setOpenChapters((prev) => {
      const newOpenChapters = [...prev];
      newOpenChapters[chapterIndex] = !newOpenChapters[chapterIndex];
      return newOpenChapters;
    });
  };

  const handleLessonClick = (
    lessonId: string,
    lessonIndex: number,
    chapterIndex: number
  ) => {
    const newActiveLesson = activeLesson === lessonId ? null : lessonId;
    setActiveLesson(newActiveLesson);
    localStorage.setItem("activeLesson", newActiveLesson || "");

    // Nếu bài học không có lesson_test, cho phép qua bài học mà không cần kiểm tra
    const chapter = courseData?.chapters[chapterIndex];
    const lesson = chapter?.lessons[lessonIndex];

    // setOpenLessons((prev) => {
    //   const newOpenLessons = { ...prev };
    //   newOpenLessons[chapterIndex] = newOpenLessons[chapterIndex] || [];
    //   newOpenLessons[chapterIndex][lessonIndex] =
    //     !newOpenLessons[chapterIndex][lessonIndex];
    //   return newOpenLessons;
    // });
    if (lesson?.lesson_test === null) {
      // Bỏ qua bài kiểm tra, qua bài học tiếp theo
      setOpenLessons((prev) => {
        const newOpenLessons = { ...prev };
        newOpenLessons[chapterIndex] = newOpenLessons[chapterIndex] || [];
        newOpenLessons[chapterIndex][lessonIndex] = true; // Mở bài học tiếp theo
        return newOpenLessons;
      });
    } else {
      setOpenLessons((prev) => {
        const newOpenLessons = { ...prev };
        newOpenLessons[chapterIndex] = newOpenLessons[chapterIndex] || [];
        newOpenLessons[chapterIndex][lessonIndex] =
          !newOpenLessons[chapterIndex][lessonIndex];
        return newOpenLessons;
      });
    }
  };
  const [isStarted, setIsStarted] = useState(false);

  const handleStart = () => {
    setIsStarted(true);
  };

  return (
    <div className="rbt-header-sticky vaohoc">
      <div className="rbt-lesson-area bg-color-white vaohoc">
        <div className="rbt-lesson-content-wrapper vaohoc">
          {isSidebarOpen && (
            <div
              className="rbt-lesson-leftsidebar vaohoc"
              style={{ width: isSidebarOpen ? "25%" : "0" }}
            >
              <div className="rbt-course-feature-inner rbt-search-activation vaohoc">
                <div className="rbt-accordion-style rbt-accordion-02 for-right-content accordion vaohoc">
                  <h1 className="title-course-demo">Nội dung</h1>
                  <div className="title-divider"></div>
                  <button
                    className="course-material-button"
                    onClick={handleOpenDocumentPopup}
                  >
                    Tài liệu khóa học
                  </button>

                  {/* Popup hiển thị DocumentCourse */}
                  {isDocumentPopupVisible && (
                    <div className="popup-overlay">
                      <div className="popup-content">
                        <button
                          className="close-button"
                          onClick={handleCloseDocumentPopup}
                        >
                          &times;
                        </button>
                        <DocumentCourse />
                      </div>
                    </div>
                  )}
                  <div className="accordion vaohoc" id="accordionExampleb2">
                    {courseData?.chapters.map((chapter, chapterIndex) => (
                      <div
                        className="accordion-item card vaohoc"
                        key={chapter.chapter_id}
                      >
                        <h2
                          className="accordion-header card-header vaohoc"
                          id={`headingChapter${chapter.chapter_id}`}
                        >
                          <button
                            className={`chapter-header ${
                              activeChapter === `chapter${chapter.chapter_id}`
                                ? "active"
                                : ""
                            }`}
                            type="button"
                            aria-expanded={
                              activeChapter === `chapter${chapter.chapter_id}`
                            }
                            onClick={() =>
                              handleChapterClick(
                                `chapter${chapter.chapter_id}`,
                                chapterIndex
                              )
                            }
                          >
                            {chapter.chapter_title}
                            <span className="rbt-badge-5 ml--10 vaohoc">
                              {chapter.lessons.length} Lessons
                            </span>
                          </button>
                        </h2>
                        <div
                          id={`collapseChapter${chapter.chapter_id}`}
                          className={`accordion-collapse vaohoc collapse ${
                            activeChapter === `chapter${chapter.chapter_id}`
                              ? "show"
                              : ""
                          }`}
                          aria-labelledby={`headingChapter${chapter.chapter_id}`}
                        >
                          <div className="accordion-body vaohoc card-body">
                            {chapter.lessons.map((lesson, lessonIndex) => (
                              <div
                                className="accordion-item card vaohoc"
                                key={lesson.lesson_id}
                              >
                                <h2
                                  style={{
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                  }}
                                  className="accordion-header card-header vaohoc lesson"
                                  id={`headingLesson${lesson.lesson_id}`}
                                >
                                  <button
                                    className={`lesson-header ${
                                      activeLesson ===
                                      `lesson${lesson.lesson_id} `
                                        ? "show"
                                        : ""
                                    }`}
                                    type="button"
                                    aria-expanded={
                                      activeLesson ===
                                      `lesson${lesson.lesson_id}`
                                    }
                                    onClick={() =>
                                      handleLessonClick(
                                        `lesson${lesson.lesson_id}`,
                                        lessonIndex,
                                        chapterIndex
                                      )
                                    }
                                  >
                                    {lesson.lesson_title}
                                  </button>
                                </h2>
                                <div
                                  id={`collapseLesson${lesson.lesson_id}`}
                                  className={`accordion-collapse vaohoc collapse ${
                                    activeLesson === `lesson${lesson.lesson_id}`
                                      ? "show"
                                      : ""
                                  }`}
                                  aria-labelledby={`headingLesson${lesson.lesson_id}`}
                                >
                                  <div
                                    className="accordion-body card-body vaohoc"
                                    style={{ padding: "0px 10px" }}
                                  >
                                    <ul className="rbt-course-main-content liststyle vaohoc">
                                      {lesson.video &&
                                        lesson.video.video_id && (
                                          <li>
                                            <a
                                              href="#"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                if (
                                                  lesson.video?.video_id &&
                                                  isVideoCompleted(
                                                    chapter.chapter_id,
                                                    lesson.lesson_id
                                                  )
                                                ) {
                                                  handleVideoClick(
                                                    lesson.video.video_id.toString(),
                                                    lesson.lesson_id.toString(),
                                                    chapter.chapter_id.toString(),
                                                    `lesson${lesson.lesson_id.toString()}`,
                                                    chapterIndex,
                                                    lessonIndex,
                                                    lesson
                                                  );
                                                }
                                                // else if (
                                                //   !isVideoCompleted(
                                                //     chapter.chapter_id,
                                                //     lesson.lesson_id
                                                //   )
                                                // ) {
                                                //   showToast(
                                                //     "Hoàn thành bài học trước để mở khóa!"
                                                //   );
                                                // }
                                              }}
                                              className={`content-item test-item ${
                                                isVideoCompleted(
                                                  chapter.chapter_id,
                                                  lesson.lesson_id
                                                )
                                                  ? "completed"
                                                  : "locked"
                                              }`}
                                            >
                                              <div
                                                className="course-content-left vaohoc"
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                }}
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="16"
                                                  height="16"
                                                  fill="currentColor"
                                                  className="bi bi-play-circle"
                                                  style={{
                                                    marginLeft: "-10px",
                                                    marginRight: "5px",
                                                    width: "30px",
                                                  }}
                                                  viewBox="0 0 16 16"
                                                >
                                                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                  <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445" />
                                                </svg>
                                                <span className="text vaohoc">
                                                  {lesson.video.video_title}
                                                </span>
                                              </div>
                                            </a>
                                          </li>
                                        )}
                                      {lesson.lesson_test &&
                                        lesson.lesson_test.test_id && (
                                          <li>
                                            <a
                                              href="#"
                                              className={`content-item test-item ${
                                                isTestCompleted(
                                                  chapter.chapter_id,
                                                  lesson.lesson_id
                                                )
                                                  ? " completed"
                                                  : " locked"
                                              }`}
                                              onClick={(e) => {
                                                // e.preventDefault();
                                                if (
                                                  lesson.lesson_test?.test_id &&
                                                  isTestCompleted(
                                                    chapter.chapter_id,
                                                    lesson.lesson_id
                                                  )
                                                ) {
                                                  handleTestClick(
                                                    lesson.lesson_test.test_id.toString(),
                                                    lesson.lesson_id.toString(),
                                                    chapter.chapter_id.toString(),
                                                    `lesson${lesson.lesson_id.toString()}`,
                                                    chapterIndex,
                                                    lessonIndex,
                                                    lesson
                                                  );
                                                }
                                              }}
                                            >
                                              <div
                                                className="course-content-left vaohoc"
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                }}
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="16"
                                                  height="16"
                                                  fill="currentColor"
                                                  className="bi bi-file-earmark"
                                                  viewBox="0 0 16 16"
                                                  style={{
                                                    marginLeft: "-10px",
                                                    marginRight: "5px",
                                                    width: "30px",
                                                  }}
                                                >
                                                  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z" />
                                                </svg>
                                                <span className="text">
                                                  {
                                                    lesson.lesson_test
                                                      .test_title
                                                  }
                                                </span>
                                              </div>
                                            </a>
                                          </li>
                                        )}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {chapter.chapter_test && (
                              <div className="accordion-item card vaohoc">
                                <h2
                                  className={`accordion-header card-header vaohoc content-item test-item ${
                                    isTestChapterCompleted(chapter.chapter_id)
                                      ? " completed"
                                      : " locked"
                                  }`}
                                  style={{
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                  }}
                                  id={`headingChapterTest${chapter.chapter_id}`}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      // e.preventDefault();
                                      if (
                                        chapter.chapter_test?.test_id &&
                                        isTestChapterCompleted(
                                          chapter.chapter_id
                                        )
                                      ) {
                                        handleTestChapClick(
                                          chapter.chapter_test?.test_id.toString(),

                                          chapter.chapter_id.toString(),
                                          `chapter${chapter.chapter_id}`
                                        );
                                      }
                                    }}
                                  >
                                    {chapter.chapter_test.test_title}
                                  </button>
                                </h2>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {(() => {
            if (selectedTestContent) {
              const validCourseData = Array.isArray(courseData)
                ? courseData
                : [];
              return (
                <CoverTest
                  isSidebarOpen={isSidebarOpen}
                  handleToggleSidebar={handleToggleSidebar}
                  content={selectedTestContent}
                  progressCheck={progressData}
                  courseData={validCourseData! || []}
                  setStartTest={setIsStarted}
                  isStarted={isStarted}
                  selectedTestContent={selectedTestContent}
                />
              );
            } else if (selectedVideoContent) {
              // <TestQuickConvert
              //   isSidebarOpen={isSidebarOpen}
              //   handleToggleSidebar={handleToggleSidebar}
              //   content={selectedTestContent}
              //   progressCheck={progressData}
              //   courseData={validCourseData! || []}
              // />

              return (
                <LessonVideoRight
                  isSidebarOpen={isSidebarOpen}
                  handleToggleSidebar={handleToggleSidebar}
                  content={selectedVideoContent}
                  progressData={progressData}
                  coursesData={courseData}
                />
              );
            } else if (selectedTestChapterContent) {
              return (
                <TestChapterConvert
                  isSidebarOpen={isSidebarOpen}
                  handleToggleSidebar={handleToggleSidebar}
                  content={selectedTestChapterContent}
                  progressCheck={progressData}
                />
              );
            }
            return null;
          })()}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
