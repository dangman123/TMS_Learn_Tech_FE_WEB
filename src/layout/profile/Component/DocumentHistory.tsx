import React, { useEffect, useMemo, useState } from "react";
import "../style.css";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../util/fucntion/auth";
import { DocumentHistoryNav } from "./ComponentDocument/DocumentHistoryNav";
export interface Document {
  documentId: number;
  title: string;
  dateDownload: string;
  url: string;
}
function DocumentHistory() {
  const [documents, setDocuments] = useState<Document[]>([]); // Dữ liệu gốc
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [size, setSize] = useState(10);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterByTime, setFilterByTime] = useState("year");

  const refresh = useRefreshToken();
  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };
  const user = getUserData();

  const fetchDocuments = async () => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/account/view-list?accountId=${user.id}&page=${page}&size=${size}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.content || []);
        setTotalPages(data.totalPages || 0);
      } else {
        console.error("Failed to fetch documents:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, size]);

  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Lọc theo thời gian
    const now = new Date();
    if (filterByTime === "today") {
      filtered = filtered.filter((doc) => {
        const downloadDate = new Date(doc.dateDownload);
        return downloadDate.toDateString() === now.toDateString();
      });
    } else if (filterByTime === "lastday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      filtered = filtered.filter((doc) => {
        const downloadDate = new Date(doc.dateDownload);
        return downloadDate.toDateString() === yesterday.toDateString();
      });
    } else if (filterByTime === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter((doc) => {
        const downloadDate = new Date(doc.dateDownload);
        return downloadDate >= oneWeekAgo && downloadDate <= now;
      });
    } else if (filterByTime === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filtered = filtered.filter((doc) => {
        const downloadDate = new Date(doc.dateDownload);
        return downloadDate >= oneMonthAgo && downloadDate <= now;
      });
    } else if (filterByTime === "year") {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      filtered = filtered.filter((doc) => {
        const downloadDate = new Date(doc.dateDownload);
        return downloadDate >= oneYearAgo && downloadDate <= now;
      });
    }

    // Lọc theo từ khóa
    if (searchKeyword.trim()) {
      filtered = filtered.filter((doc) =>
        doc.title.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    return filtered;
  }, [filterByTime, searchKeyword, documents]);

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0); // Reset về trang đầu tiên
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const clickNavigation = (id: number) => {
    window.location.href = `/tai-lieu/tai-lieu-chi-tiet/${id}`;
  };

  const handleDownload = (url: string) => {
    window.open(url, "_blank");
  };
  return (
    <div id="historyDocument" className="col-md-9 ml-sm-9 col-lg-10 px-md-4">
      <DocumentHistoryNav
        onSearch={setSearchKeyword}
        size={size}
        setSize={handleSizeChange}
        onFilterByTime={setFilterByTime}
      />
      <hr />
      <div className="table-responsive test-history-user">
        <table className="table-document table-striped table-sm">
          <thead>
            <tr>
              <th scope="col" className="col-stt document text-center">
                STT
              </th>
              <th scope="col" className="col-ten-bai-kiem-tra text-center">
                Tên tài liệu
              </th>
              <th scope="col" className="col-diem text-center time-download">
                Thời gian tải
              </th>
              <th scope="col" className="col-diem text-center re-download">
                Tải lại
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : (
              filteredDocuments.map((document, index) => (
                <tr key={document.documentId}>
                  <th className="text-center" scope="row">
                    {index + 1 + page * size}
                  </th>
                  <td onClick={() => clickNavigation(document.documentId)}>
                    {document.title}
                  </td>

                  <td className="text-center">
                    {new Date(document.dateDownload).toLocaleString()}
                  </td>
                  <td className="text-center">
                    <button
                      className="btn btn-link"
                      onClick={() => handleDownload(document.url)}
                    >
                      <i className="fas fa-download"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="pegi justify-content-center mt-60">
        <a
          href="#0"
          onClick={() => handlePageChange(page - 1)}
          className={`border-none ${page === 0 ? "disabled" : ""}`}
        >
          <i className="fa-regular fa-arrow-left primary-color transition"></i>
        </a>
        {[...Array(totalPages)].map((_, index) => (
          <a
            key={index}
            href="#0"
            onClick={() => handlePageChange(index)}
            className={index === page ? "active" : ""}
          >
            {index + 1}
          </a>
        ))}
        <a
          href="#0"
          onClick={() => handlePageChange(page + 1)}
          className={`border-none ${page === totalPages - 1 ? "disabled" : ""}`}
        >
          <i className="fa-regular fa-arrow-right primary-color transition"></i>
        </a>
      </div>
    </div>
  );
}

export default DocumentHistory;
