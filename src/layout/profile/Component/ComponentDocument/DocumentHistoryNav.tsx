import React, { useState } from "react";
import "../../style.css";
interface DocumentHistoryNavBottomProps {
  onSearch: (keyword: string) => void;
  size: number;
  setSize: (size: number) => void;
  onFilterByTime: (timeFilter: string) => void;
}
export const DocumentHistoryNav = ({
  onSearch,
  size,
  setSize,
  onFilterByTime,
}: DocumentHistoryNavBottomProps) => {
  const [searchInput, setSearchInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setSearchInput(keyword);
    onSearch(keyword);
  };
  const [selectedTime, setSelectedTime] = useState("year");

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTime(value);
    onFilterByTime(value); // Gửi giá trị thời gian lên component cha
  };
  return (
    <div className="row fillter-history">
      <div className="col-md-8">
        <div className="row">
          <div className="col-md-8 test-history-search">
            <div className="input-group">
              <input
                type="text"
                className="form-control search-bar"
                placeholder="Tìm kiếm"
                value={searchInput}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="col-md-4 test-history-filter">
            <div className="form-group timing-test">
              <select
                className="form-control"
                id="filterByTime"
                value={selectedTime}
                onChange={handleTimeChange} // Lắng nghe sự thay đổi
              >
                <option value="today">Hôm nay</option>
                <option value="lastday">Hôm qua</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm nay</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-4">
        <div className="form-group document-control">
          <label htmlFor="filterByTime">Hiển thị:</label>
          <select
            className="form-control document-show-more"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
};
