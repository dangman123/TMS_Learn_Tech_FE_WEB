import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileEarmark } from "react-bootstrap-icons";
interface Category {
  id: number;
  title: string;
  imageUrl: string;
  accountId: string;
  courseCategoryId: string;
  cost: number;
  price: number;
}

interface ApiResponse {
  status: number;
  message: string;
  data: Category[];
}
const NavExample = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const removeVietnameseTones = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<ApiResponse>(
          `${process.env.REACT_APP_SERVER_HOST}/api/courses/get-all-result-list-course`
        );

        // Access the data array from the response
        if (response.data && response.data.data) {
          setCategories(response.data.data);

          // Set selected category from localStorage if exists
          const currentCategoryId = localStorage.getItem("danhmucdethi");
          if (currentCategoryId) {
            setSelectedCategory(parseInt(currentCategoryId, 10));
          }
        }
      } catch (error) {
        console.error("Error fetching exam categories:", error);
        setCategories([]); // Set empty array on error
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (id: number, name: string) => {
    setSelectedCategory(id);
    localStorage.setItem("iddanhmucdethi", id.toString());
    localStorage.setItem("danhmucdethi", removeVietnameseTones(name));
    window.location.href = `/de-thi/${removeVietnameseTones(name)}`;
  };

  return (
    <div className="col-xl-3 col-lg-4 col-md-12">
      <div className="document-card">
        <div className="document-header">
          <h3 className="document-title">Danh mục đề thi</h3>
        </div>
        <div className="document-body">
          <ul className="category-list">
            {categories.map((category) => (
              <li
                key={category.id}
                className={`category-item ${
                  selectedCategory === category.id ? "active" : ""
                }`}
              >
                <div className="category-row">
                  <a
                    href="#"
                    className="category-name"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategoryClick(category.id, category.title);
                    }}
                  >
                    <FileEarmark className="category-icon" />
                    <span>{category.title}</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavExample;
