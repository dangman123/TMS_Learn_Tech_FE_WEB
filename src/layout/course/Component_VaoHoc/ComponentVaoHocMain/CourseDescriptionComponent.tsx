import React, { useEffect, useState } from "react";
import "./CourseDescriptionComponent.css";
import { decryptData } from "../../../util/encryption";
import { isTokenExpired } from "../../../util/fucntion/auth";
import useRefreshToken from "../../../util/fucntion/useRefreshToken";
import { ToastContainer, toast } from "react-toastify"; // Import Toastify và toast
import "react-toastify/dist/ReactToastify.css";
interface CourseDescriptionProps {
  documentShort?: string;
  documentUrl?: string;
  video_id?: number;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  account: {
    id: number;
    fullname: string;
  };
  children?: Comment[];
}

export const CourseDescriptionComponent: React.FC<CourseDescriptionProps> = ({
  documentShort,
  documentUrl,
  video_id,
}) => {
  const [rootComments, setRootComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [childrenComments, setChildrenComments] = useState<{
    [key: number]: Comment[];
  }>({});
  const [expandedComments, setExpandedComments] = useState<{
    [key: number]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);
  const [lessonId, setLessonId] = useState<number | null>(null);
  const refresh = useRefreshToken();
  const [rootCommentContent, setRootCommentContent] = useState("");

  const [childCommentContent, setChildCommentContent] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  useEffect(() => {
    const storedEncryptedLessonId = localStorage.getItem("encryptedLessonId");
    if (storedEncryptedLessonId) {
      const decryptedLessonId = decryptData(storedEncryptedLessonId);
      setLessonId(decryptedLessonId);
    }
  }, []);

  useEffect(() => {
    if (lessonId) {
      fetchRootComments(currentPage);
    }
  }, [lessonId, currentPage]);

  const fetchRootComments = async (page: number) => {
    setLoading(true);
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
        `${process.env.REACT_APP_SERVER_HOST}/api/comments/video/${video_id}/lesson/${lessonId}?page=${page}&size=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setRootComments(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching root comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildrenComments = async (parentId: number) => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/comments/${parentId}/children/video/${video_id}/lesson/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setChildrenComments((prev) => ({ ...prev, [parentId]: data }));
    } catch (error) {
      console.error("Error fetching children comments:", error);
    }
  };

  const postComment = async (
    content: string,
    accId: number,
    lessonId: number,
    videoId: number,
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
        `${process.env.REACT_APP_SERVER_HOST}/api/comments/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
            accId,
            lessonId,
            videoId,
            contentId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể thêm bình luận. Vui lòng thử lại.");
      }
      const data = await response.json();
      return data; // Trả về bình luận đã được thêm
    } catch (error) {
      console.error("Error posting comment:", error);
      throw error; // Để xử lý thêm nếu cần
    }
  };

  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    if (authData) {
      return JSON.parse(authData); // Parse JSON từ localStorage
    }
    return null; // Trả về null nếu không tìm thấy
  };

  const handleAddRootComment = async (content: string) => {
    if (!lessonId || !video_id) {
      console.error("LessonId hoặc VideoId không hợp lệ.");
      return;
    }
    const user = getUserData();

    try {
      const newComment = await postComment(
        content,
        user.id,
        lessonId,
        video_id,
        null
      );
      setRootComments((prev) => [newComment, ...prev]);
      toast.success(`Comment sẽ được Quản trị viên duyệt !`);
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (error) {
      toast.success(`Không thể thêm bình luận. Vui lòng thử lại.`);
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    }
  };

  const handleAddChildComment = async (content: string, parentId: number) => {
    if (!lessonId || !video_id) {
      console.error("LessonId hoặc VideoId không hợp lệ.");
      return;
    }
    const user = getUserData();
    try {
      const newChildComment = await postComment(
        content,
        user.id,
        lessonId,
        video_id,
        parentId
      );
      // console.log(newChildComment);
      setChildrenComments((prev) => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), newChildComment], // Thêm bình luận con vào danh sách
      }));

      toast.success(`Comment sẽ được Quản trị viên duyệt !`);
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch (error) {
      toast.success(`Không thể thêm bình luận con. Vui lòng thử lại.`);
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    }
  };

  const handleReplyToggle = (parentId: number) => {
    setExpandedComments((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));

    // Fetch children comments only if they haven't been fetched before
    if (!childrenComments[parentId]) {
      fetchChildrenComments(parentId);
    }
  };

  const handleReplyClick = (commentId: number) => {
    setActiveReplyId((prev) => (prev === commentId ? null : commentId));
  };

  const btnDelete = async (commentId: number) => {
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
        `${process.env.REACT_APP_SERVER_HOST}/api/comments/delete/${commentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(`Comment đã được xóa thành công!`);
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(
          `Không thể xóa comment : ${errorData.message || response.statusText}`
        );
        // window.location.reload();
      }
    } catch (error) {
      console.error("Error fetching children comments:", error);
    }

    // console.log(commentId);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div>
      <a
        href={documentUrl}
        className="btn btn-primary"
        style={{ float: "right" }}
        target="_blank"
        rel="noopener noreferrer"
      >
        Tải xuống
      </a>

      <p
        className="main-description"
        dangerouslySetInnerHTML={{ __html: documentShort || "" }}
      />

      <div className="comment-section">
        <h3>BÌNH LUẬN</h3>

        <div className="comment-login">
          <div className="add-comment-root">
            <textarea
              placeholder="Viết bình luận của bạn..."
              value={rootCommentContent}
              onChange={(e) => setRootCommentContent(e.target.value)}
            ></textarea>
            <button
              onClick={() => {
                handleAddRootComment(rootCommentContent);
                setRootCommentContent(""); // Xóa nội dung sau khi gửi
              }}
              disabled={!rootCommentContent.trim()} // Vô hiệu hóa nút nếu không có nội dung
            >
              Gửi
            </button>
          </div>
        </div>

        <div className="comments-list">
          {rootComments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-user">
                <div className="comment-user-image">
                  <img
                    src="https://i.imgur.com/6ASBXYj.jpeg"
                    alt="User Avatar"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                    }}
                  />
                </div>
                <div className="comment-user-content">
                  <span className="username">{comment.account.fullname}</span>
                  <span className="comment-date">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  <button
                    className="reply-button-user"
                    onClick={() => handleReplyClick(comment.id)}
                  >
                    {activeReplyId === comment.id ? "Hủy" : "Trả lời"}
                  </button>
                  {/* <button
                    className="reply-button-user"
                    onClick={() => btnDelete(comment.id)}
                  >
                    Xóa
                  </button> */}
                  <p className="comment-content">{comment.content}</p>
                </div>
              </div>

              <div className="comment-actions">
                <button
                  className="reply-button"
                  onClick={() => handleReplyToggle(comment.id)}
                >
                  {expandedComments[comment.id]
                    ? "Ẩn các câu trả lời"
                    : "Xem tất cả câu trả lời"}
                </button>
              </div>

              {activeReplyId === comment.id && (
                <div className="add-child-comment">
                  <textarea
                    placeholder="Viết trả lời của bạn..."
                    onChange={(e) => setChildCommentContent(e.target.value)}
                    value={childCommentContent}
                  />
                  <button
                    onClick={() => {
                      handleAddChildComment(childCommentContent, comment.id);
                      setActiveReplyId(null); // Đóng sau khi gửi
                    }}
                  >
                    Gửi
                  </button>
                </div>
              )}

              {/* Hiển thị comment con nếu comment gốc đã được mở */}
              {expandedComments[comment.id] && childrenComments[comment.id] && (
                <div className="child-comments">
                  {childrenComments[comment.id].map((child) => (
                    <div key={child.id} className="child-comment-item children">
                      <div className="comment-user">
                        <div className="comment-user-image">
                          {" "}
                          <img
                            src="https://i.imgur.com/6ASBXYj.jpeg"
                            alt="User Avatar"
                            className="avatar"
                          />
                        </div>
                        <div className="comment-user-content">
                          <span className="username">
                            {child.account.fullname}
                          </span>
                          <span className="comment-date">
                            {new Date(child.createdAt).toLocaleString()}
                          </span>
                          <button
                            className="reply-button-user"
                            onClick={() => handleReplyClick(child.id)}
                          >
                            {activeReplyId === child.id ? "Hủy" : "Trả lời"}
                          </button>
                          {/* <button
                            className="reply-button-user"
                            onClick={() => btnDelete(child.id)}
                          >
                            Xóa
                          </button> */}
                          <p className="comment-content">{child.content}</p>
                        </div>
                      </div>

                      {activeReplyId === child.id && (
                        <div className="add-child-comment">
                          <textarea
                            placeholder="Viết trả lời của bạn..."
                            onChange={(e) =>
                              setChildCommentContent(e.target.value)
                            }
                            value={childCommentContent}
                          />
                          <button
                            onClick={() => {
                              handleAddChildComment(
                                childCommentContent,
                                comment.id
                              );
                              setActiveReplyId(null);
                            }}
                          >
                            Gửi
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {/* Nút phân trang */}

          <div className="pagination comment-video">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              &lt;
            </button>

            {Array.from(Array(totalPages).keys()).map((page) => (
              <React.Fragment key={page}>
                {page === currentPage ||
                  page === 0 ||
                  page === totalPages - 1 ||
                  (page >= currentPage - 1 && page <= currentPage + 1) ? (
                  <button
                    onClick={() => handlePageChange(page)}
                    className={page === currentPage ? "active" : ""}
                  >
                    {page + 1}
                  </button>
                ) : page === currentPage - 2 || page === currentPage + 2 ? (
                  <span className="dots">...</span>
                ) : null}
              </React.Fragment>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
