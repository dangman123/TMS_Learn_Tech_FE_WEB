import React, { useEffect, useState } from "react";
import axios from "axios";
import { ExamList as ExamListType, ApiResponse } from "../../model/ExamList";
import ExamList from "./Components/ContentExample";
import { GET_USER_EXAM } from "../../api/api";

function Exam() {
  const categoryId = localStorage.getItem("iddanhmucdethi");
  const [exams, setExams] = useState<ExamListType[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const examsPerPage = 12;

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const url = GET_USER_EXAM(currentPage, examsPerPage);
        const response = await axios.get<ApiResponse>(url);

        if (response.data && response.data.data) {
          setExams(response.data.data.content);
          setTotalPages(response.data.data.totalPages);
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
        setLoading(false);
      }
    };

    fetchExams();
  }, [categoryId, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <section className="exams-area pb-120" style={{ marginTop: "40px" }}>
      <div className="container" style={{ marginTop: "0px", padding: "0px" }}>
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12">
            <ExamList exams={exams} />
            {!loading && totalPages > 1 && (
              <div className="pegi justify-content-center mt-60">
                <a
                  href="#0"
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={`border-none ${
                    currentPage === 0 ? "disabled" : ""
                  }`}
                  aria-disabled={currentPage === 0}
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
                  className={`border-none ${
                    currentPage === totalPages - 1 ? "disabled" : ""
                  }`}
                  aria-disabled={currentPage === totalPages - 1}
                >
                  <i className="fa-regular fa-arrow-right primary-color transition"></i>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Exam;
