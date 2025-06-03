import React, { useEffect, useState } from "react";
import { BlogListRecent } from "./Components/ComponentDEtail/BlogListRecent";
import { BlogSideBar } from "./Components/ComponentDEtail/BlogSideBar";
import { useParams } from "react-router-dom";
import { GET_USER_BLOG_DETAIL } from "../../api/api";
import styles from "./BlogDetail.module.css";
import { FiUser, FiCalendar, FiTag } from "react-icons/fi";

interface BlogModel {
  id: string;
  title: string;
  content: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  author_id: string;
  cat_blog_id: string;
  status: boolean;
  featured: boolean;
  image: string;
  views: number;
  commentCount: number;
  deletedDate: string;
  categoryName: string;
  authorName: string;
  deleted: boolean;
}

interface ApiResponse {
  status: number;
  message: string;
  data: BlogModel;
}

export const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(GET_USER_BLOG_DETAIL(Number(id)));
        if (!response.ok) {
          throw new Error("Có lỗi xảy ra khi lấy dữ liệu blog");
        }
        const result: ApiResponse = await response.json();
        
        if (result.status === 200 && result.data) {
          setBlog(result.data);
        } else {
          throw new Error(result.message || "Không thể lấy dữ liệu blog");
        }
        
        setLoading(false);
      } catch (err) {
        setError("Không thể lấy dữ liệu blog.");
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorContainer}>Lỗi: {error}</div>;
  }

  if (!blog) {
    return <div className={styles.errorContainer}>Không tìm thấy blog</div>;
  }

  return (
    <section className={styles.blogDetailArea}>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-8 order-2 order-lg-1">
            <div className={styles.detailContent}>
              <h1 className={styles.blogTitle}>
                {blog.title}
              </h1>
              <div className={styles.blogImage}>
                <img src={blog.image} alt={blog.title} />
              </div>
              <ul className={styles.metaInfo}>
                <li className={styles.metaItem}>
                  <FiUser />
                  <a href="#0">{blog.authorName}</a>
                </li>
                <li className={styles.metaItem}>
                  <FiCalendar />
                  <a href="#0">
                    {new Date(blog.createdAt).toLocaleString("default", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric"
                    })}
                  </a>
                </li>
                <li className={styles.metaItem}>
                  <FiTag />
                  <a href="#0">{blog.categoryName}</a>
                </li>
              </ul>
              <div className={styles.blogContent} dangerouslySetInnerHTML={{ __html: blog.content }}></div>
            </div>
          </div>
          <div className="col-lg-4 order-1 order-lg-2">
            <BlogSideBar categoryId={blog.cat_blog_id} currentBlogId={blog.id} />
          </div>
        </div>
      </div>
    </section>
  );
};
export default BlogDetail;
