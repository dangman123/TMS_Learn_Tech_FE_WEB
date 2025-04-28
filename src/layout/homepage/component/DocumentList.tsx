import React, { useEffect, useRef } from "react";
import { DocumentModel } from "../../../model/DocumentModel";
import "./scroll.css";
// Define the props interface with a type for the documents array
interface DocumentListProps {
  documents: DocumentModel[];
  title: String;
}

// Type the props in the functional component
const DocumentList: React.FC<DocumentListProps> = ({ documents, title }) => {
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const list = listRef.current;


    if (list) {
      let scrollAmount = 0;

      const interval = setInterval(() => {
        scrollAmount += 2; // Tốc độ cuộn
        list.scrollTo({
          top: scrollAmount,
          behavior: "smooth",
        });

        // Nếu cuộn hết danh sách, quay lại đầu
        if (scrollAmount >= list.scrollHeight - list.clientHeight) {
          scrollAmount = 0;
        }
      }, 100); // Thời gian giữa mỗi bước cuộn (ms)

      return () => clearInterval(interval); // Dọn dẹp khi component unmount
    }
  }, []);
  return (
    <div className="col-lg-4 col-md-12">
      <div className="mb-1">
        <div className="card-header border border-bottom-0 justify-content-md-between d-md-flex">
          <a className="text-light">
            <span className="card-title m-3">{title}</span>
          </a>
        </div>
        <div className="card-body border">
          <ul className="vertical-scroll listDoc" ref={listRef}>
            {documents.map((doc) => (
              <li key={doc.documentId} className="news-item">
                <table>
                  <tbody>
                    <tr>
                      <td className="news-item-td-homepage" style={{ width: "80px", height: "100px" }}>
                        <a href={doc.url}>
                          <img
                            height="100px"
                            width="80px"
                            src={doc.image_url}
                            alt={doc.documentTitle}
                            className="w-8 border"
                          />
                        </a>
                      </td>
                      <td className="news-item-td-homepage-font-size">
                        <div className="ml-4">
                          <a className="text-muted mr-4">
                            <i className="fa fa-eye mr-1"></i>{" "}
                            {doc.view.toLocaleString()}
                          </a>
                          <a>
                            <span className="text-muted">
                              <i
                                className="fa fa-download mr-1"
                                aria-hidden="true"
                              ></i>
                              {doc.download_count.toLocaleString()}
                            </span>
                          </a>
                          <p className="font-weight-bold">
                            <a href={doc.url}>{doc.documentTitle}</a>
                          </p>
                          <a href="#" className="btn-link">
                            Chi tiết
                          </a>
                          <span className="float-right font-weight-bold">
                            <a
                              href="javascript:void(0)"
                              id={`btnWishlist-${doc.documentId}`}
                              className="btn-wishlist-doc"
                            >
                              <i className="fa fa-heart-o"></i>
                            </a>
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;
