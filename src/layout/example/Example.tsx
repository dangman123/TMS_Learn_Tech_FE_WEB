import React, { useState } from "react";
import NavExample from "./Components/NavExample";
import ContentExample from "./Components/ContentExample";
import { useNavigate } from "react-router-dom";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../util/fucntion/auth";

function Example() {
  const [selectedCourse, setSelectedCourse] = useState<string>(""); // Default value for selected course
  const [count, setCount] = useState<number>(0);
  const [tests, setTests] = useState<any[]>([]);
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const fetchTestsByCourseID = async (courseId: string) => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        navigate("/dang-nhap");
        return;
      }
      localStorage.setItem("authToken", token);
    }
    localStorage.setItem("courseId-exam", courseId);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/tests/by-course?courseId=${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setTests(data.content);
    } catch (error) {
      console.error("Error fetching tests:", error);
    }
  };
  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    fetchTestsByCourseID(courseId); // Fetch tests when course is selected
  };
  const handleAddClick = () => {
    setCount(count + 1); // For example, incrementing the count
  };
  return (
    <section
      className="main-content main-margin"
      style={{ height: "auto !important", marginTop: "10px" }}
    >
      <div className="container" style={{ height: "auto !important" }}>
        <div className="row" style={{ height: "auto !important" }}>
          <p> fsdfsaf</p>
          <NavExample
            selectedCourse={selectedCourse}
            onCourseChange={handleCourseChange}
            onAddClick={handleAddClick}
          />
          <ContentExample tests={tests} />
        </div>
      </div>
    </section>
  );
}

export default Example;
