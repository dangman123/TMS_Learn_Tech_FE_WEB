import React, { useEffect, useState } from "react";
import { BlogListRecent } from "./BlogListRecent";
import { GET_USER_CATEGORY_BLOGS } from "../../../../api/api";
interface CategoryModel {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  totalblog: number;
}

export const BlogSideBar = () => {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(GET_USER_CATEGORY_BLOGS);
        if (!response.ok) {
          throw new Error("Lỗi khi lấy dữ liệu danh mục blog");
        }
        const data = await response.json();
        setCategories(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCategories(); 
  }, []);

  if (loading) {
    return <div>Đang tải danh mục...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}</div>;
  }

  return (
    <div className="blog-details__item-right">
     
      <div className="item category mb-4">
        <h3>Loại Blog</h3>
        <ul>
          {categories.map((category) => (
            <li key={category.id}>
              <a href={`/bai-viet/danh-muc-bai-viet/${category.id}`}>
                <span>{category.name}</span>{" "}
                <span>({category.totalblog})</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <BlogListRecent />
    </div>
  );
};
