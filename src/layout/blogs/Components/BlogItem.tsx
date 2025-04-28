import React from "react";

interface BlogModel {
  id: number;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  author_id: number;
  cat_blog_id: number;
  status: boolean;
  image: string;
  author_name: string;
  category_name: string;
}

interface BlogItemProps {
  blog: BlogModel;
}

export const BlogItem: React.FC<BlogItemProps> = ({ blog }) => {
  return (
    <div
      className="col-xl-4 col-md-6 wow fadeInUp"
      data-wow-delay="400ms"
      data-wow-duration="1500ms"
    >
      <div className="blog__item p-4">
        <a href={`/bai-viet/${blog.id}`} className="blog__image d-block image">
          <img src={blog.image} alt={blog.title} width={"400px"} height={"250px"} />
        </a>
        <div className="blog__content">
          <div className="blog-tag">
            <h3 className="text-white">
              {new Date(blog.created_at).getDate()}
            </h3>
            <span className="text-white">
              {new Date(blog.created_at).toLocaleString("default", {
                month: "short",
              })}
            </span>
          </div>
          <ul className="blog-info mb-20 mt-40" style={{ display: "flex", justifyContent: "space-between" }}>
            <li>
            <svg
                    className="me-1"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_1437_2716)">
                      <path
                        d="M14.5441 5.19275C14.5441 7.69093 12.4995 9.7355 10.0013 9.7355C7.50317 9.7355 5.45859 7.69093 5.45859 5.19275C5.45859 2.69457 7.50313 0.65 10.0013 0.65C12.4995 0.65 14.5441 2.69458 14.5441 5.19275Z"
                        stroke="#2EB97E"
                        stroke-width="1.3"
                      />
                      <path
                        d="M18.2631 14.6715C18.1039 14.9468 17.9228 15.2083 17.7156 15.4776L17.7155 15.4775L17.7076 15.4883C17.419 15.8798 17.0832 16.2383 16.7281 16.5934C16.4313 16.8902 16.0919 17.187 15.7554 17.4394C14.0781 18.692 12.0608 19.3508 9.97684 19.3508C7.89705 19.3508 5.88376 18.6948 4.20845 17.4471C3.84457 17.1514 3.51237 16.8802 3.22556 16.5934L3.21859 16.5864L3.21141 16.5797C2.85532 16.2445 2.54107 15.8886 2.24614 15.4883L2.24616 15.4883L2.24283 15.4839C2.06061 15.2409 1.8719 14.9765 1.71789 14.7179C1.83488 14.4568 1.98324 14.1857 2.1439 13.9536L2.14402 13.9537L2.15153 13.9423C3.06854 12.5566 4.53574 11.6398 6.16512 11.4157L6.18469 11.4131L6.20407 11.4092C6.22956 11.4041 6.29364 11.4126 6.34417 11.4505L6.34416 11.4505L6.34817 11.4535C7.4152 12.2411 8.68499 12.6463 9.99949 12.6463C11.314 12.6463 12.5838 12.2411 13.6508 11.4535L13.6508 11.4535L13.6548 11.4505C13.6702 11.439 13.739 11.4089 13.8479 11.4177C15.4675 11.6445 16.9108 12.5578 17.8511 13.9478L17.8511 13.9478L17.8551 13.9536C18.0152 14.1849 18.1543 14.4241 18.2631 14.6715Z"
                        stroke="#2EB97E"
                        stroke-width="1.3"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1437_2716">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
              <a href="#0"><strong>{blog.author_name}</strong></a>
            </li>
            <li>
              <svg
                width="19"
                height="19"
                viewBox="0 0 19 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="..." fill="#2EB97E" />
              </svg>
              <a href="#0">{blog.category_name}</a>
            </li>
          </ul>
          <h3>
            <a href={`/bai-viet/${blog.id}`} className="primary-hover">
              {blog.title}
            </a>
          </h3>
          <a className="mt-15 read-more-btn" href={`/bai-viet/${blog.id}`}>
            Đọc thêm <i className="fa-regular fa-arrow-right-long"></i>
          </a>
        </div>
      </div>
    </div>
  );
};
