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
import { CourseDataCourse } from "./TestQuickConvert";

interface Lesson {
  lesson_id: number;
  lesson_title: string;
  lesson_duration: number;
  completedLesson: boolean;
  video: {
    video_id: number;
    video_title: string;
    video_url: string;
    document_short: string | null;
    document_url: string | null;
    videoCompleted: boolean;
  } | null;
  lesson_test: {
    test_id: number;
    test_title: string;
    test_type: string;
    durationTest: number;
    completedTestChapter: boolean | null;
    completedTest: boolean;
  } | null;
  isRequired?: boolean;
  learningTip?: string | null;
  keyPoint?: string | null;
  overviewLesson?: string | null;
}

interface Chapter {
  chapter_id: number;
  chapter_title: string;
  lessons: Lesson[];
  chapter_test: {
    test_id: number;
    test_title: string;
    test_type: string;
    durationTest: number;
    completedTestChapter: boolean;
    completedTest: boolean | null;
    isRequired?: boolean;
  } | null;
}

export interface CourseData {
  course_id: number;
  course_title: string;
  chapters: Chapter[];
}

export interface Test_Lesson {
  test_id: number;
  type: "test";
  title: string;
  description?: string;
  totalQuestion?: number;
  duration?: number;
}
export interface Test_Chapter {
  test_id: number;
  type: "test_chapter";
  title: string;
  description?: string;
  totalQuestion?: number;
  duration?: number;
}
export interface VideoContent {
  id: number;
  type: "video";
  title: string;
  url: string;
  documentUrl?: string;
  documentShort?: string;
}

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
  const [isStarted, setIsStarted] = useState(false);
  const [shouldFetchQuestions, setShouldFetchQuestions] = useState(false);

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

  // Functions for handling video and test clicks
  const handleVideoClick = async (
    videoId: string,
    lessonId: string,
    chapterId: string,
    lessonIDText: string,
    chapterIndex: number,
    lessonIndex: number,
    lesson: Lesson
  ) => {
    listenAndSendVideoClick(accountId, parseInt(videoId));

    // If the lesson doesn't have a test, call the unlock-next API
    if (lesson.lesson_test === null) {
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

        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/progress/unlock-next?accountId=${accountId}&courseId=${courseId}&chapterId=${chapterId}&lessonId=${lessonId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          console.log("Successfully unlocked next lesson");
          // Refresh progress data to update UI
          fetchProgressData();
        } else {
          console.error("Failed to unlock next lesson");
        }
      } catch (error) {
        console.error("Error unlocking next lesson:", error);
      }
    }

    setSelectedTestContent(null);
    setSelectedTestChapterContent(null);
    setVideoId(videoId);

    localStorage.setItem("currentChapterId", chapterId.toString());
    localStorage.setItem("currentLessonId", lessonId.toString());

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

    localStorage.setItem("activeLesson", lessonIDText);
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
    listenAndSendTestClick(accountId, parseInt(testId));
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
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Completion checking functions
  const isVideoCompleted = (chapterId: number, lessonId: number) => {
    // Check if this is the first lesson in the first chapter
    const isFirstLesson = courseData && courseData.chapters && courseData.chapters.length > 0 &&
      courseData.chapters[0].chapter_id === chapterId &&
      courseData.chapters[0].lessons.length > 0 &&
      courseData.chapters[0].lessons[0].lesson_id === lessonId;

    // First lesson is always accessible
    if (isFirstLesson) {
      return true;
    }

    // Find the chapter and lesson
    const chapter = courseData?.chapters.find(ch => ch.chapter_id === chapterId);
    const lesson = chapter?.lessons.find(l => l.lesson_id === lessonId);

    // Check if lesson is not required
    if (lesson?.isRequired === false) {
      return true;
    }

    // Check if this lesson has a progress entry (if it does, it should be accessible)
    const lessonProgress = progressData?.find(
      (p) => p.chapterId === chapterId && p.lessonId === lessonId
    );
    if (lessonProgress) {
      return true;
    }

    // Check if the previous lesson in the same chapter has been completed
    if (chapter) {
      const lessonIndex = chapter.lessons.findIndex(l => l.lesson_id === lessonId);
      if (lessonIndex > 0) {
        const previousLesson = chapter.lessons[lessonIndex - 1];
        const previousLessonProgress = progressData?.find(
          (p) => p.chapterId === chapterId && p.lessonId === previousLesson.lesson_id
        );

        // If the previous lesson has both video and test completed, or it doesn't have a test
        if (previousLessonProgress?.videoStatus &&
          (previousLessonProgress?.testStatus || previousLesson.lesson_test === null)) {
          return true;
        }
      } else if (lessonIndex === 0 && chapterId > 1) {
        // If this is the first lesson of a chapter that's not the first chapter,
        // check if the last lesson of the previous chapter is completed
        const previousChapter = courseData?.chapters.find(ch => ch.chapter_id === chapterId - 1);
        if (previousChapter && previousChapter.lessons.length > 0) {
          const lastLessonOfPreviousChapter = previousChapter.lessons[previousChapter.lessons.length - 1];
          const lastLessonProgress = progressData?.find(
            (p) => p.chapterId === previousChapter.chapter_id &&
              p.lessonId === lastLessonOfPreviousChapter.lesson_id
          );

          // If the last lesson of previous chapter has both video and test completed, or it doesn't have a test
          if (lastLessonProgress?.videoStatus &&
            (lastLessonProgress?.testStatus || lastLessonOfPreviousChapter.lesson_test === null)) {
            return true;
          }
        }
      }
    }

    return false;
  };

  const isTestChapterCompleted = (chapterId: number) => {
    // Find the chapter
    const chapter = courseData?.chapters.find(ch => ch.chapter_id === chapterId);

    // Check if chapter test is not required
    if (chapter?.chapter_test?.isRequired === false) {
      return true;
    }

    // Check the progress data (old API)
    const chapterTestProgress = progressData?.find(
      (p) => p.chapterId === chapterId && p.lessonId === null
    );
    return chapterTestProgress?.chapterTest || false;
  };

  const isTestCompleted = (chapterId: number, lessonId: number) => {
    // Find the chapter and lesson
    const chapter = courseData?.chapters.find(ch => ch.chapter_id === chapterId);
    const lesson = chapter?.lessons.find(l => l.lesson_id === lessonId);

    // Check if lesson is not required
    if (lesson?.isRequired === false) {
      return true;
    }

    // Check the progress data (old API)
    const lessonProgress = progressData?.find(
      (p) => p.chapterId === chapterId && p.lessonId === lessonId
    );
    return lessonProgress?.testStatus || false;
  };

  // # Lắng nghe web socket để ghi nhận hành động của người dùng
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
      setActiveLesson(`lesson${storedLessonId}`);
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
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/take-course/${courseId}?accountId=${accountId}`,
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
      // Ignore the completion status fields in the course data
      const processedData = {
        ...data,
        chapters: data.chapters.map((chapter: any) => ({
          ...chapter,
          lessons: chapter.lessons.map((lesson: any) => ({
            ...lesson,
            video: lesson.video ? {
              ...lesson.video,
              // Remove videoCompleted field
              videoCompleted: undefined
            } : null,
            lesson_test: lesson.lesson_test ? {
              ...lesson.lesson_test,
              // Remove completedTest field
              completedTest: undefined
            } : null
          })),
          chapter_test: chapter.chapter_test ? {
            ...chapter.chapter_test,
            // Remove completedTestChapter field
            completedTestChapter: undefined
          } : null
        }))
      };

      setCourseData(processedData);
      console.log("Course data loaded:", processedData);

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

  // Update UI based on loaded course data
  useEffect(() => {
    if (courseData) {
      // If we have videoId, testId, or testChapterId, find the corresponding content
      if (videoId) {
        const videoLesson = courseData.chapters
          .flatMap((chapter) =>
            chapter.lessons.map((lesson) => ({
              chapterId: chapter.chapter_id,
              lessonId: lesson.lesson_id,
              videoId: lesson.video?.video_id,
              videoTitle: lesson.video?.video_title,
              videoUrl: lesson.video?.video_url,
              documentUrl: lesson.video?.document_url,
              documentShort: lesson.video?.document_short,
            }))
          )
          .find((item) => item.videoId === Number(videoId));

        if (videoLesson) {
          setSelectedVideoContent({
            id: videoLesson.videoId!,
            type: "video",
            title: videoLesson.videoTitle || "",
            url: videoLesson.videoUrl || "",
            documentUrl: videoLesson.documentUrl || "",
            documentShort: videoLesson.documentShort || "",
          });
          setCurrentContent("video");

          // Set active chapter and lesson
          localStorage.setItem("activeChapter", `chapter${videoLesson.chapterId}`);
          localStorage.setItem("activeLesson", `lesson${videoLesson.lessonId}`);
          setActiveChapter(`chapter${videoLesson.chapterId}`);
          setActiveLesson(`lesson${videoLesson.lessonId}`);

          // Open the chapter and lesson in the sidebar
          const chapterIndex = courseData.chapters.findIndex(
            (ch) => ch.chapter_id === videoLesson.chapterId
          );

          if (chapterIndex !== -1) {
            const newOpenChapters = Array(courseData.chapters.length).fill(false);
            newOpenChapters[chapterIndex] = true;
            setOpenChapters(newOpenChapters);

            const lessonIndex = courseData.chapters[chapterIndex].lessons.findIndex(
              (les) => les.lesson_id === videoLesson.lessonId
            );

            if (lessonIndex !== -1) {
              const newOpenLessons = { ...openLessons };
              newOpenLessons[chapterIndex] = Array(courseData.chapters[chapterIndex].lessons.length).fill(false);
              newOpenLessons[chapterIndex][lessonIndex] = true;
              setOpenLessons(newOpenLessons);
            }
          }
        }
      } else if (testId) {
        const testLesson = courseData.chapters
          .flatMap((chapter) =>
            chapter.lessons.map((lesson) => ({
              chapterId: chapter.chapter_id,
              lessonId: lesson.lesson_id,
              testId: lesson.lesson_test?.test_id,
              testTitle: lesson.lesson_test?.test_title,
            }))
          )
          .find((item) => item.testId === Number(testId));

        if (testLesson) {
          setSelectedTestContent({
            test_id: testLesson.testId!,
            type: "test",
            title: testLesson.testTitle || "",
          });
          setCurrentContent("test");

          // Set active chapter and lesson
          localStorage.setItem("activeChapter", `chapter${testLesson.chapterId}`);
          localStorage.setItem("activeLesson", `lesson${testLesson.lessonId}`);
          setActiveChapter(`chapter${testLesson.chapterId}`);
          setActiveLesson(`lesson${testLesson.lessonId}`);

          // Open the chapter and lesson in the sidebar
          const chapterIndex = courseData.chapters.findIndex(
            (ch) => ch.chapter_id === testLesson.chapterId
          );

          if (chapterIndex !== -1) {
            const newOpenChapters = Array(courseData.chapters.length).fill(false);
            newOpenChapters[chapterIndex] = true;
            setOpenChapters(newOpenChapters);

            const lessonIndex = courseData.chapters[chapterIndex].lessons.findIndex(
              (les) => les.lesson_id === testLesson.lessonId
            );

            if (lessonIndex !== -1) {
              const newOpenLessons = { ...openLessons };
              newOpenLessons[chapterIndex] = Array(courseData.chapters[chapterIndex].lessons.length).fill(false);
              newOpenLessons[chapterIndex][lessonIndex] = true;
              setOpenLessons(newOpenLessons);
            }
          }
        }
      } else if (testChapterId) {
        const testChapter = courseData.chapters.find(
          (chapter) => chapter.chapter_test?.test_id === Number(testChapterId)
        );

        if (testChapter) {
          setSelectedTestChapterContent({
            test_id: testChapter.chapter_test!.test_id,
            type: "test_chapter",
            title: testChapter.chapter_test!.test_title || "",
          });
          setCurrentContent("test_chapter");

          // Set active chapter
          localStorage.setItem("activeChapter", `chapter${testChapter.chapter_id}`);
          setActiveChapter(`chapter${testChapter.chapter_id}`);
          localStorage.removeItem("activeLesson");
          setActiveLesson(null);

          // Open the chapter in the sidebar
          const chapterIndex = courseData.chapters.findIndex(
            (ch) => ch.chapter_id === testChapter.chapter_id
          );

          if (chapterIndex !== -1) {
            const newOpenChapters = Array(courseData.chapters.length).fill(false);
            newOpenChapters[chapterIndex] = true;
            setOpenChapters(newOpenChapters);
          }
        }
      } else {
        // If no specific content is selected, show the first available lesson
        const firstChapter = courseData.chapters[0];
        if (firstChapter && firstChapter.lessons.length > 0) {
          const firstLesson = firstChapter.lessons[0];
          if (firstLesson.video) {
            setSelectedVideoContent({
              id: firstLesson.video.video_id,
              type: "video",
              title: firstLesson.video.video_title,
              url: firstLesson.video.video_url,
              documentUrl: firstLesson.video.document_url || "",
              documentShort: firstLesson.video.document_short || "",
            });
            setCurrentContent("video");

            // Set active chapter and lesson
            localStorage.setItem("activeChapter", `chapter${firstChapter.chapter_id}`);
            localStorage.setItem("activeLesson", `lesson${firstLesson.lesson_id}`);
            setActiveChapter(`chapter${firstChapter.chapter_id}`);
            setActiveLesson(`lesson${firstLesson.lesson_id}`);

            // Open the first chapter and lesson in the sidebar
            const newOpenChapters = Array(courseData.chapters.length).fill(false);
            newOpenChapters[0] = true;
            setOpenChapters(newOpenChapters);

            const newOpenLessons = { ...openLessons };
            newOpenLessons[0] = Array(courseData.chapters[0].lessons.length).fill(false);
            newOpenLessons[0][0] = true;
            setOpenLessons(newOpenLessons);
          }
        }
      }
    }
  }, [courseData, videoId, testId, testChapterId]);

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
      newOpenLessons[chapterIndex][lessonIndex] = !newOpenLessons[chapterIndex][lessonIndex];
      return newOpenLessons;
    });
  };
  const handleChapterTestClick = (testId: number) => {
    // Implement the logic for handling chapter test clicks
    console.log(`Chapter test clicked with ID: ${testId}`);
  };
  const handleChapterClick = (chapterId: string, chapterIndex: number) => {
    setActiveChapter(chapterId);
    toggleChapter(chapterIndex);
  };

  const handleLessonClick = (
    lessonId: string,
    lessonIndex: number,
    chapterIndex: number
  ) => {
    setActiveLesson(lessonId);
    toggleLesson(chapterIndex, lessonIndex);
  };

  const handleStart = () => {
    setIsStarted(true);
    // Only set shouldFetchQuestions to true if it's not already true
    if (!shouldFetchQuestions) {
      setShouldFetchQuestions(true);
    }
  };

  // Add the fetchProgressData function
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
      try {
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
          console.log("Progress data loaded:", data);
        } else {
          console.error("Failed to fetch progress data");
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
      }
    }
  };

  // Add useEffect to fetch progress data when courseData changes
  useEffect(() => {
    if (courseData && accountId) {
      fetchProgressData();
    }
  }, [courseData, accountId]);

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
                            className={`chapter-header ${activeChapter === `chapter${chapter.chapter_id}`
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
                          className={`accordion-collapse vaohoc collapse ${activeChapter === `chapter${chapter.chapter_id}`
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
                                    className={`lesson-header ${activeLesson ===
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
                                  className={`accordion-collapse vaohoc collapse ${activeLesson === `lesson${lesson.lesson_id}`
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
                                                // Cho bài đầu tiên, luôn cho phép click
                                                const isFirstLessonCheck =
                                                  courseData && courseData.chapters && courseData.chapters.length > 0 &&
                                                  courseData.chapters[0].chapter_id === chapter.chapter_id &&
                                                  courseData.chapters[0].lessons.length > 0 &&
                                                  courseData.chapters[0].lessons[0].lesson_id === lesson.lesson_id;

                                                // Kiểm tra xem bài học có bắt buộc không
                                                const isNotRequired = lesson.isRequired === false;

                                                if (lesson.video?.video_id &&
                                                  (isFirstLessonCheck || isNotRequired || isVideoCompleted(chapter.chapter_id, lesson.lesson_id))
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
                                                } else if (
                                                  lesson.video && !isVideoCompleted(chapter.chapter_id, lesson.lesson_id) && !isFirstLessonCheck && !isNotRequired
                                                ) {
                                                  showToast(
                                                    "Hoàn thành bài học trước để mở khóa!"
                                                  );
                                                }
                                              }}
                                              className={`content-item test-item ${
                                                // Bài đầu tiên luôn được xem là completed hoặc bài không bắt buộc
                                                (courseData && courseData.chapters && courseData.chapters.length > 0 &&
                                                  courseData.chapters[0].chapter_id === chapter.chapter_id &&
                                                  courseData.chapters[0].lessons.length > 0 &&
                                                  courseData.chapters[0].lessons[0].lesson_id === lesson.lesson_id) ||
                                                  lesson.isRequired === false ||
                                                  isVideoCompleted(chapter.chapter_id, lesson.lesson_id)
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
                                              className={`content-item test-item ${isTestCompleted(chapter.chapter_id, lesson.lesson_id) ||
                                                lesson.isRequired === false ||
                                                progressData?.find(p => p.chapterId === chapter.chapter_id && p.lessonId === lesson.lesson_id) ||
                                                isVideoCompleted(chapter.chapter_id, lesson.lesson_id)
                                                ? " completed"
                                                : " locked"
                                                }`}
                                              onClick={(e) => {
                                                e.preventDefault();
                                                // Kiểm tra xem bài học có bắt buộc không
                                                const isNotRequired = lesson.isRequired === false;

                                                // Check if this lesson is already in progress data
                                                const lessonInProgress = progressData?.find(
                                                  (p) => p.chapterId === chapter.chapter_id && p.lessonId === lesson.lesson_id
                                                );

                                                if (
                                                  lesson.lesson_test?.test_id &&
                                                  (isNotRequired || isTestCompleted(chapter.chapter_id, lesson.lesson_id) ||
                                                    lessonInProgress || isVideoCompleted(chapter.chapter_id, lesson.lesson_id))
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
                                                } else {
                                                  showToast("Hoàn thành bài học trước để mở khóa!");
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
                                  className={`accordion-header card-header vaohoc content-item test-item ${isTestChapterCompleted(chapter.chapter_id) ||
                                    chapter.chapter_test?.isRequired === false ||
                                    // Check if all lessons in the chapter are completed
                                    chapter.lessons.every(lesson =>
                                      progressData?.find(p =>
                                        p.chapterId === chapter.chapter_id &&
                                        p.lessonId === lesson.lesson_id &&
                                        p.videoStatus === true &&
                                        (p.testStatus === true || lesson.lesson_test === null)
                                      )
                                    )
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
                                      e.preventDefault();
                                      const isNotRequired = chapter.chapter_test?.isRequired === false;

                                      // Check if all lessons in the chapter are completed
                                      const allLessonsCompleted = chapter.lessons.every(lesson =>
                                        progressData?.find(p =>
                                          p.chapterId === chapter.chapter_id &&
                                          p.lessonId === lesson.lesson_id &&
                                          p.videoStatus === true &&
                                          (p.testStatus === true || lesson.lesson_test === null)
                                        )
                                      );

                                      if (
                                        chapter.chapter_test?.test_id &&
                                        (isNotRequired || isTestChapterCompleted(chapter.chapter_id) || allLessonsCompleted)
                                      ) {
                                        handleTestChapClick(
                                          chapter.chapter_test?.test_id.toString(),
                                          chapter.chapter_id.toString(),
                                          `chapter${chapter.chapter_id}`
                                        );
                                      } else {
                                        showToast("Hoàn thành tất cả bài học trong chương để mở khóa!");
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
              const courseDataArray = courseData ? [courseData] : [];
              return (
                <CoverTest
                  isSidebarOpen={isSidebarOpen}
                  handleToggleSidebar={handleToggleSidebar}
                  content={selectedTestContent}
                  progressCheck={progressData as any}
                  courseData={courseDataArray as any}
                  setStartTest={setIsStarted}
                  isStarted={isStarted}
                  selectedTestContent={selectedTestContent}
                  shouldFetchQuestions={shouldFetchQuestions}
                  setShouldFetchQuestions={setShouldFetchQuestions}
                />
              );
            } else if (selectedVideoContent) {
              return (
                <LessonVideoRight
                  isSidebarOpen={isSidebarOpen}
                  handleToggleSidebar={handleToggleSidebar}
                  content={selectedVideoContent}
                  coursesData={courseData}
                  progressData={progressData}
                />
              );
            } else if (selectedTestChapterContent) {
              return (
                <TestChapterConvert
                  isSidebarOpen={isSidebarOpen}
                  handleToggleSidebar={handleToggleSidebar}
                  content={selectedTestChapterContent}
                  progressCheck={progressData as any}
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
