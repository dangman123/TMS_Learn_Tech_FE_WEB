import React, { useEffect, useState, useMemo } from "react";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import DocumentHistoryNav from "./DocumentHistoryNav";

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

  // Hàm để hiển thị icon phù hợp với loại file
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return "fas fa-file-pdf";
      case "doc":
      case "docx":
        return "fas fa-file-word";
      case "xls":
      case "xlsx":
        return "fas fa-file-excel";
      case "ppt":
      case "pptx":
        return "fas fa-file-powerpoint";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "fas fa-file-image";
      default:
        return "fas fa-file";
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
    <div id="historyDocument">
      <hr />
      <DocumentHistoryNav
        onSearch={setSearchKeyword}
        size={size}
        setSize={handleSizeChange}
        onFilterByTime={setFilterByTime}
      />
      <hr />

      <div className="table-responsive test-history-user">
        <table className="table table-striped table-sm">
          <thead>
            <tr>
              <th scope="col" className="col-stt">
                STT
              </th>
              <th scope="col" className="col-ten-tai-lieu">
                Tên tài liệu
              </th>
              <th scope="col" className="col-loai">
                Loại
              </th>
              <th scope="col" className="col-kich-thuoc">
                Kích thước
              </th>
              <th scope="col" className="col-thoi-gian">
                Thời gian tải
              </th>
              <th scope="col" className="col-tai-lai">
                Tải lại
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredResults.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : (
              filteredResults.map((doc, index) => (
                <tr key={doc.id}>
                  <th scope="row">{index + 1 + page * size}</th>
                  <td>{doc.documentName}</td>
                  <td>
                    <i className={getFileIcon(doc.fileType)}></i>{" "}
                    {doc.fileType.toUpperCase()}
                  </td>
                  <td>{formatFileSize(doc.fileSize)}</td>
                  <td>{new Date(doc.downloadedAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-link text-primary"
                      onClick={() => handleRedownload(doc.documentId)}
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
};

export default DocumentHistory;
