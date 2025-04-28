import React, { useEffect, useState } from "react";
import Filter from "./Filter";
import Dashboard from "./Dashboard";
import TestList from "./TestList";
import Chart from "./Chart";
import CustomPieChart from "./CustomPieChart";
import "./ResultPage.module.css"; // Giữ nguyên file CSS của bạn
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";

export interface TestData {
  id: number;
  title: string;
  score: number;
  status: string;
  date: Date;
}

export interface TestResult {
  status: string;
  countTest: number;
}
export interface CourseData {
  id: number;
  duration: string;
  title: string;
  enrollment_date: string;
}

const ResultPage: React.FC = () => {
  const itemsPerPage = 5; // Số lượng bài kiểm tra hiển thị mỗi trang
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState<string>("0");
  const [averageScore, setAverageScore] = useState<string>("0");
  const [passRate, setPassRate] = useState<string>("0");
  const [tests, setTests] = useState<TestData[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const refresh = useRefreshToken();

  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };

  const user = getUserData();

  const fetchCourses = async () => {
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
      setCourses(data.content || []);
    } catch (error) {
      console.error("Error fetching test results:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
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
      // Fetch từng API song song
      const [progressRes, avgScoreRes, passRateRes, testsRes, testResultsRes] =
        await Promise.all([
          fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/progress/calculate?accountId=${user.id}&courseId=${selectedCourseId}`,
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
            `${process.env.REACT_APP_SERVER_HOST}/api/test-results/result/detail?accountId=${user.id}&courseId=${selectedCourseId}`,
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

      // Xử lý response
      if (progressRes.ok) setProgress(await progressRes.text());
      if (avgScoreRes.ok) setAverageScore(await avgScoreRes.text());
      if (passRateRes.ok) setPassRate(await passRateRes.text());
      if (testsRes.ok) {
        const data = await testsRes.json();
        setTests(
          data.map((test: any) => ({
            id: test[0],
            title: test[1],
            score: test[2],
            status: test[3],
            date: new Date(test[4]),
          }))
        );
      }
      if (testResultsRes.ok) {
        const data = await testResultsRes.json();
        setTestResults(
          data.map((result: any) => ({
            status: result[0],
            countTest: result[1],
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      setSelectedCourseId(courses[0].id.toString());
    }
  }, [courses]);

  useEffect(() => {
    fetchAllData();
  }, [selectedCourseId]);

  const totalPages = Math.ceil(tests.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTests = tests.slice(startIndex, endIndex);

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const chartData = paginatedTests.map((test) => ({
    name: test.title,
    score: test.score,
  }));
  const pieData = testResults.map((item) => ({
    name: item.status,
    value: item.countTest,
  }));
  return (
    <div className="result-page mt-20">
      <Filter
        courses={courses}
        onCourseSelect={handleCourseSelect}
        selectCourseID={selectedCourseId}
      />

      <Dashboard
        progress={progress}
        averageScore={averageScore}
        passRate={passRate}
      />
      <TestList tests={paginatedTests} />

      <div className="row">
        <div className="col-md-8">
          <div className="chart-container">
            <Chart data={chartData} />
          </div>

          <div className="pegi justify-content-center mt-60">
            <a
              href="#0"
              onClick={() => handlePageChange(currentPage - 1)}
              className={`border-none ${currentPage === 0 ? "disabled" : ""}`}
            >
              <i className="fa-regular fa-arrow-left primary-color transition"></i>
            </a>
            {[...Array(totalPages)].map((_, index) => (
              <a
                key={index}
                href="#0"
                onClick={() => handlePageChange(index)}
                className={index === currentPage ? "active" : ""}
              >
                {index + 1}
              </a>
            ))}
            <a
              href="#0"
              onClick={() => handlePageChange(currentPage + 1)}
              className={`border-none ${currentPage === totalPages - 1 ? "disabled" : ""
                }`}
            >
              <i className="fa-regular fa-arrow-right primary-color transition"></i>
            </a>
          </div>
        </div>

        <div className="col-md-4">
          <CustomPieChart data={pieData} />
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
