import React from "react";

interface BlogModel {
  id: string;
  title: string;
  content: string;
  summary: string;
  author_id: string;
  createdAt: string;
  updatedAt: string;
  status: boolean;
  featured: boolean;
  cat_blog_id: string;
  image: string;
  views: number;
  commentCount: number;
  deletedDate: string;
  categoryName: string;
  authorName: string;
  deleted: boolean;
}

interface BlogItemProps {
  blog: BlogModel;
}

// CSS tùy chỉnh cho BlogItem
const blogItemStyles = {
  cardContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  imageWrapper: {
    height: "220px",
    overflow: "hidden",
    position: "relative" as const,
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    transition: "transform 0.5s ease",
  },
  content: {
    flex: "1",
    display: "flex",
    flexDirection: "column" as const,
    padding: "20px",
    position: "relative" as const,
  },
  dateTag: {
    position: "absolute" as const,
    top: "-25px",
    left: "20px",
    backgroundColor: "#2EB97E",
    color: "white",
    padding: "6px 16px",
    borderRadius: "6px",
    boxShadow: "0 2px 10px rgba(46, 185, 126, 0.3)",
    zIndex: 1,
    textAlign: "center" as const,
  },
  dateDay: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
    lineHeight: 1.2,
  },
  dateMonth: {
    fontSize: "14px",
    textTransform: "uppercase" as const,
  },
  title: {
    fontSize: "18px",
    fontWeight: "600",
    marginTop: "30px",
    marginBottom: "12px",
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
    height: "50px",
  },
  summary: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "15px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
    lineHeight: 1.6,
    flex: 1,
  },
  metaInfo: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #eee",
    borderBottom: "1px solid #eee",
    padding: "10px 0",
    marginBottom: "15px",
  },
  authorInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#555",
  },
  categoryInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#555",
  },
  stats: {
    display: "flex",
    gap: "15px",
    fontSize: "13px",
    color: "#666",
    marginBottom: "15px",
  },
  readMore: {
    color: "#2EB97E",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "14px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "auto",
    transition: "color 0.2s ease",
  }
};

export const BlogItem: React.FC<BlogItemProps> = ({ blog }) => {
  // Xử lý trường hợp ngày tháng không hợp lệ
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return { day: "01", month: "Jan" };
      }
      return {
        day: date.getDate().toString().padStart(2, '0'),
        month: date.toLocaleString("default", { month: "short" })
      };
    } catch (error) {
      return { day: "01", month: "Jan" };
    }
  };

  const dateFormatted = formatDate(blog.createdAt);

  return (
    <div className="col-xl-4 col-md-6 wow fadeInUp" data-wow-delay="400ms" data-wow-duration="1500ms">
      <div 
        className="blog__item" 
        style={blogItemStyles.cardContainer}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.1)";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "none";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.08)";
        }}
      >
        <div style={blogItemStyles.imageWrapper}>
          <a href={`/bai-viet/${blog.id}`} style={{ display: "block", height: "100%" }}>
            <img 
              src={blog.image} 
              alt={blog.title} 
              style={blogItemStyles.image}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </a>
        </div>
        
        <div style={blogItemStyles.content}>
          <div style={blogItemStyles.dateTag}>
            <h3 style={blogItemStyles.dateDay}>
              {dateFormatted.day}
            </h3>
            <span style={blogItemStyles.dateMonth}>
              {dateFormatted.month}
            </span>
          </div>
          
          <h3 style={blogItemStyles.title}>
            <a 
              href={`/bai-viet/${blog.id}`} 
              style={{ 
                color: "#333", 
                textDecoration: "none",
                transition: "color 0.2s ease"
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#2EB97E")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#333")}
            >
              {blog.title}
            </a>
          </h3>
          <div style={blogItemStyles.metaInfo}>
            <div style={blogItemStyles.authorInfo}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_1437_2716)">
                  <path
                    d="M14.5441 5.19275C14.5441 7.69093 12.4995 9.7355 10.0013 9.7355C7.50317 9.7355 5.45859 7.69093 5.45859 5.19275C5.45859 2.69457 7.50313 0.65 10.0013 0.65C12.4995 0.65 14.5441 2.69458 14.5441 5.19275Z"
                    stroke="#2EB97E"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M18.2631 14.6715C18.1039 14.9468 17.9228 15.2083 17.7156 15.4776L17.7155 15.4775L17.7076 15.4883C17.419 15.8798 17.0832 16.2383 16.7281 16.5934C16.4313 16.8902 16.0919 17.187 15.7554 17.4394C14.0781 18.692 12.0608 19.3508 9.97684 19.3508C7.89705 19.3508 5.88376 18.6948 4.20845 17.4471C3.84457 17.1514 3.51237 16.8802 3.22556 16.5934L3.21859 16.5864L3.21141 16.5797C2.85532 16.2445 2.54107 15.8886 2.24614 15.4883L2.24616 15.4883L2.24283 15.4839C2.06061 15.2409 1.8719 14.9765 1.71789 14.7179C1.83488 14.4568 1.98324 14.1857 2.1439 13.9536L2.14402 13.9537L2.15153 13.9423C3.06854 12.5566 4.53574 11.6398 6.16512 11.4157L6.18469 11.4131L6.20407 11.4092C6.22956 11.4041 6.29364 11.4126 6.34417 11.4505L6.34416 11.4505L6.34817 11.4535C7.4152 12.2411 8.68499 12.6463 9.99949 12.6463C11.314 12.6463 12.5838 12.2411 13.6508 11.4535L13.6508 11.4535L13.6548 11.4505C13.6702 11.439 13.739 11.4089 13.8479 11.4177C15.4675 11.6445 16.9108 12.5578 17.8511 13.9478L17.8511 13.9478L17.8551 13.9536C18.0152 14.1849 18.1543 14.4241 18.2631 14.6715Z"
                    stroke="#2EB97E"
                    strokeWidth="1.3"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1437_2716">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span>{blog.authorName}</span>
            </div>
            <div style={blogItemStyles.categoryInfo}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 19 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="..." fill="#2EB97E" />
              </svg>
              <span>{blog.categoryName}</span>
            </div>
          </div>
          
          <div style={blogItemStyles.stats}>
            <div>
              <i className="fa-regular fa-eye" style={{ marginRight: "5px" }}></i> 
              {blog.views} lượt xem
            </div>
            <div>
              <i className="fa-regular fa-comment" style={{ marginRight: "5px" }}></i> 
              {blog.commentCount} bình luận
            </div>
          </div>
          
          <a 
            style={blogItemStyles.readMore} 
            href={`/bai-viet/${blog.id}`}
            onMouseOver={(e) => (e.currentTarget.style.color = "#1d8f5c")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#2EB97E")}
          >
            Đọc thêm 
            <i className="fa-regular fa-arrow-right-long"></i>
          </a>
        </div>
      </div>
    </div>
  );
};
