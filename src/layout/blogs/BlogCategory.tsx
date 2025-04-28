import React, { useState, useEffect } from "react";
import axios from "axios";
import { BlogItem } from "./Components/BlogItem";
import { useParams } from "react-router-dom";
import { GET_USER_BLOGS_BY_CATGORY } from "../../api/api";



interface BlogModel {
  id: number;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  author_id: number;
  cat_blog_id: number;
  status: true;
  image: string;
  author_name: string;
  category_name: string;
}

function BlogCategory() {
  const { id } = useParams<{ id: string }>(); // Use the category id from the URL params
  const [blogs, setBlogs] = useState<BlogModel[]>([]);
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [page, setPage] = useState(0); // Manage current page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages from the API

  const pageSize = 6; // Number of blogs per page

  useEffect(() => {
    if (id) {
      fetchBlogs(page); // Fetch blogs when component renders or page changes
    }
  }, [page, id]);

  const fetchBlogs = (page: number) => {
    setLoading(true); // Set loading to true at the start of fetching data
    axios
      .get(GET_USER_BLOGS_BY_CATGORY(Number(id)), {
        params: {
          page: page, // Current page
          size: pageSize, // Size of each page
        },
      })
      .then((response) => {
        setBlogs(response.data.content); // Save blog data to state
        setTotalPages(response.data.totalPages); // Save total pages
        setLoading(false); // Set loading to false once data is loaded
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
        setLoading(false); // Set loading to false if there's an error
      });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage); // Update page when user changes page
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading when data is being fetched
  }

  return (
    <section className="blog-area  pb-120">
      <div className="container">
        <div className="row g-4">
          {blogs.map((blog) => (
            <BlogItem key={blog.id} blog={blog} />
          ))}
        </div>
        <div className="pegi justify-content-center mt-60">
          <a
            href="#0"
            className={`border-none ${page === 0 ? "disabled" : ""}`}
            onClick={() => handlePageChange(page - 1)}
          >
            <i className="fa-regular fa-arrow-left primary-color transition"></i>
          </a>
          {[...Array(totalPages)].map((_, index) => (
            <a
              key={index}
              href="#0"
              className={index === page ? "active" : ""}
              onClick={() => handlePageChange(index)}
            >
              {index + 1}
            </a>
          ))}
          <a
            href="#0"
            className={`border-none ${page === totalPages - 1 ? "disabled" : ""}`}
            onClick={() => handlePageChange(page + 1)}
          >
            <i className="fa-regular fa-arrow-right primary-color transition"></i>
          </a>
        </div>
      </div>
    </section>
  );
}

export default BlogCategory;
