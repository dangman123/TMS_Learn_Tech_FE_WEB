import React from "react";

interface FilterProps {
  courses: { id: string; title: string }[];
  onCourseSelect: (courseId: string) => void;
}

const CourseFilter: React.FC<FilterProps> = ({ courses, onCourseSelect }) => {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label htmlFor="courseFilter">Lọc theo khóa học:</label>
      <select
        id="courseFilter"
        onChange={(e) => onCourseSelect(e.target.value)}
        style={{ marginLeft: "10px", padding: "5px" }}
      >
        <option value="">Tất cả khóa học</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CourseFilter;
