import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify và toast
import "react-toastify/dist/ReactToastify.css";
import { getDocument, GlobalWorkerOptions, PDFWorker } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";
import "./documentdetai.css";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { isTokenExpired } from "../../../util/fucntion/auth";
import DocumentSlide from "../../../util/SlideDocument";
// Set the PDF.js worker
GlobalWorkerOptions.workerSrc = pdfWorker;

interface ContentDocumentDetailProps {
  document: {
    id: number;
    createdAt: string;
    description: string;
    thumbnailUrl: string;
    title: string;
    updatedAt: string;
    url: string;
    views: number;
    id_category: number;
  };
}

const ContentDocumentDetail: React.FC<ContentDocumentDetailProps> = ({
  document,
}) => {
  const [pdf, setPdf] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [pdfRendering, setPdfRendering] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [fileFormat, setFileFormat] = useState<string>("");
  const [downloadsRemaining, setDownloadsRemaining] = useState<number>(3);
  const refresh = useRefreshToken();
  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };
  const user = getUserData();
  const isLoggedIn = !!localStorage.getItem("authToken");

  const getFileExtension = (url: string) => {
    try {
      if (!url) return "";
      const extension = url.split('.').pop()?.split('?')[0] || "";
      return extension.toUpperCase();
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (document.url) {
      const extension = getFileExtension(document.url);
      setFileFormat(extension);
      setLoading(false);
    }
    
    // Check remaining downloads for non-logged in users
    if (!isLoggedIn) {
      const downloadsKey = "anonymous_download_count";
      const currentDownloads = parseInt(localStorage.getItem(downloadsKey) || "0", 10);
      setDownloadsRemaining(Math.max(0, 3 - currentDownloads));
    }
  }, [document.url, isLoggedIn]);

  const downloadBlob = async (url: string, fileName: string, id: number) => {
    let token = localStorage.getItem("authToken");
    
    // For non-logged in users, implement download limit
    if (!token) {
      // Get current download count from localStorage
      const downloadsKey = "anonymous_download_count";
      const currentDownloads = parseInt(localStorage.getItem(downloadsKey) || "0", 10);
      
      // Check if user has reached download limit
      if (currentDownloads >= 3) {
        toast.error("Bạn đã sử dụng hết 3 lượt tải miễn phí. Vui lòng đăng nhập để tiếp tục!");
        return;
      }
      
      // Increment download count
      const newDownloadCount = currentDownloads + 1;
      localStorage.setItem(downloadsKey, newDownloadCount.toString());
      
      // Update the remaining downloads state
      setDownloadsRemaining(Math.max(0, 3 - newDownloadCount));
      
      // Show remaining downloads
      const remaining = 3 - newDownloadCount;
      if (remaining > 0) {
        toast.info(`Bạn còn ${remaining} lượt tải miễn phí!`);
      } else {
        toast.info("Đây là lượt tải miễn phí cuối cùng của bạn!");
      }
    }
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Lỗi tải tài liệu: ${response.statusText}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const anchor = window.document.createElement("a"); // Đảm bảo sử dụng `document` của DOM
      anchor.href = blobUrl;
      anchor.download = `${fileName}.${getFileExtension(url)}`;
      window.document.body.appendChild(anchor);
      anchor.click();
      window.document.body.removeChild(anchor);

      window.URL.revokeObjectURL(blobUrl);

      // Only save data for logged in users
      if (token) {
        saveData(id);
      } else {
        toast.success("Tải thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi tải tài liệu:", error);
      toast.error("Không thể tải tài liệu. Vui lòng thử lại sau!");
    }
  };

  const saveData = async (id: number) => {
    let token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Vui lòng đăng nhập tài khoản!");
      return;
    }

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }

    const payload = {
      accountId: user.id,
      generalDocumentId: id,
      dateDownload: new Date(), // Replace this with dynamic data if needed
    };
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/document-account/download`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        // const data = await response.json();
        toast.success("Tải thành công !");
      } else {
        console.error("Lỗi khi lưu thông tin tải xuống:", response.statusText);
        toast.error("Đã xảy ra lỗi khi lưu thông tin tải xuống!");
      }
    } catch (error) {
      console.error("Lỗi khi gửi thông tin tải xuống:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentPreview = () => {
    const format = fileFormat.toLowerCase();
    
    if (!document.url) {
      return (
        <div className="text-center my-4 p-4 border rounded">
          <p>Không có đường dẫn đến tài liệu</p>
        </div>
      );
    }

    if (format === 'pdf') {
      return (
        <iframe
          src={document.url}
          width="100%"
          height="800px"
          style={{ border: 'none' }}
          title={document.title}
        />
      );
    } else if (format === 'docx' || format === 'doc' || format === 'pptx' || format === 'ppt' || format === 'xlsx' || format === 'xls') {
      return (
        <div>
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`}
            width="100%"
            height="800px"
            style={{ border: 'none' }}
            title={document.title}
          />
          <div className="text-center my-3">
            <p>Nếu tài liệu không hiển thị, vui lòng tải xuống để xem</p>
          </div>
        </div>
      );
    } else if (format === 'jpg' || format === 'jpeg' || format === 'png' || format === 'gif') {
      return (
        <div className="text-center">
          <img 
            src={document.url} 
            alt={document.title}
            style={{ maxWidth: '100%', maxHeight: '800px' }}
          />
        </div>
      );
    } else {
      return (
        <div className="text-center my-4 p-4 border rounded">
          <div className="mb-3">
            <i className="fa fa-file-text-o fa-4x" aria-hidden="true"></i>
          </div>
          <h5 className="mb-3">Định dạng tài liệu: {fileFormat}</h5>
          <p>Không thể hiển thị xem trước cho định dạng này.</p>
          <p>Vui lòng tải xuống tài liệu để xem chi tiết.</p>
        </div>
      );
    }
  };

  return (
    <div className="col-xl-9 col-lg-8 col-md-12 mb-3 bg-white p-5">
      <h3 className="title">{document.title}</h3>
      <p>
        Ngày đăng:{" "}
        <span>{new Date(document.createdAt).toLocaleDateString()}</span>
      </p>
      <span style={{ marginBottom: "30px", display: "block" }}>
        {document.title}.{fileFormat}
      </span>

      <div className="d-flex align-items-center gap-3 mb-3">
        <button
          className="btn btn-secondary"
          onClick={() => downloadBlob(document.url, document.title, document.id)}
          disabled={!isLoggedIn && downloadsRemaining <= 0}
        >
          Tải xuống
        </button>
        
        {!isLoggedIn && (
          <div className="download-limit-info">
            {downloadsRemaining > 0 ? (
              <span className="text-info">Bạn còn {downloadsRemaining} lượt tải miễn phí</span>
            ) : (
              <span className="text-danger">Bạn đã hết lượt tải miễn phí</span>
            )}
            <div>
              <a href="/dang-nhap" className="btn btn-link p-0">Đăng nhập</a> để tải không giới hạn
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center my-4">Đang tải thông tin tài liệu...</div>
      ) : (
        <div className="document-preview-container my-4">
          {renderDocumentPreview()}
        </div>
      )}

      <div className="my-4" id="fulltext-content">
        <p className="heading">THÔNG TIN TÀI LIỆU</p>
        <div className="card space-y-4">
          <div className="py-3 rounded-md border">
            <p>
              Ngày đăng: {new Date(document.createdAt).toLocaleDateString()}
            </p>
            <p className="list p-0">Mô tả: {document.description}</p>
            <p>Lượt xem: {document.views}</p>
            <p>Định dạng: {fileFormat}</p>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ContentDocumentDetail;
