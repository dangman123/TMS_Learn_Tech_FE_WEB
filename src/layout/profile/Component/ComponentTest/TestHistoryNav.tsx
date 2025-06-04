import React, { useState } from "react";
import styles from "./testHistoryNav.module.css";

interface TestHistoryNavBottomProps {
  onSearch: (keyword: string) => void;
  size: number;
  setSize: (size: number) => void;
  onFilterByTime: (timeFilter: string) => void;
}

export const TestHistoryNav = ({
  onSearch,
  size,
  setSize,
  onFilterByTime,
}: TestHistoryNavBottomProps) => {
  const [searchInput, setSearchInput] = useState("");
  const [selectedTime, setSelectedTime] = useState("year");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setSearchInput(keyword);
    onSearch(keyword);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTime(value);
    onFilterByTime(value); // Gửi giá trị thời gian lên component cha
  };
  
  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterRow}>
        <div className={styles.filterCol}>
          <label className={styles.filterLabel}>Tìm kiếm bài kiểm tra</label>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Nhập tên bài kiểm tra cần tìm..."
              value={searchInput}
              onChange={handleInputChange}
            />
            <button className={styles.searchButton} title="Tìm kiếm">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
        
        <div className={styles.filterCol}>
          <div className={styles.filterControls}>
            <div className="w-100">
              <label className={styles.filterLabel}>Khoảng thời gian</label>
              <select
                className={styles.selectControl}
                value={selectedTime}
                onChange={handleTimeChange}
              >
                <option value="today">Hôm nay</option>
                <option value="lastday">Hôm qua</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm nay</option>
              </select>
            </div>
            
            <div className="w-100">
              <label className={styles.filterLabel}>Hiển thị</label>
              <select
                className={styles.selectControl}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              >
                <option value={10}>10 kết quả / trang</option>
                <option value={20}>20 kết quả / trang</option>
                <option value={30}>30 kết quả / trang</option>
                <option value={50}>50 kết quả / trang</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
