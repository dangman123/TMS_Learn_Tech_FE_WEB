import React from "react";
import "./style.css";

// Định nghĩa kiểu cho tài liệu
interface Document {
  document_id: number;
  document_title: string;
  document_image: string;
  document_url: string;
  download_count: number;
  create_date: string;
  view_count: number;
}

// Thêm kiểu cho props
interface ListSearchMainProps {
  documents: Document[];
}

const ListSearchMain: React.FC<ListSearchMainProps> = ({ documents }) => {
  return (
    <div id="listDocProductCat" className="row">
      <div className="layout-grid-4 list-search-main">
        {documents.map((doc) => (
          <div key={doc.document_id} className="card group space-y-3 flex flex-col">
            <div className="card overflow-hidden">
              <div className="item-card9-img">
                <div className="item-card9-imgs text-center">
                  <a href={doc.document_url}>
                    <img
                      height="100px"
                      src={doc.document_image}
                      alt={doc.document_title}
                      className="cover-image m-auto"
                    />
                  </a>
                </div>
              </div>
              <div className="card border-0 mb-0 shadow-0 noradius">
                <div className="card-body pl-2 pr-2 pt-2 pb-0">
                  <div className="item-card9">
                    <a href={doc.document_url} className="text-dark" title={doc.document_title}>
                      <p>{doc.document_title}</p>
                    </a>
                  </div>
                </div>
                <div
                  className="pl-2 pr-2 pt-0 pb-1 document-icon"
                  style={{ marginLeft: "20px", fontSize: "13px" }}
                >
                  <span className="text-muted">
                    <i className="fa fa-download mr-1"></i>Tải: {doc.download_count}
                  </span>
                  <span className="text-muted">
                    <i className="fa fa-eye mr-1"></i>Xem: {doc.view_count}
                  </span>
                </div>
              </div>
              <div className="card-footer p-lg-2">
                <div className="item-card9-footer d-flex">
                  <div className="ml-auto">
                    <a href={doc.document_url} className="btn btn-primary btn-sm">
                      Xem <i className="fa fa-arrow-right"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListSearchMain;
