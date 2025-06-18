import React, { useEffect, useState } from 'react';

interface Progress {
  accountId: number;
  courseId: number;
  chapterId: number;
  lessonId: number | null;
  videoStatus: boolean;
  testStatus: boolean;
  testScore: number | null;
  chapterTest: boolean;
}

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
  } | null;
}

interface CourseData {
  course_id: number;
  course_title: string;
  chapters: Chapter[];
}

interface CourseProgressProps {
  courseData: CourseData;
  progressData: Progress[];
}

const CourseProgress: React.FC<CourseProgressProps> = ({ courseData, progressData }) => {
  const [progressStats, setProgressStats] = useState({
    completedItems: 0,
    totalItems: 0,
    percentComplete: 0,
  });

  useEffect(() => {
    if (courseData && progressData) {
      calculateProgress();
    }
  }, [courseData, progressData]);

  const calculateProgress = () => {
    if (!courseData) return;

    let totalItems = 0;
    let completedItems = 0;

    // Count all videos and tests
    courseData.chapters.forEach(chapter => {
      // Count each lesson video
      chapter.lessons.forEach(lesson => {
        if (lesson.video) {
          totalItems++;
          // Check if video is completed
          const videoProgress = progressData.find(
            p => p.chapterId === chapter.chapter_id && 
                 p.lessonId === lesson.lesson_id && 
                 p.videoStatus
          );
          if (videoProgress) completedItems++;
        }

        // Count each lesson test
        if (lesson.lesson_test) {
          totalItems++;
          // Check if test is completed
          const testProgress = progressData.find(
            p => p.chapterId === chapter.chapter_id && 
                 p.lessonId === lesson.lesson_id && 
                 p.testStatus
          );
          if (testProgress) completedItems++;
        }
      });

      // Count chapter test if it exists
      if (chapter.chapter_test) {
        totalItems++;
        // Check if chapter test is completed
        const chapterTestProgress = progressData.find(
          p => p.chapterId === chapter.chapter_id && 
               p.chapterTest
        );
        if (chapterTestProgress) completedItems++;
      }
    });

    const percentComplete = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    setProgressStats({
      completedItems,
      totalItems,
      percentComplete,
    });
  };

  return (
    <div className="course-progress-timeline">
      <h3 className="progress-title">Tiến trình học tập</h3>
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${progressStats.percentComplete}%` }}
        ></div>
      </div>
      <div className="progress-stats">
        <span>{progressStats.percentComplete}% hoàn thành</span>
        <span>{progressStats.completedItems}/{progressStats.totalItems} hoạt động</span>
      </div>
      
      <div className="progress-legend">
        <div className="legend-item">
          <span className="status-indicator status-completed"></span>
          <span>Đã hoàn thành</span>
        </div>
        <div className="legend-item">
          <span className="status-indicator status-progress"></span>
          <span>Đang học</span>
        </div>
        <div className="legend-item">
          <span className="status-indicator status-locked"></span>
          <span>Chưa mở khóa</span>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress; 