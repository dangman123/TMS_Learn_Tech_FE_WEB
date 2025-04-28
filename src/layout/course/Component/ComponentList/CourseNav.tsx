import React, { useEffect, useState } from "react";
import "./style.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper/modules";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/autoplay";
import { float } from "html2canvas/dist/types/css/property-descriptors/float";
import { Category } from "../../Courses";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../../../util/fucntion/auth";

interface CourseNavProps {
  level1CategoriesCourse: Category[]; // Truyền danh mục từ props
  level2CategoriesCourse: Category[]; // Truyền danh mục từ props
  level3CategoriesCourse: Category[]; // Truyền danh mục từ props
  categories: Category[]; // Truyền danh mục từ props

  onSearchChange: (query: string) => void;
}

interface Banner {
  id: number;
  name: string;
  link: string;
  type: string;
  imageUrl: string;
  title: string;
}

const removeVietnameseTones = (str: string): string => {
  return str
    .normalize("NFD") // Convert to Unicode Normalization Form D
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
    .replace(/đ/g, "d") // Replace 'đ' with 'd'
    .replace(/Đ/g, "D") // Replace 'Đ' with 'D'
    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .toLowerCase(); // Convert to lowercase
};

const CourseNav: React.FC<CourseNavProps> = ({
  level1CategoriesCourse,
  level2CategoriesCourse,
  level3CategoriesCourse,
  categories,
  onSearchChange,
}) => {
  const [bannerList, setBannerList] = useState<Banner[]>([]); // Declare state for bannerList

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  useEffect(() => {
    fetchBannerList();
  }, []);

  const fetchBannerList = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/banner-voucher/list`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch banner list");
      }
      const data = await response.json();
      setBannerList(data.content); // Use setBannerList to update state
    } catch (error) {
      console.error("Error fetching banner list:", error);
      throw error;
    }
  };

  const handleReloadDataCap1 = (category: Category) => {
    localStorage.setItem(
      "danhmuckhoahoc",
      removeVietnameseTones(category.name)
    );
    localStorage.setItem("danhmuckhoahocVN", category.name);
    localStorage.setItem("iddanhmuckhoahoccap1", category.id.toString());
    localStorage.removeItem("iddanhmuckhoahoccap2");
    window.location.href = "/khoa-hoc/" + removeVietnameseTones(category.name);
  };

  const handleReloadDataCap2 = (category: Category, subCategory: Category) => {
    localStorage.setItem(
      "danhmuckhoahoc",
      removeVietnameseTones(subCategory.name)
    );
    localStorage.setItem("danhmuckhoahocVN", subCategory.name);
    localStorage.setItem("iddanhmuckhoahoccap1", category.id.toString());
    localStorage.setItem("iddanhmuckhoahoccap2", subCategory.id.toString());
    window.location.href =
      "/khoa-hoc/" + removeVietnameseTones(subCategory.name);
  };

  return (
    <div>
      <div
        className="row"
        style={{ height: "300px", marginBottom: "30px", marginTop: "10px" }}
      >
        {/* Danh mục bên trái */}
        <div
          className="col-md-3"
          role="tablist"
          aria-orientation="horizontal"
          style={{
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "12px",
            padding: "0px",
          }}
        >
          {level1CategoriesCourse.map((category) => (
            <div
              className="category-container"
              key={category.id}
              style={{ borderBottom: "1px solid #ccc" }}
            >
              <button
                type="button"
                className="category-button"
                onClick={() => {
                  handleReloadDataCap1(category);
                }}
              >
                <span>{category.name}</span>
                <i
                  className="fas fa-chevron-right"
                  style={{ float: "right", lineHeight: "28px" }}
                ></i>
              </button>

              {/* Cấp độ 2 - Hiển thị bên phải khi hover */}
              <div className="subcategory-level-2">
                {level2CategoriesCourse
                  .filter((subCategory) => subCategory.parentId === category.id)
                  .map((subCategory) => (
                    <div key={subCategory.id} className="category-container">
                      <button
                        type="button"
                        className="category-button"
                        onClick={() => {
                          handleReloadDataCap2(category, subCategory);
                        }}
                      >
                        <span>{subCategory.name}</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="col-md-7" style={{ height: "100%" }}>
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            spaceBetween={50}
            slidesPerView={1}
            pagination={{ clickable: true }}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              1: { slidesPerView: 1 },
              768: { slidesPerView: 1 },
              1024: { slidesPerView: 1 },
            }}
          >
            {bannerList.map(
              (banner: Banner) =>
                banner.type === "banner" && (
                  <SwiperSlide key={banner.id} style={{ height: "100%" }}>
                    <div className="swiper-slide" style={{ height: "100%" }}>
                      <div className="courses__item" style={{ height: "100%" }}>
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    </div>
                  </SwiperSlide>
                )
            )}
          </Swiper>
        </div>
        {bannerList
          .filter((banner: Banner) => banner.type === "voucher")
          .slice(0, 2)
          .map((banner: Banner) => (
            <div
              className="col-md-3"
              style={{ height: "100%" }}
              key={banner.id}
            >
              <div
                className="vocher-image"
                style={{
                  border: "2px solid #ddd",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  padding: "3px",
                }}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "10px",
                  }}
                />
              </div>
            </div>
          ))}
      </div>
      <hr />
      <div className="row">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm khóa học ..."
            onChange={handleInputChange}
            className="search-input"
          />
        </div>
      </div>
    </div>
  );
};

export default CourseNav;
