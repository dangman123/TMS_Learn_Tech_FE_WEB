import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Folder,
  FileEarmark,
  ChevronRight,
  ChevronDown,
} from "react-bootstrap-icons";
import "./navDocument.css";

type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

const NavDocument = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  // Thêm state để quản lý trạng thái đóng/mở của menu cấp cao nhất
  const [topLevelExpanded, setTopLevelExpanded] = useState<
    Record<number, boolean>
  >({});

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
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_HOST}/categories-all`
        );
        setCategories(response.data);

        // Tự động mở rộng danh mục hiện tại và danh mục cha của nó
        const currentCategoryId = localStorage.getItem("iddanhmuctailieu");
        if (currentCategoryId) {
          const id = parseInt(currentCategoryId, 10);
          expandCategoryAndParents(id, response.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Hàm để mở rộng danh mục hiện tại và tất cả danh mục cha của nó
  // Hàm để mở rộng danh mục hiện tại và tất cả danh mục cha của nó
  const expandCategoryAndParents = (
    categoryId: number,
    allCategories: Category[]
  ) => {
    const expandedIds: number[] = [];
    let category = allCategories.find((cat) => cat.id === categoryId);

    // Thêm categoryId hiện tại
    expandedIds.push(categoryId);

    // Thêm tất cả các danh mục cha
    while (category && category.parentId) {
      expandedIds.push(category.parentId);
      const parentId = category.parentId; // Lưu parentId vào biến tạm
      category = allCategories.find((cat) => cat.id === parentId);

      // Nếu là danh mục cấp cao nhất (parentId = null) và category tồn tại
      if (category && category.parentId === null) {
        const topLevelId = category.id; // Lưu id vào biến tạm
        setTopLevelExpanded((prev) => ({
          ...prev,
          [topLevelId]: true,
        }));
      }
    }

    setExpandedCategories(expandedIds);
    setSelectedCategory(categoryId);
  };
  const handleNameClick = (id: number, name: string) => {
    setSelectedCategory(id);
    localStorage.setItem("iddanhmuctailieu", id.toString());
    localStorage.setItem("danhmuctailieu", removeVietnameseTones(name));
    window.location.href = `/tai-lieu/${removeVietnameseTones(name)}`;
  };

  const toggleExpand = (id: number, e: React.MouseEvent, level: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (level === 0) {
      // Nếu là danh mục cấp cao nhất
      const isCurrentlyExpanded = topLevelExpanded[id] || false;

      if (isCurrentlyExpanded) {
        // Nếu đang mở và được click để đóng
        // 1. Đóng tất cả các danh mục con của danh mục này
        const childCategories = getAllChildCategories(id);
        setExpandedCategories((prev) =>
          prev.filter((catId) => !childCategories.includes(catId))
        );

        // 2. Cập nhật trạng thái của danh mục cấp cao nhất
        setTopLevelExpanded((prev) => ({
          ...prev,
          [id]: false,
        }));
      } else {
        // Nếu đang đóng và được click để mở
        setTopLevelExpanded((prev) => ({
          ...prev,
          [id]: true,
        }));

        // Chỉ mở danh mục cấp cao nhất, không mở các danh mục con
        setExpandedCategories((prev) =>
          prev.includes(id) ? prev : [...prev, id]
        );
      }
    } else {
      // Xử lý cho các danh mục không phải cấp cao nhất
      setExpandedCategories((prev) =>
        prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
      );
    }
  };

  // Hàm lấy tất cả danh mục con (bao gồm cả các cấp lồng nhau)
  // Hàm lấy tất cả danh mục con (bao gồm cả các cấp lồng nhau)
  const getAllChildCategories = (parentId: number): number[] => {
    const result: number[] = [];

    // Kiểm tra nếu categories là undefined hoặc rỗng
    if (!categories || categories.length === 0) {
      return result;
    }

    const getChildren = (id: number) => {
      const children = categories.filter((cat) => cat.parentId === id);
      // Kiểm tra nếu children tồn tại
      if (children && children.length > 0) {
        children.forEach((child) => {
          result.push(child.id);
          getChildren(child.id);
        });
      }
    };

    getChildren(parentId);
    return result;
  };

  const hasChildren = (categoryId: number) => {
    return categories.some((cat) => cat.parentId === categoryId);
  };

  const renderCategories = (parentId: number | null, level = 0) => {
    const filteredCategories = categories.filter(
      (category) => category.parentId === parentId
    );

    if (filteredCategories.length === 0) return null;

    return (
      <ul className="category-list">
        {filteredCategories.map((category) => {
          const isTopLevelExpanded =
            level === 0 ? topLevelExpanded[category.id] || false : true;
          const isExpanded = expandedCategories.includes(category.id);
          const isSelected = selectedCategory === category.id;
          const hasChildCategories = hasChildren(category.id);

          return (
            <li
              key={category.id}
              className={`category-item ${
                isSelected ? "active" : ""
              } depth-${level}`}
            >
              <div className="category-row">
                {hasChildCategories && (
                  <button
                    className="expand-toggle"
                    onClick={(e) => toggleExpand(category.id, e, level)}
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    {level === 0 ? (
                      isTopLevelExpanded ? (
                        <ChevronDown />
                      ) : (
                        <ChevronRight />
                      )
                    ) : isExpanded ? (
                      <ChevronDown />
                    ) : (
                      <ChevronRight />
                    )}
                  </button>
                )}

                <a
                  href="#"
                  className="category-name"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNameClick(category.id, category.name);
                  }}
                >
                  {level === 0 ? (
                    <Folder className="category-icon" />
                  ) : (
                    <FileEarmark className="category-icon" />
                  )}
                  <span>{category.name}</span>
                </a>
              </div>

              {hasChildCategories &&
                isExpanded &&
                (level === 0 ? isTopLevelExpanded : true) && (
                  <div className="nested-categories">
                    {renderCategories(category.id, level + 1)}
                  </div>
                )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="col-xl-3 col-lg-4 col-md-12">
      <div className="document-card">
        <div className="document-header">
          <h3 className="document-title">Danh mục tài liệu</h3>
        </div>
        <div className="document-body">{renderCategories(null)}</div>
      </div>
    </div>
  );
};

export default NavDocument;
