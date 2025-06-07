import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Folder,
  FileEarmark,
  ChevronRight,
  ChevronDown,
} from "react-bootstrap-icons";

interface CategoryNode {
  id: number;
  name: string;
  level: number;
  children: CategoryNode[];
}

interface ApiResponse {
  status: number;
  message: string;
  data: CategoryNode[];
}

const NavExample = () => {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [topLevelExpanded, setTopLevelExpanded] = useState<Record<number, boolean>>({});

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
          `${process.env.REACT_APP_SERVER_HOST}/api/categories/tree/test`
        );

        if (response.data && response.data.data) {
          // Get all level 2+ categories (skip level 1)
          const processedCategories: CategoryNode[] = [];
          
          response.data.data.forEach(topLevel => {
            // Add level 2 categories from each top level category
            if (topLevel.children && topLevel.children.length > 0) {
              processedCategories.push(...topLevel.children);
            }
          });
          
          setCategories(processedCategories);

          // Set selected category from localStorage if exists
          const currentCategoryId = localStorage.getItem("danhmucdethi");
          if (currentCategoryId) {
            const id = parseInt(currentCategoryId, 10);
            expandCategoryAndParents(id, processedCategories);
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Expand category and all its parents
  const expandCategoryAndParents = (
    categoryId: number,
    allCategories: CategoryNode[]
  ) => {
    const expandedIds: number[] = [];
    
    // Find the category with the given ID recursively
    const findCategoryAndParents = (categories: CategoryNode[]): boolean => {
      for (const category of categories) {
        // Check if this is the category we're looking for
        if (category.id === categoryId) {
          expandedIds.push(category.id);
          return true;
        }
        
        // Check in children
        if (category.children && category.children.length > 0) {
          const foundInChildren = findCategoryAndParents(category.children);
          if (foundInChildren) {
            expandedIds.push(category.id);
            
            // If it's a top level category, mark it as expanded
            if (category.level === 2) {
              setTopLevelExpanded((prev) => ({
                ...prev,
                [category.id]: true,
              }));
            }
            
            return true;
          }
        }
      }
      
      return false;
    };
    
    findCategoryAndParents(allCategories);
    
    setExpandedCategories(expandedIds);
    setSelectedCategory(categoryId);
  };

  const handleCategoryClick = (id: number, name: string) => {
    setSelectedCategory(id);
    localStorage.setItem("iddanhmucdethi", id.toString());
    localStorage.setItem("danhmucdethi", id.toString());
    window.location.href = `/de-thi/${removeVietnameseTones(name)}`;
  };

  const toggleExpand = (id: number, e: React.MouseEvent, level: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (level === 2) {
      // Top level category (level 2)
      const isCurrentlyExpanded = topLevelExpanded[id] || false;

      if (isCurrentlyExpanded) {
        // If expanded, collapse it and all its children
        const childCategories = getAllChildCategories(id);
        setExpandedCategories((prev) =>
          prev.filter((catId) => !childCategories.includes(catId))
        );

        setTopLevelExpanded((prev) => ({
          ...prev,
          [id]: false,
        }));
      } else {
        // If collapsed, expand it
        setTopLevelExpanded((prev) => ({
          ...prev,
          [id]: true,
        }));

        setExpandedCategories((prev) =>
          prev.includes(id) ? prev : [...prev, id]
        );
      }
    } else {
      // Lower level categories
      setExpandedCategories((prev) =>
        prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
      );
    }
  };

  // Get all child category IDs (recursive)
  const getAllChildCategories = (categoryId: number): number[] => {
    const result: number[] = [];

    const findChildren = (categories: CategoryNode[]) => {
      for (const category of categories) {
        if (category.id === categoryId) {
          if (category.children && category.children.length > 0) {
            addAllChildren(category.children);
          }
          return true;
        }
        
        if (category.children && category.children.length > 0) {
          if (findChildren(category.children)) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    const addAllChildren = (categories: CategoryNode[]) => {
      for (const category of categories) {
        result.push(category.id);
        if (category.children && category.children.length > 0) {
          addAllChildren(category.children);
        }
      }
    };
    
    findChildren(categories);
    return result;
  };

  const hasChildren = (category: CategoryNode) => {
    return category.children && category.children.length > 0;
  };

  const renderCategories = (categories: CategoryNode[], level: number) => {
    if (!categories || categories.length === 0) return null;

    return (
      <ul className="category-list">
        {categories.map((category) => {
          const isTopLevelExpanded =
            level === 2 ? topLevelExpanded[category.id] || false : true;
          const isExpanded = expandedCategories.includes(category.id);
          const isSelected = selectedCategory === category.id;
          const hasChildCategories = hasChildren(category);

          return (
            <li
              key={category.id}
              className={`category-item ${
                isSelected ? "active" : ""
              } depth-${level - 2}`} // Adjust depth to start at 0
            >
              <div className="category-row">
                {hasChildCategories && (
                  <button
                    className="expand-toggle"
                    onClick={(e) => toggleExpand(category.id, e, level)}
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    {level === 2 ? (
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
                    handleCategoryClick(category.id, category.name);
                  }}
                >
                  {level === 2 ? (
                    <Folder className="category-icon" />
                  ) : (
                    <FileEarmark className="category-icon" />
                  )}
                  <span>{category.name}</span>
                </a>
              </div>

              {hasChildCategories &&
                isExpanded &&
                (level === 2 ? isTopLevelExpanded : true) && (
                  <div className="nested-categories">
                    {renderCategories(category.children, level + 1)}
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
          <h3 className="document-title">Danh mục đề thi</h3>
        </div>
        <div className="document-body">
          {renderCategories(categories, 2)}
        </div>
      </div>
    </div>
  );
};

export default NavExample;
