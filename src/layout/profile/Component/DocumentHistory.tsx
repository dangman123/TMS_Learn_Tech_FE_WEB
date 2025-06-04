import React, { useEffect, useMemo, useState } from "react";
import "../style.css";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../util/fucntion/auth";
import { DocumentHistoryNav } from "./ComponentDocument/DocumentHistoryNav";
import styles from "./testHistory.module.css"; // Use the same styles as TestHistory

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
    <>
      <DocumentHistoryNav
        onSearch={setSearchKeyword}
        size={size}
        setSize={handleSizeChange}
        onFilterByTime={setFilterByTime}
      />
      <hr />
      <div className={styles.tableContainer}>
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th className={styles.columnStt}>STT</th>
              <th>Tên tài liệu</th>
              <th className={styles.columnTime}>Thời gian tải</th>
              <th className={styles.columnDownload}>Tải lại</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>
                  <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <span className={styles.loadingText}>
                      Đang tải dữ liệu...
                    </span>
                  </div>
                </td>
              </tr>
            ) : filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className={styles.noDataContainer}>
                    <i className={`fas fa-inbox ${styles.noDataIcon}`}></i>
                    <p className={styles.noDataText}>Không có dữ liệu</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredDocuments.map((document, index) => (
                <tr key={document.documentId}>
                  <td className={styles.columnStt}>{index + 1 + page * size}</td>
                  <td 
                    className={styles.documentTitle} 
                    onClick={() => clickNavigation(document.documentId)}
                  >
                    {document.title}
                  </td>
                  <td className={styles.columnTime}>
                    {new Date(document.dateDownload).toLocaleString()}
                  </td>
                  <td className={styles.columnDownload}>
                    <button
                      className={styles.downloadButton}
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
      {filteredDocuments.length > 0 && (
        <div className={styles.pagination}>
          <a
            href="#0"
            onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}
            className={`${styles.paginationItem} ${styles.paginationArrow} ${page === 0 ? styles.paginationArrowDisabled : ''}`}
          >
            <i className="fa-regular fa-arrow-left"></i>
          </a>
          {totalPages <= 7 ? (
            // Hiển thị tất cả trang khi có ít trang
            [...Array(totalPages)].map((_, index) => (
              <a
                key={index}
                href="#0"
                onClick={(e) => { e.preventDefault(); handlePageChange(index); }}
                className={`${styles.paginationItem} ${index === page ? styles.paginationItemActive : ''}`}
              >
                {index + 1}
              </a>
            ))
          ) : (
            // Logic phân trang cho nhiều trang
            <>
              {/* Luôn hiển thị trang đầu tiên */}
              <a
                href="#0"
                onClick={(e) => { e.preventDefault(); handlePageChange(0); }}
                className={`${styles.paginationItem} ${0 === page ? styles.paginationItemActive : ''}`}
              >
                1
              </a>

              {/* Hiển thị dấu "..." nếu trang hiện tại > 3 */}
              {page > 3 && (
                <span className={styles.paginationItem}>...</span>
              )}

              {/* Hiển thị các trang xung quanh trang hiện tại */}
              {[...Array(totalPages)].map((_, index) => {
                if (
                  (index > 0 && index < totalPages - 1) && // Không phải trang đầu hoặc cuối
                  (index >= page - 1 && index <= page + 1) // Trong phạm vi hiển thị
                ) {
                  return (
                    <a
                      key={index}
                      href="#0"
                      onClick={(e) => { e.preventDefault(); handlePageChange(index); }}
                      className={`${styles.paginationItem} ${index === page ? styles.paginationItemActive : ''}`}
                    >
                      {index + 1}
                    </a>
                  );
                }
                return null;
              })}

              {/* Hiển thị dấu "..." nếu trang hiện tại < totalPages - 4 */}
              {page < totalPages - 4 && (
                <span className={styles.paginationItem}>...</span>
              )}

              {/* Luôn hiển thị trang cuối cùng */}
              <a
                href="#0"
                onClick={(e) => { e.preventDefault(); handlePageChange(totalPages - 1); }}
                className={`${styles.paginationItem} ${totalPages - 1 === page ? styles.paginationItemActive : ''}`}
              >
                {totalPages}
              </a>
            </>
          )}
          <a
            href="#0"
            onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }}
            className={`${styles.paginationItem} ${styles.paginationArrow} ${page === totalPages - 1 ? styles.paginationArrowDisabled : ''}`}
          >
            <i className="fa-regular fa-arrow-right"></i>
          </a>
        </div>
      )}
    </>
  );
}

export default DocumentHistory;
