import React, { useEffect, useState, useMemo } from "react";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import DocumentHistoryNav from "./DocumentHistoryNav";
import styles from "./documentHistory.module.css";

interface DocumentDownload {
  id: number;
  documentId: number;
  accountId: number;
  documentName: string;
  downloadedAt: string;
  fileType: string;
  fileSize: string;
}

const DocumentHistory: React.FC = () => {
  const [documentHistory, setDocumentHistory] = useState<DocumentDownload[]>(
    []
  );
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

  // Fetch Document Download History
  const fetchDocumentHistory = async () => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/document-downloads/history?page=${page}&size=${size}&accountId=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setDocumentHistory(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching document download history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentHistory();
  }, [page, size]);

  // Kết hợp cả `filterByTime` và `searchKeyword`
  const filteredResults = useMemo(() => {
    let filtered = documentHistory;

    // Lọc theo thời gian
    const now = new Date();
    if (filterByTime === "today") {
      filtered = filtered.filter((result) => {
        const downloadDate = new Date(result.downloadedAt);
        return downloadDate.toDateString() === now.toDateString();
      });
    } else if (filterByTime === "lastday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      filtered = filtered.filter((result) => {
        const downloadDate = new Date(result.downloadedAt);
        return downloadDate.toDateString() === yesterday.toDateString();
      });
    } else if (filterByTime === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      filtered = filtered.filter((result) => {
        const downloadDate = new Date(result.downloadedAt);
        return downloadDate >= oneWeekAgo && downloadDate <= now;
      });
    } else if (filterByTime === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      filtered = filtered.filter((result) => {
        const downloadDate = new Date(result.downloadedAt);
        return downloadDate >= oneMonthAgo && downloadDate <= now;
      });
    } else if (filterByTime === "year") {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      filtered = filtered.filter((result) => {
        const downloadDate = new Date(result.downloadedAt);
        return downloadDate >= oneYearAgo && downloadDate <= now;
      });
    }

    // Lọc theo từ khóa
    if (searchKeyword.trim()) {
      filtered = filtered.filter((result) =>
        result.documentName.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    return filtered;
  }, [filterByTime, searchKeyword, documentHistory]);

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  // Hàm để định dạng kích thước file
  const formatFileSize = (size: string) => {
    const sizeNumber = parseFloat(size);
    if (sizeNumber < 1024) {
      return `${sizeNumber} B`;
    } else if (sizeNumber < 1024 * 1024) {
      return `${(sizeNumber / 1024).toFixed(2)} KB`;
    } else {
      return `${(sizeNumber / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  // Hàm để hiển thị icon và css class phù hợp với loại file
  const getFileIconAndClass = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return { icon: "fas fa-file-pdf", className: styles.pdfIcon };
      case "doc":
      case "docx":
        return { icon: "fas fa-file-word", className: styles.wordIcon };
      case "xls":
      case "xlsx":
        return { icon: "fas fa-file-excel", className: styles.excelIcon };
      case "ppt":
      case "pptx":
        return { icon: "fas fa-file-powerpoint", className: styles.pptIcon };
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return { icon: "fas fa-file-image", className: styles.imageIcon };
      default:
        return { icon: "fas fa-file", className: styles.genericFileIcon };
    }
  };

  // Hàm tải lại tài liệu
  const handleRedownload = async (documentId: number) => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/documents/download/${documentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const fileInfo = documentHistory.find(
        (doc) => doc.documentId === documentId
      );
      const fileName = fileInfo
        ? fileInfo.documentName
        : `document-${documentId}`;

      // Tạo URL và tải xuống
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Không thể tải xuống tài liệu. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className={styles.historyDocumentContainer}>
      <h2 className={styles.sectionTitle}>Lịch sử tài liệu đã tải</h2>
      <hr className={styles.separator} />
      
      <DocumentHistoryNav
        onSearch={setSearchKeyword}
        size={size}
        setSize={handleSizeChange}
        onFilterByTime={setFilterByTime}
      />
      
      <div className={styles.tableResponsive}>
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th className={styles.columnStt}>
                STT
              </th>
              <th className={styles.columnDocumentName}>
                Tên tài liệu
              </th>
              <th className={styles.columnType}>
                Loại
              </th>
              <th className={styles.columnSize}>
                Kích thước
              </th>
              <th className={styles.columnTime}>
                Thời gian tải
              </th>
              <th className={styles.columnRedownload}>
                Tải lại
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className={styles.loadingMessage}>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredResults.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyMessage}>
                  <i className="fas fa-info-circle me-2"></i>
                  Không có dữ liệu phù hợp với điều kiện tìm kiếm.
                </td>
              </tr>
            ) : (
              filteredResults.map((doc, index) => {
                const { icon, className } = getFileIconAndClass(doc.fileType);
                return (
                  <tr key={doc.id}>
                    <th scope="row">{index + 1 + page * size}</th>
                    <td>{doc.documentName}</td>
                    <td>
                      <i className={`${icon} ${styles.fileIcon} ${className}`}></i>
                      {doc.fileType.toUpperCase()}
                    </td>
                    <td>{formatFileSize(doc.fileSize)}</td>
                    <td>{new Date(doc.downloadedAt).toLocaleString()}</td>
                    <td>
                      <button
                        className={styles.downloadButton}
                        onClick={() => handleRedownload(doc.documentId)}
                        title="Tải lại tài liệu"
                      >
                        <i className="fas fa-download"></i>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {filteredResults.length > 0 && (
        <div className={styles.pagination}>
          <a
            href="#0"
            onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }}
            className={`${styles.paginationItem} ${styles.paginationArrow} ${page === 0 ? styles.paginationArrowDisabled : ''}`}
          >
            <i className="fa-regular fa-arrow-left"></i>
          </a>
          {totalPages <= 7 ? (
            // Hiển thị tất cả trang khi có ít hơn 7 trang
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
    </div>
  );
};

export default DocumentHistory;
