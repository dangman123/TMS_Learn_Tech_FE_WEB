import React, { useState } from "react";
import styles from "./documentHistoryNav.module.css";

interface DocumentHistoryNavProps {
  onSearch: (keyword: string) => void;
  size: number;
  setSize: (size: number) => void;
  onFilterByTime: (filter: string) => void;
}

const DocumentHistoryNav: React.FC<DocumentHistoryNavProps> = ({
  onSearch,
  size,
  setSize,
  onFilterByTime,
}) => {
  const [searchInput, setSearchInput] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = () => {
    onSearch(searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterRow}>
        <div className={styles.filterCol}>
          <label className={styles.filterLabel}>Tìm kiếm tài liệu</label>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Nhập tên tài liệu cần tìm..."
              value={searchInput}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
            />
            <button
              className={styles.searchButton}
              onClick={handleSearch}
              title="Tìm kiếm"
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
        <div className={styles.filterCol}>
          <div className={styles.filterControls}>
            <div className="w-100">
              <label className={styles.filterLabel}>Hiển thị</label>
              <select
                className={styles.selectControl}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              >
                <option value="5">5 tài liệu / trang</option>
                <option value="10">10 tài liệu / trang</option>
                <option value="20">20 tài liệu / trang</option>
                <option value="50">50 tài liệu / trang</option>
              </select>
            </div>
            <div className="w-100">
              <label className={styles.filterLabel}>Khoảng thời gian</label>
              <select
                className={styles.selectControl}
                onChange={(e) => onFilterByTime(e.target.value)}
                defaultValue="year"
              >
                <option value="today">Hôm nay</option>
                <option value="lastday">Hôm qua</option>
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
                <option value="year">365 ngày qua</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentHistoryNav;
