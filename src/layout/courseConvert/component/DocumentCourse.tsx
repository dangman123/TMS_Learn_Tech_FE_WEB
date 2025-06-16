import React, { useEffect, useState } from "react";
import { isTokenExpired } from "../../util/fucntion/auth";
import useRefreshToken from "../../util/fucntion/useRefreshToken";
import { decryptData } from "../../util/encryption";
import { ToastContainer, toast } from "react-toastify";
// import "./DocumentCourse.css";

// Document item interface
interface DocumentItem {
  videoId: number;
  videoTitle: string;
  documentUrl: string;
  lessonId: number;
  lessonTitle: string;
}

// Custom CSS for the document list
const documentStyles = `
  .document-list-container {
    padding: 20px 0;
  }
  
  .document-list-title {
    font-size: 24px;
    font-weight: 600;
    color: #344767;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .document-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .document-item {
    background-color: #f8f9fa;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 80px;
  }
  
  .document-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    border-color: #d0e1ff;
  }
  
  .document-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin-right: 15px;
  }
  
  .document-title {
    font-size: 16px;
    font-weight: 600;
    color: #344767;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
    height: 45px;
  }
  
  .document-lesson {
    font-size: 14px;
    color: #6c757d;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.4;
    font-weight: normal;
    max-width: 100%;
    margin-bottom: 0;
  }
  
  .document-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 15px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    height: 36px;
    min-width: 120px;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .document-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(78, 115, 223, 0.2);
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
  }
  
  .loading-spinner {
    border: 4px solid rgba(78, 115, 223, 0.1);
    border-radius: 50%;
    border-top: 4px solid #4e73df;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .no-documents {
    text-align: center;
    padding: 30px 0;
    color: #6c757d;
  }
  
  .no-documents svg {
    margin-bottom: 15px;
    color: #adb5bd;
  }
  
  @media (max-width: 768px) {
    .document-list-title {
      font-size: 20px;
    }
    
    .document-title {
      font-size: 15px;
    }
    
    .document-lesson {
      font-size: 13px;
    }
    
    .document-button {
      font-size: 13px;
      padding: 7px 12px;
    }
  }
`;

const DocumentCourse: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useRefreshToken();

  // Add custom styles to document head when component mounts
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = documentStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get course ID from localStorage
        const storedEncryptedCourseId = localStorage.getItem("encryptedCourseId");
        if (!storedEncryptedCourseId) {
          setError("Không tìm thấy thông tin khóa học");
          setIsLoading(false);
          return;
        }
        
        const courseId = decryptData(storedEncryptedCourseId);
        
        // Get auth token
        let token = localStorage.getItem("authToken");
        if (isTokenExpired(token)) {
          token = await refresh();
          if (!token) {
            window.location.href = "/dang-nhap";
            return;
          }
          localStorage.setItem("authToken", token);
        }
        
        // Fetch documents
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_HOST}/api/videos/by-course-video/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch documents. Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 200 && result.data) {
          setDocuments(result.data);
        } else {
          setError(result.message || "Không thể tải danh sách tài liệu");
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        setError("Đã xảy ra lỗi khi tải danh sách tài liệu");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocuments();
  }, []);

  const handleDownload = (documentUrl: string, title: string) => {
    if (!documentUrl) {
      toast.error("Không tìm thấy đường dẫn tài liệu");
      return;
    }
    
    // Open document in new tab
    window.open(documentUrl, "_blank");
  };

  return (
    <div className="document-list-container">
      <h2 className="document-list-title">Tài liệu khóa học</h2>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: "15px", color: "#555" }}>Đang tải danh sách tài liệu...</p>
        </div>
      ) : error ? (
        <div className="no-documents">
            
          <p>{error}</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="no-documents">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/>
            <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
          </svg>
          <p>Không có tài liệu nào cho khóa học này</p>
        </div>
      ) : (
        <ul className="document-list">
          {documents.map((doc) => (
            <li key={doc.videoId} className="document-item">
              <div className="document-content">
                <span className="document-lesson">{doc.lessonTitle}</span>
              </div>
              <button 
                className="document-button"
                onClick={() => handleDownload(doc.documentUrl, doc.videoTitle)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                Xem tài liệu
              </button>
            </li>
          ))}
        </ul>
      )}
      
      <ToastContainer />
    </div>
  );
};

export default DocumentCourse;
