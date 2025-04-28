import React, { useEffect, useState } from "react";
import { TextField, IconButton, Badge, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import { useNavigate } from "react-router-dom";
import { authTokenLogin, isTokenExpired } from "../../util/fucntion/auth";
interface CourseUserProfile {
  id: number;
  image: string;
  title: string;
  duration: string;
  enrollment_date: string;
  status: boolean;
  isDeleted: boolean;
}
interface NavExampleProps {
  selectedCourse: string;
  onCourseChange: (courseId: string) => void;
  onAddClick: () => void;
} 
function NavExample({ selectedCourse, onCourseChange, onAddClick }: NavExampleProps) {
  const userId = JSON.parse(localStorage.getItem("authData") || "{}").id;
  const [filter, setFilter] = useState(selectedCourse);

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilter(event.target.value);
    onCourseChange(event.target.value); // Call onCourseChange when a course is selected
  };
  const [size] = useState(1000);
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const refresh = useRefreshToken(); 
  const refreshToken = localStorage.getItem("refreshToken");
  const [courses, setCourses] = useState<CourseUserProfile[]>([]);
  const [page, setPage] = useState<number>(0);
  
  const fetchCoursesWithPagination = async () => {
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/account/enrolled/${userId}?page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch paginated course data: ${response.status} ${response.statusText}`
        );
        return;
      }

      const data = await response.json();

      if (data && typeof data === "object") {
        setCourses(data.content);

      } else {
        console.error("Invalid data format received");
      }
    } catch (error) {
      console.error("Error fetching paginated course data:", error);
    }
  };


  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };


  const handleAddClick = () => {
    //Payment mua lượt làm bài thi
  };

  useEffect(() => {
    fetchCoursesWithPagination();
  }, [page]);

  return (
    <div className="col-md-12">
      <div className="list-subjects" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", overflowY: "auto" }}>
        <FormControl variant="outlined" style={{ marginRight: "16px", minWidth: 120 , marginBottom:"20px" }}>
          <InputLabel id="filter-label">Khóa học</InputLabel>
          <Select
            labelId="filter-label"
            value={filter}
            onChange={handleFilterChange}
            label="Filter"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton color="primary" onClick={handleAddClick}>
          <Badge badgeContent={count} color="secondary">
            <AddIcon />
          </Badge>
        </IconButton>
      </div>
    </div>
  );
}

export default NavExample;