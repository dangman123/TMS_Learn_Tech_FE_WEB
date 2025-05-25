import React, { useEffect, useState } from "react";
import "./courseNav.css";
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
import { Category } from "../../Courses";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "../../../util/fucntion/auth";

interface CourseNavProps {
  level1CategoriesCourse: Category[];
  level2CategoriesCourse: Category[];
  level3CategoriesCourse: Category[];
  categories: Category[];
  onSearchChange: (query: string) => void;
}

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  link: string;
  type: string;
  position: string;
  platform: string;
  status: boolean;
  priority: number;
}

const removeVietnameseTones = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

const CourseNav: React.FC<CourseNavProps> = ({
  level1CategoriesCourse,
  level2CategoriesCourse,
  level3CategoriesCourse,
  categories,
  onSearchChange,
}) => {
  const [bannerList, setBannerList] = useState<Banner[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  useEffect(() => {
    fetchBannerList();
  }, []);

  const fetchBannerList = async () => {
    try {
      const response = await fetch(
        "http://103.166.143.198:8080/api/banner-voucher/list",
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
      console.log("Banner data:", data);
      setBannerList(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Error fetching banner list:", error);
      setBannerList([]);
    }
  };

  const handleReloadDataCap1 = (category: Category) => {
    localStorage.setItem(
      "danhmuckhoahoc",
      removeVietnameseTones(category.name)
    );
    localStorage.setItem("danhmuckhoahocVN", category.name);
    localStorage.setItem("iddanhmuckhoahoc", category.id.toString());
    localStorage.removeItem("iddanhmuckhoahoc");
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
    <div className="course-nav-container">
      <div className="course-content-container">
        {/* Banner và Voucher */}
        <div className="row course-main-content">
          {/* Banner chính - Cột bên trái */}
          <div className="col-md-8">
            <div className="main-banner">
              <Swiper
                modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                pagination={{ clickable: true }}
                navigation
                loop={true}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                }}
                className="main-banner-swiper"
              >
                {bannerList &&
                  bannerList
                    .filter((banner) => banner.type === "REGULAR")
                    .map((banner) => (
                      <SwiperSlide key={banner.id}>
                        <a href={banner.link} className="banner-link">
                          <div className="banner-image-container">
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="banner-image"
                            />
                            <div className="banner-overlay">
                              <h3 className="banner-title">{banner.title}</h3>
                            </div>
                          </div>
                        </a>
                      </SwiperSlide>
                    ))}
              </Swiper>
            </div>
          </div>

          {/* Voucher Banners - Cột bên phải */}
          <div className="col-md-4 voucher-banners-container">
            <div className="voucher-banners">
              {bannerList &&
                bannerList
                  .filter((banner) => banner.type === "VOUCHER")
                  .slice(0, 2)
                  .map((banner, index) => (
                    <div className="voucher-item" key={banner.id}>
                      <a href={banner.link} className="voucher-link">
                        <div className="voucher-image-container">
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="voucher-image"
                          />
                          <div className="voucher-overlay">
                            <span className="voucher-tag">Ưu đãi</span>
                          </div>
                        </div>
                      </a>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseNav;
