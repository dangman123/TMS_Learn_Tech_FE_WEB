import React, { useEffect, useState } from "react";
import "./CourseSideBarVaoHoc.css";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../util/fucntion/auth";
import { encryptData } from "../../util/encryption";

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

interface CourseSideBarComponentProps {
  isSidebarOpen: boolean;
  accountId: number | null;
  openChapters: boolean[];
  openLessons: { [key: number]: boolean[] };
  setOpenChapters: React.Dispatch<React.SetStateAction<boolean[]>>;
  setOpenLessons: React.Dispatch<
    React.SetStateAction<{ [key: number]: boolean[] }>
  >;
  toggleChapter: (chapterIndex: number) => void;
  toggleLesson: (chapterIndex: number, lessonIndex: number) => void;
  courseData: CourseData | null;
  progressData: Progress[] | null;
  onVideoClick: (
    videoId: number,
    chapterIndex: number,
    lessonIndex: number,
    lessonId: number
  ) => void;
  onTestClick: (
    testId: number,
    chapterIndex: number,
    lessonIndex: number,
    lessonId: number
  ) => void;
}
export const CourseSideBarComponent: React.FC<CourseSideBarComponentProps> = ({
  isSidebarOpen,
  accountId,
  openChapters,
  openLessons,
  setOpenChapters,
  setOpenLessons,
  toggleChapter,
  toggleLesson,
  courseData,
  progressData,
  onVideoClick,
  onTestClick,
}) => {
  // const [progressData, setProgressData] = useState<Progress[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const refresh = useRefreshToken();

  const handleChapterTestClick = (testId: number) => {
    const encryptedTestChapterId = encryptData(testId.toString());
    localStorage.setItem("encryptedTestChapterId", encryptedTestChapterId);
    localStorage.removeItem("encryptedVideoId");
    localStorage.removeItem("encryptedTestId");
    window.location.href = `/khoa-hoc/vao-hoc/test-chapter`;
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

  
  return (
    <div className={`col-md-3 course-sidebar ${isSidebarOpen ? "open" : ""}`}>
      <div className="course-sidebar__content">
        {courseData &&
          courseData.chapters.map((chapter, chapterIndex) => (
            <div key={chapter.chapter_id} className="chapter-container">
              <div
                className={`chapter-header ${
                  openChapters[chapterIndex] ? "active" : ""
                }`}
                onClick={() => toggleChapter(chapterIndex)}
              >
                <div className="chapter-header__content">
                  <h3 className="chapter-title">{chapter.chapter_title}</h3>
                </div>
                <i
                  className={`fas ${
                    openChapters[chapterIndex]
                      ? "fa-chevron-down"
                      : "fa-chevron-right"
                  }`}
                />
              </div>

              {openChapters[chapterIndex] && (
                <div className="chapter-content">
                  {chapter.lessons.map((lesson, lessonIndex) => (
                    <div key={lesson.lesson_id} className="lesson-container">
                      <div
                        className={`lesson-header ${
                          openLessons[chapterIndex]?.[lessonIndex]
                            ? "active"
                            : ""
                        }`}
                        onClick={() => toggleLesson(chapterIndex, lessonIndex)}
                      >
                        <div className="lesson-header__content">
                          <span className="lesson-number">
                            {lessonIndex + 1}
                          </span>
                          <h4 className="lesson-title">
                            {lesson.lesson_title}
                          </h4>
                        </div>
                        <i
                          className={`fas ${
                            openLessons[chapterIndex]?.[lessonIndex]
                              ? "fa-chevron-down"
                              : "fa-chevron-right"
                          }`}
                        />
                      </div>

                      {openLessons[chapterIndex]?.[lessonIndex] && (
                        <div className="lesson-content">
                          {lesson.video && (
                            <div
                              className={`content-item video-item ${
                                isVideoCompleted(
                                  chapter.chapter_id,
                                  lesson.lesson_id
                                )
                                  ? "completed"
                                  : "locked"
                              }`}
                              onClick={() => {
                                if (
                                  isVideoCompleted(
                                    chapter.chapter_id,
                                    lesson.lesson_id
                                  )
                                ) {
                                  onVideoClick(
                                    lesson.video!.video_id,
                                    chapterIndex,
                                    lessonIndex,
                                    lesson.lesson_id
                                  );
                                  const encryptedLessonId = encryptData(
                                    lesson.lesson_id.toString()
                                  );
                                  localStorage.setItem(
                                    "encryptedLessonId",
                                    encryptedLessonId
                                  );
                                  // sessionStorage.setItem('lessonId', lesson.lesson_id.toString());
                                }
                              }}
                            >
                              <div className="content-item__icon">
                                <i className="fas fa-play-circle"></i>
                              </div>
                              <div className="content-item__info">
                                <span className="content-title">
                                  {lesson.video.video_title}
                                </span>
                                <span className="content-duration">
                                  {lesson.lesson_duration} min
                                </span>
                              </div>
                              <div className="content-item__status">
                                {isVideoCompleted(
                                  chapter.chapter_id,
                                  lesson.lesson_id
                                ) ? (
                                  <i className="fas fa-check-circle"></i>
                                ) : (
                                  <i className="fas fa-lock"></i>
                                )}
                              </div>
                            </div>
                          )}

                          {lesson.lesson_test && (
                            <div
                              className={`content-item test-item ${
                                isTestCompleted(
                                  chapter.chapter_id,
                                  lesson.lesson_id
                                )
                                  ? "completed"
                                  : "locked"
                              }`}
                              onClick={() => {
                                if (
                                  isTestCompleted(
                                    chapter.chapter_id,
                                    lesson.lesson_id
                                  )
                                ) {
                                  onTestClick(
                                    lesson.lesson_test!.test_id,
                                    chapterIndex,
                                    lessonIndex,
                                    lesson.lesson_id
                                  );
                                  const encryptedLessonId = encryptData(
                                    lesson.lesson_id.toString()
                                  );
                                  localStorage.setItem(
                                    "encryptedLessonId",
                                    encryptedLessonId
                                  );
                                }
                              }}
                            >
                              <div className="content-item__icon">
                                <i className="fas fa-tasks"></i>
                              </div>
                              <div className="content-item__info">
                                <span className="content-title">
                                  {lesson.lesson_test.test_title}
                                </span>
                              </div>
                              <div className="content-item__status">
                                {isTestCompleted(
                                  chapter.chapter_id,
                                  lesson.lesson_id
                                ) ? (
                                  <i className="fas fa-check-circle"></i>
                                ) : (
                                  <i className="fas fa-lock"></i>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {chapter.chapter_test && (
                    <div
                      className={`content-item chapter-test-item ${
                        isTestChapterCompleted(chapter.chapter_id)
                          ? "completed"
                          : "locked"
                      }`}
                      onClick={() => {
                        if (isTestChapterCompleted(chapter.chapter_id)) {
                          const encryptedChapterId = encryptData(
                            chapter.chapter_id.toString()
                          );
                          localStorage.setItem(
                            "encryptedChapterId",
                            encryptedChapterId
                          );

                          handleChapterTestClick(chapter.chapter_test!.test_id);
                        }
                      }}
                    >
                      <div className="content-item__icon">
                        <i className="fas fa-clipboard-check"></i>
                      </div>
                      <div className="content-item__info">
                        <span className="content-title">Chapter Test</span>
                        <span className="test-name">
                          {chapter.chapter_test.test_title}
                        </span>
                      </div>
                      <div className="content-item__status">
                        {isTestChapterCompleted(chapter.chapter_id) ? (
                          <i className="fas fa-check-circle"></i>
                        ) : (
                          <i className="fas fa-lock"></i>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
