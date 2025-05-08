import React, { useState } from "react";

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
    <div className="row fillter-history">
      <div className="col-md-12">
        <div className="row fillter-history-time">
          <div className="col-md-6 mb-2 test-history-search">
            <div className="row g-2">
              <div className="col-md-10">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm tên tài liệu..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div className="col-md-2">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleSearch}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-2 test-history-filter">
            <div className="row g-2">
              <div className="col-md-6">
                <select
                  className="form-select"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                >
                  <option value="5">5 tài liệu / trang</option>
                  <option value="10">10 tài liệu / trang</option>
                  <option value="20">20 tài liệu / trang</option>
                  <option value="50">50 tài liệu / trang</option>
                </select>
              </div>
              <div className="col-md-6">
                <select
                  className="form-select"
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
    </div>
  );
};

export default DocumentHistoryNav;
