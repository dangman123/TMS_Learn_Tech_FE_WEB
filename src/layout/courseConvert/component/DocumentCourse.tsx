import React from "react";
import "./DocumentCourse.css";

const DocumentCourse = () => {
  const courseData = [
    {
      chapter: "Chương 1: Giới thiệu",
      documents: [
        {
          id: 1,
          name: "Tài liệu 1 - Giới thiệu khóa học",
          url: "/docs/chapter1-doc1.pdf",
        },
        {
          id: 2,
          name: "Tài liệu 2 - Hướng dẫn sử dụng",
          url: "/docs/chapter1-doc2.pdf",
        },
      ],
    },
    {
      chapter: "Chương 2: Kiến thức cơ bản",
      documents: [
        {
          id: 3,
          name: "Tài liệu 1 - Tổng quan",
          url: "/docs/chapter2-doc1.pdf",
        },
        {
          id: 4,
          name: "Tài liệu 2 - Các khái niệm cơ bản",
          url: "/docs/chapter2-doc2.pdf",
        },
      ],
    },
    {
      chapter: "Chương 3: Nâng cao",
      documents: [
        {
          id: 5,
          name: "Tài liệu 1 - Kỹ thuật nâng cao",
          url: "/docs/chapter3-doc1.pdf",
        },
      ],
    },
    {
      chapter: "Chương 3: Nâng cao",
      documents: [
        {
          id: 5,
          name: "Tài liệu 1 - Kỹ thuật nâng cao",
          url: "/docs/chapter3-doc1.pdf",
        },
      ],
    },
    {
      chapter: "Chương 3: Nâng cao",
      documents: [
        {
          id: 5,
          name: "Tài liệu 1 - Kỹ thuật nâng cao",
          url: "/docs/chapter3-doc1.pdf",
        },
      ],
    },
    {
      chapter: "Chương 3: Nâng cao",
      documents: [
        {
          id: 5,
          name: "Tài liệu 1 - Kỹ thuật nâng cao",
          url: "/docs/chapter3-doc1.pdf",
        },
      ],
    },
  ];

  return (
    <div className="document-course-container">
      <h1 className="document-course-title">Tài liệu khóa học</h1>
      {courseData.map((chapter, index) => (
        <div className="chapter-section" key={index}>
          <h2 className="chapter-title">{chapter.chapter}</h2>
          <ul className="document-list">
            {chapter.documents.map((doc) => (
              <li className="document-item" key={doc.id}>
                <span className="document-name">{doc.name}</span>
                <a href={doc.url} download className="download-button">
                  Tải tài liệu
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default DocumentCourse;
