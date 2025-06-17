import React, { useEffect, useState, useCallback } from "react";
import { BlogListRecent } from "./Components/ComponentDEtail/BlogListRecent";
import { BlogSideBar } from "./Components/ComponentDEtail/BlogSideBar";
import { useParams } from "react-router-dom";
import { GET_USER_BLOG_DETAIL } from "../../api/api";
import styles from "./BlogDetail.module.css";
import { FiUser, FiCalendar, FiTag } from "react-icons/fi";
import { isTokenExpired } from "../util/fucntion/auth";
import useRefreshToken from "../util/fucntion/useRefreshToken";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

interface BlogComment {
  commentId: number;
  content: string;
  accountId: number;
  fullname: string;
  image: string;
  createdAt: string;
  replies?: BlogComment[] | null;
}

interface ApiResponse {
  status: number;
  message: string;
  data: BlogModel;
}

// Custom styles cho section bình luận
const commentStyles = `
  .comment-section h3 { font-size: 22px; font-weight: 600; margin-bottom: 12px; }
  .comment-form .ck-editor__editable_inline { min-height: 120px; font-size: 16px; line-height: 1.5; }
  .comment-item { border: 1px solid #e0e0e0; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
  .comment-item-content { margin-top: 10px; font-size: 15px; line-height: 1.6; color: #343a40; }
  .comment-meta { display:flex; align-items:center; gap:10px; }
  .comment-meta .name { font-weight: 600; font-size: 15px; }
  .comment-meta .date { font-size: 13px; color: #6c757d; }
`;

export const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useRefreshToken();
  const [rootComments, setRootComments] = useState<BlogComment[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [commentPage, setCommentPage] = useState(1);
  const [commentContent, setCommentContent] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) return JSON.parse(authData);
    return null;
  };

  const PAGE_SIZE = 5;
  const fetchRootComments = useCallback(
    async (page: number) => {
      if (!blog) return;
      try {
        const url = `${process.env.REACT_APP_SERVER_HOST}/api/comments/course?blogId=${blog.id}&targetType=ARTICLE&page=${page}&size=${PAGE_SIZE}`;
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setRootComments(data.content || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    },
    [blog]
  );

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

  useEffect(() => {
    if (blog) {
      fetchRootComments(commentPage);
    }
  }, [blog, commentPage, fetchRootComments]);

  // Inject comment styles once
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = commentStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleSubmitComment = async () => {
    const user = getUserData();
    if (!user) {
      toast.error("Vui lòng đăng nhập để bình luận.");
      return;
    }

    if (commentContent.trim() === "") {
      toast.warning("Vui lòng nhập nội dung bình luận.");
      return;
    }

    try {
      setCommentSubmitting(true);
      const plainTextContent = commentContent.replace(/<[^>]*>/g, "");
      const newCmt = await postComment(
        plainTextContent,
        user.id,
        Number(blog?.id),
        null
      );
      toast.success("Đã gửi bình luận.");
      setCommentContent("");
      // prepend mới vào danh sách (nếu đang ở trang đầu)
      if (commentPage === 1) {
        setRootComments((prev) => [newCmt, ...prev]);
      } else {
        fetchRootComments(commentPage);
      }
    } catch (error) {
      toast.error("Có lỗi khi gửi bình luận.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const postComment = async (
    content: string,
    accId: number,
    blogId: number,
    contentId: number | null = null
  ) => {
    let token = localStorage.getItem("authToken");

    if (isTokenExpired(token)) {
      token = await refresh();
      if (!token) {
        window.location.href = "/dang-nhap";
        return;
      }
      localStorage.setItem("authToken", token);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/comments/blog/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            accId,
            blogId,
            contentId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể thêm bình luận. Vui lòng thử lại.");
      }
      const data = await response.json();
      return data; // trả về bình luận vừa thêm
    } catch (error) {
      console.error("Error posting comment:", error);
      throw error; // Để xử lý thêm nếu cần
    }
  };

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
    return <div className={styles.errorContainer}>Không tìm thấy bài viết</div>;
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

              {/* Comment Section */}
              <div className="comment-section" style={{ marginTop: "40px" }}>
                <h3>Bình luận</h3>
                {/* Comment Form */}
                <div className="comment-form" style={{ marginBottom: "20px" }}>
                  <CKEditor
                    editor={ClassicEditor}
                    data={commentContent}
                    config={{
                      removePlugins: [
                        "CKFinder",
                        "Image",
                        "MediaEmbed",
                        "ImageToolbar",
                        "ImageUpload",
                        "ImageCaption",
                        "EasyImage",
                      ],
                      toolbar: [
                        "bold",
                        "italic",
                        "bulletedList",
                        "numberedList",
                        "blockQuote",
                        "undo",
                        "redo",
                      ],
                    }}
                    onChange={(event: any, editor: any) => {
                      const data = editor.getData();
                      setCommentContent(data);
                    }}
                  />
                  <button
                    className="btn-one blue float-end comment-send-btn"
                    style={{ marginTop: "10px" }}
                    onClick={handleSubmitComment}
                    disabled={commentSubmitting}
                  >
                    {commentSubmitting ? "Đang gửi..." : "Gửi bình luận"}
                  </button>
                </div>

                {/* Comment List */}
                {rootComments.length === 0 ? (
                  <p style={{ fontSize: "15px", color: "#6c757d" }}>Chưa có bình luận.</p>
                ) : (
                  rootComments.map((c) => (
                    <div
                      key={c.commentId}
                      className="comment-item"
                    >
                      <div className="comment-meta">
                        <img
                          src={c.image}
                          alt={c.fullname}
                          width={40}
                          height={40}
                          style={{ borderRadius: "50%" }}
                        />
                        <div>
                          <div className="name">{c.fullname}</div>
                          <div className="date">
                            {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </div>
                      <div className="comment-item-content" dangerouslySetInnerHTML={{ __html: c.content }} />

                      {c.replies && c.replies.length > 0 && (
                        <div style={{ marginTop: "10px", marginLeft: "50px" }}>
                          {c.replies.map((r) => (
                            <div key={r.commentId} className="comment-item" style={{ border: "none", padding: 0 }}>
                              <div className="comment-meta">
                                <img src={r.image} alt={r.fullname} width={32} height={32} style={{ borderRadius: "50%" }} />
                                <div>
                                  <div className="name">{r.fullname}</div>
                                  <div className="date">{new Date(r.createdAt).toLocaleDateString("vi-VN")}</div>
                                </div>
                              </div>
                              <div className="comment-item-content" dangerouslySetInnerHTML={{ __html: r.content }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-4 order-1 order-lg-2">
            <BlogSideBar categoryId={blog.cat_blog_id} currentBlogId={blog.id} />
          </div>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};
export default BlogDetail;
