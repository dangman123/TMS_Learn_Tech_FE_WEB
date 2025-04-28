import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./style.css";

type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

const NavDocument = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null); // Trạng thái để lưu danh mục được chọn
  const navigate = useNavigate(); // Hook for navigation
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

  const handleNameClick = (id: number, name: any) => {
    setSelectedCategory(id); // Lưu danh mục được chọn vào trạng thái
    localStorage.setItem("iddanhmuctailieu", id.toString());
    window.location.href = `/tai-lieu/${removeVietnameseTones(name)}`;
  };

  const renderCategories = (parentId: number | null, level = 0) => {
    const filteredCategories = categories.filter(
      (category) => category.parentId === parentId
    );

    return filteredCategories.map((category) => (
      <li
        key={category.id}
        // className={`level-${level} ${
        //   category.id === selectedCategory ? "selected" : ""
        // }`}

        className={`level-${level} ${removeVietnameseTones(category.name) ===
          localStorage.getItem("danhmuctailieu")
          ? "selected"
          : ""
          }`}
      >
        <div className="top-header-level">
          <a
            href=""
            className="text-dark"
            onClick={(e) => {
              e.preventDefault();
              handleNameClick(category.id, category.name);
            }}
          >
            <span className={`font-weight-bold text-primary level-${level}`}>
              {level === 0 && <span className="icon">📂</span>}
              {level === 1 && <span className="icon">+</span>}
              {level === 2 && <span className="icon">*</span>}
              {category.name}
            </span>
          </a>
        </div>
        <ul className="list-unstyled widget-spec p-1 mb-0 ml-3">
          {renderCategories(category.id, level + 1)}
        </ul>
      </li>
    ));
  };

  return (
    <div className="col-xl-3 col-lg-4 col-md-12">
      <div className="card mb-1">
        <div className="card-header">
          <h3 className="card-title">Danh mục tài liệu</h3>
        </div>
        <div className="card-body widget-spec">
          <ul className="list-unstyled widget-spec p-1 mb-0">
            {renderCategories(null)}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavDocument;
