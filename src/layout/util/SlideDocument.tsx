import React, { useEffect, useState } from "react";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/autoplay";
import { DocumentModel } from "../../model/DocumentModel";
import axios from "axios";

export const GET_USER_DOCUMENT_TOP6 =
  `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/view_desc/top6`;
type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

const DocumentSlide: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentModel[]>([]);

  useEffect(() => {
    axios
      .get(GET_USER_DOCUMENT_TOP6)
      .then((response) => {
        setDocuments(response.data);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }, []);

  const [categories, setCategories] = useState<Category[]>([]);
  const handleDocumentClick = async (docId: any, idDanhMuc: any) => {
    categories.forEach((categorie) => {
      if (categorie.id === idDanhMuc) {
        localStorage.setItem(
          "danhmuctailieu",
          removeVietnameseTones(categorie.name)
        );
      }
    });

    try {
      // Gửi yêu cầu POST để tăng số lượt xem tài liệu
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/general_documents/${docId}/increment-view`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentId: docId,
          }),
        }
      );

      if (response.ok) {
        let danhmuctailieu = localStorage.getItem("danhmuctailieu");
        // Nếu cập nhật thành công, chuyển hướng đến trang chi tiết tài liệu
        window.location.href = `/tai-lieu/${danhmuctailieu}/${docId}`;
      } else {
        console.error("Failed to increment view count");
      }
    } catch (error) {
      console.error("Error incrementing view count", error);
    }
  };
  const removeVietnameseTones = (str: any) => {
    return str
      .normalize("NFD") // Chuyển đổi ký tự Unicode
      .replace(/[\u0300-\u036f]/g, "") // Loại bỏ dấu
      .replace(/đ/g, "d") // Thay thế chữ đ thường
      .replace(/Đ/g, "D") // Thay thế chữ Đ hoa
      .replace(/[^a-zA-Z0-9\s]/g, "") // Loại bỏ ký tự đặc biệt
      .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
      .toLowerCase(); // Chuyển tất cả thành chữ thường
  };
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}/categories-all`
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);
  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar, A11y]}
      spaceBetween={50}
      slidesPerView={3}
      navigation
      pagination={{ clickable: true }}
      scrollbar={{ draggable: true }}
      loop={true}
      // @ts-ignore
      onSwiper={(swiper: typeof Swiper) => console.log(swiper)}
      onSlideChange={() => console.log("slide change")}
      breakpoints={{
        // when window width is <= 768px
        1: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 1,
        },
        // when window width is <= 1024px
        1024: {
          slidesPerView: 3,
        },
      }}
    >
      {documents.map((document) => (
        <SwiperSlide>
          <div className="swiper-slide">
            <div className="testimonial-two__item">
              <div className="card overflow-hidden">
                <div className="item-card9-img">
                  <div className="item-card9-imgs text-center">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault(); // Ngăn điều hướng mặc định
                        handleDocumentClick(
                          document.documentId,
                          document.id_category
                        );
                      }}
                    ></a>
                    <img
                      height="100px"
                      src={document.image_url}
                      alt={document.documentTitle}
                      className="cover-image m-auto"
                    />
                  </div>
                </div>
                <div className="card border-0 mb-3 shadow-0 noradius">
                  <div className="card-body pt-4 pb-4">
                    <div className="item-card9">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault(); // Ngăn điều hướng mặc định
                          handleDocumentClick(
                            document.documentId,
                            document.id_category
                          );
                        }}
                      >
                        <p>{document.documentTitle}</p>
                      </a>
                    </div>
                  </div>
                  <div className="pl-2 pr-2 pt-0 pb-1 document-icon">
                    <span className="text-muted">
                      <i className="fa fa-download mr-1"></i>Lượt tải:
                      {document.download_count}
                    </span>
                    <span className="text-muted">
                      <i className="fa fa-eye mr-1"></i>Lượt xem:{" "}
                      {document.view}
                    </span>
                  </div>
                </div>
                <div className="card-footer p-lg-2">
                  <div className="item-card9-footer d-flex">
                    <div className="ml-auto">
                      <a
                        href="#"
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.preventDefault(); // Ngăn điều hướng mặc định
                          handleDocumentClick(
                            document.documentId,
                            document.id_category
                          );
                        }}
                      >
                        Xem <i className="fa fa-arrow-right"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default DocumentSlide;
