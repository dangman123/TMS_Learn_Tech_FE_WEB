import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Combo.module.css";

interface Course {
  id: number;
  title: string;
  imageUrl: string;
  price: number;
  cost: number;
  author: string;
  purchased: boolean;
  percentDiscount: number;
  lessonCount: number;
  studentCount: number;
  itemCountReview: number;
  rating: number;
  categoryName: string;
  duration: number;
  type: string;
  level: string;
}

interface CourseBundle {
  id: number;
  name: string;
  description: string;
  price: number;
  cost: number;
  imageUrl: string;
  courses: Course[];
}

interface CourseBundleResponse {
  totalElements: number;
  totalPages: number;
  content: CourseBundle[];
}

const Combo: React.FC = () => {
  const [bundles, setBundles] = useState<CourseBundle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAll, setShowAll] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/course-bundle/public`);

        if (!response.ok) {
          throw new Error("Failed to fetch course bundles");
        }

        const data = await response.json();
        if (data.status === 200 && data.data) {
          setBundles(data.data.content || []);
        }
      } catch (error) {
        console.error("Error fetching course bundles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  const handleBundleClick = (bundleId: number) => {
    navigate(`/combo/${bundleId}`);
  };

  const calculateSavings = (bundle: CourseBundle): number => {
    if (!bundle.courses || bundle.courses.length === 0) return 0;

    // Total cost of individual courses
    const totalIndividualCost = bundle.courses.reduce((sum, course) => sum + course.price, 0);

    // Savings amount
    return totalIndividualCost - bundle.price;
  };

  const calculateSavingsPercentage = (bundle: CourseBundle): number => {
    if (!bundle.courses || bundle.courses.length === 0) return 0;

    // Total cost of individual courses
    const totalIndividualCost = bundle.courses.reduce((sum, course) => sum + course.price, 0);

    // No savings if bundle costs more than individual courses (shouldn't happen but just in case)
    if (totalIndividualCost <= bundle.price) return 0;

    // Calculate percentage
    return Math.round((1 - bundle.price / totalIndividualCost) * 100);
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  if (loading) {
    return <div className={styles["combo-loading"]}>Đang tải gói combo khóa học...</div>;
  }

  if (bundles.length === 0) {
    return null; // Don't render anything if there are no bundles
  }

  // Display only 2 combos or all based on showAll state
  const displayedBundles = showAll ? bundles : bundles.slice(0, 2);

  return (
    <div className={styles["combo-section"]}>
      <div className={styles["combo-header"]}>
        <h2 className={styles["combo-title"]}>Combo Khóa Học</h2>
        <p className={styles["combo-subtitle"]}>Tiết kiệm hơn với các gói combo khóa học</p>
      </div>

      <div className={`${styles["combo-container"]} ${styles["two-column"]}`}>
        {displayedBundles.map((bundle) => (
          <div
            key={bundle.id}
            className={styles["combo-card"]}
            onClick={() => handleBundleClick(bundle.id)}
          >
            <div className={styles["combo-image-container"]}>
              <img src={bundle.imageUrl} alt={bundle.name} className={styles["combo-image"]} />
              <span className={styles["combo-save-badge"]}>Tiết kiệm {calculateSavingsPercentage(bundle)}%</span>
            </div>

            <div className={styles["combo-content"]}>
              <h3 className={styles["combo-name"]}>{bundle.name}</h3>
              <p className={styles["combo-description"]}>{bundle.description}</p>

              <div className={styles["combo-courses-count"]}>
                <i className="fa-solid fa-book-open"></i> {bundle.courses?.length || 0} khóa học
              </div>
              <div className={styles["combo-price-container"]}>
                <span className={styles["combo-price"]}>
                  {bundle.price.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}đ
                </span>
                {bundle.cost > bundle.price && (
                  <span className={styles["combo-original-price"]}>
                    {bundle.cost.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}đ
                  </span>
                )}
              </div>


              <div className={styles["combo-savings"]}>
                Tiết kiệm {calculateSavings(bundle).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}đ
              </div>

              <button className={styles["combo-btn"]}>Xem chi tiết</button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles["combo-show-more"]}>
        <button className={styles["combo-show-more-btn"]} onClick={toggleShowAll}>
          {showAll ? "Thu gọn" : "Xem thêm combo"}
          <i className={`fa-solid ${showAll ? "fa-angle-up" : "fa-angle-down"} ms-2`}></i>
        </button>
      </div>
    </div>
  );
};

export default Combo;
