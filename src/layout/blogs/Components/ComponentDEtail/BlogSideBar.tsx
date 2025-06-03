import React, { useEffect, useState } from "react";
import { BlogListRecent } from "./BlogListRecent";
import { FiCalendar, FiEye } from "react-icons/fi";
import styles from "./BlogSideBar.module.css";

interface RelatedBlogModel {
  id: string;
  title: string;
  summary: string;
  image: string;
  createdAt: string;
  categoryName: string;
  authorName: string;
  views: number;
}

interface RelatedBlogsResponse {
  status: number;
  message: string;
  data: {
    content: RelatedBlogModel[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
  };
}

export const BlogSideBar = ({ categoryId, currentBlogId }: { categoryId?: string, currentBlogId?: string }) => {
  const [relatedBlogs, setRelatedBlogs] = useState<RelatedBlogModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      try {
        // Use the provided categoryId or default to 20
        const id = categoryId || "20";
        const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/blogs/public?categoryId=${id}`);
        
        if (!response.ok) {
          throw new Error("Lỗi khi lấy dữ liệu blog liên quan");
        }
        
        const result: RelatedBlogsResponse = await response.json();
        
        if (result.status === 200 && result.data && result.data.content) {
          // Filter out the current blog from related posts
          let filteredBlogs = result.data.content;
          if (currentBlogId) {
            filteredBlogs = filteredBlogs.filter(blog => blog.id !== currentBlogId);
          }
          setRelatedBlogs(filteredBlogs);
        } else {
          throw new Error(result.message || "Dữ liệu blog liên quan không hợp lệ");
        }
        setLoading(false);
      } catch (err: any) {
        console.error("Lỗi khi lấy blog liên quan:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRelatedBlogs();
  }, [categoryId, currentBlogId]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorMessage}>Lỗi: {error}</div>;
  }

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <div className={styles.sidebar}>
      {relatedBlogs.length > 0 && (
        <div className={styles.relatedPostsSection}>
          <h3 className={styles.sectionTitle}>Bài Viết Liên Quan</h3>
          <ul className={styles.postsList}>
            {relatedBlogs.map((blog) => (
              <li key={blog.id} className={styles.postItem}>
                <a href={`/bai-viet/${blog.id}`} className={styles.postLink}>
                  <div className={styles.postImage}>
                    <img src={blog.image} alt={blog.title} />
                  </div>
                  <div className={styles.postContent}>
                    <h4 className={styles.postTitle}>{blog.title}</h4>
                    <div className={styles.postMeta}>
                      <span className={styles.postDate}>
                        <FiCalendar />
                        {formatDate(blog.createdAt)}
                      </span>
                      <span className={styles.postViews}>
                        <FiEye />
                        {blog.views} lượt xem
                      </span>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
