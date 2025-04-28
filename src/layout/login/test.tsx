import React, { useState } from "react";
import { POST_ADMIN_DOCUMENT } from "../../api/api";
import RequireAdmin from "../DOM/RequireAdmin";

const Test: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category] = useState("/blogcategorys/1"); // Default category ID
  const [author] = useState("/accounts/1"); // Default author ID

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newBlogPost = {
      title,
      content,
      category, // Reference to BlogCategory with ID 1
      author , // Reference to Account with ID 1
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const token = localStorage.getItem("authToken");
    try {
      const response = await fetch(POST_ADMIN_DOCUMENT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBlogPost),
      });

      if (response.ok) {
        alert("Đã thêm sách thành công!");
      } else {
        console.error(
          "There was an error adding the blog post!",
          response.statusText
        );
      }
    } catch (error) {
      alert("Gặp lỗi trong quá trình thêm sách!");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="form">
        <div>
          <label htmlFor="title">Tiêu đề</label>
          <input 
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>
        <div>
          <label htmlFor="content">Nội dung</label>
          <input
            type="text"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="cate_blog">Danh mục</label>
          <select name="cate_blog" id="cate_blog" value={category}>
            <option value="1">Công nghệ 1</option>
            <option value="2">Công nghệ 2</option>
          </select>
        </div>
        <button type="submit">Thêm bài viết</button>
      </form>
    </div>
  );
};
const Test_Admin = RequireAdmin(Test);

export default Test_Admin;

// export default Test;
