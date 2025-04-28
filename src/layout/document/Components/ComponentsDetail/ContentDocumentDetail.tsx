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
  const [pagesToRender, setPagesToRender] = useState<number>(3);
  const [clickCount, setClickCount] = useState<number>(0);
  const refresh = useRefreshToken();
  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  };
  const user = getUserData();

  const renderPdf = async (pagesLimit: number) => {
    setPdfRendering(true);
    const imagesList: string[] = [];
    const canvas = window.document.createElement("canvas");

    for (let i = 1; i <= Math.min(pdf.numPages, pagesLimit); i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const renderContext = {
        canvasContext: canvas.getContext("2d") as CanvasRenderingContext2D,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      const img = canvas.toDataURL("image/png"); // Render page to PNG
      imagesList.push(img);
    }

    setImages(imagesList); // Set rendered images to state
    setPdfRendering(false);
  };

  useEffect(() => {
    const loadPdf = async () => {
      try {
        if (document.url) {
          const loadingTask = getDocument(document.url); // Load the PDF document
          const loadedPdf = await loadingTask.promise; // Wait for the document to load
          setPdf(loadedPdf);
        }
      } catch (error) {
        toast.error("Lỗi tải tài liệu ! Xin vui lòng thử lại !");
      }
    };

    loadPdf();
  }, [document.url]);

  useEffect(() => {
    if (pdf) renderPdf(pagesToRender);
  }, [pdf, pagesToRender]);

  const loadMorePages = () => {
    setClickCount((prevCount) => prevCount + 1); // Tăng số lần nhấn

    if (clickCount >= 1) {
      // Nếu đã bấm 2 lần thì kiểm tra đăng nhập
      const isLoggedIn = Boolean(localStorage.getItem("authToken")); // Giả sử token lưu trong localStorage
      if (!isLoggedIn) {
        toast.error("Vui lòng đăng nhập để xem thêm tài liệu.");
        return;
      }
    }

    // Nếu đăng nhập hoặc mới bấm dưới 2 lần
    if (pdf && pagesToRender < pdf.numPages) {
      setPagesToRender((prev) => Math.min(prev + 3, pdf.numPages)); // Tăng thêm 3 trang
    }
  };
  const downloadBlob = async (url: string, fileName: string, id: number) => {
    let token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Vui lòng đăng nhập tài khoản !");
      return;
    }
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const anchor = window.document.createElement("a"); // Đảm bảo sử dụng `document` của DOM
    anchor.href = blobUrl;
    anchor.download = fileName;
    window.document.body.appendChild(anchor);
    anchor.click();
    window.document.body.removeChild(anchor);

    window.URL.revokeObjectURL(blobUrl);

    saveData(id);
  };

  const saveData = async (id: number) => {
    let token = localStorage.getItem("authToken");

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
        console.error("Failed to fetch documents:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
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
        {document.title}.pdf
      </span>
      <button
        className="btn btn-secondary"
        onClick={() => downloadBlob(document.url, document.title, document.id)}
      >
        Tải xuống
      </button>

      {images.map((image, idx) => (
        <div className="img-border-document" key={idx}>
          <img
            id="image-generated"
            src={image}
            alt={`PDF page ${idx + 1}`}
            style={{
              width: "100%",
              height: "100%",
              margin: "0",
              border: "none",
            }}
          />
        </div>
      ))}
      {/* Button to Load More Pages */}
      {pagesToRender < (pdf?.numPages || 0) && (
        <div className="d-flex justify-content-center mt-3">
          <button className="btn btn-primary" onClick={loadMorePages}>
            Xem thêm
          </button>
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
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ContentDocumentDetail;
