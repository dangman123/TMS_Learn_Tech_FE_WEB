import React, { useState } from "react";

interface NavSearchMainProps {
  onSearch: (searchTerm: string, type: string, category1: string, category2: string, category3: string) => void;
}

const NavSearchMain: React.FC<NavSearchMainProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("tailieu");
  const [category1, setCategory1] = useState("");
  const [category2, setCategory2] = useState("");
  const [category3, setCategory3] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(searchTerm, activeTab, category1, category2, category3);
  };

  return (
    <div className="card mb-1">
      <div className="card-header">
        <div className="tab-container">
          <button
            className={`tab ${activeTab === "tailieu" ? "active" : ""}`}
            onClick={() => setActiveTab("tailieu")}
          >
            Tài liệu
          </button>
          <button
            className={`tab ${activeTab === "khoahoc" ? "active" : ""}`}
            onClick={() => setActiveTab("khoahoc")}
          >
            Khóa học
          </button>
        </div>
      </div>
      <div className="card-body widget-spec">
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-group row" style={{ display: "flex", alignItems: "center" }}>
            <div className="col-sm-5" style={{ flex: activeTab === "tailieu" ? 5 : 10 }}>
              <input
                type="text"
                name="key_search"
                className="border form-control"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={`Nhập từ khóa tìm kiếm trong ${activeTab === "tailieu" ? "Tài liệu" : "Khóa học"}...`}
              />
            </div>
            
            {activeTab === "tailieu" ? (
              <>
                <div className="col-sm-2" style={{ flex: 2 }}>
                  <select className="form-control" value={category1} onChange={(e) => setCategory1(e.target.value)}>
                    <option value="">Chọn danh mục 1</option>
                    <option value="danhmuc1-1">Danh mục 1-1</option>
                    <option value="danhmuc1-2">Danh mục 1-2</option>
                  </select>
                </div>
                <div className="col-sm-2" style={{ flex: 2 }}>
                  <select className="form-control" value={category2} onChange={(e) => setCategory2(e.target.value)}>
                    <option value="">Chọn danh mục 2</option>
                    <option value="danhmuc2-1">Danh mục 2-1</option>
                    <option value="danhmuc2-2">Danh mục 2-2</option>
                  </select>
                </div>
                <div className="col-sm-2" style={{ flex: 2 }}>
                  <select className="form-control" value={category3} onChange={(e) => setCategory3(e.target.value)}>
                    <option value="">Chọn danh mục 3</option>
                    <option value="danhmuc3-1">Danh mục 3-1</option>
                    <option value="danhmuc3-2">Danh mục 3-2</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="col-sm-2" style={{ flex: 2 }}>
                <select className="form-control" value={category1} onChange={(e) => setCategory1(e.target.value)}>
                  <option value="">Chọn danh mục</option>
                  <option value="khoahoc1">Khóa học 1</option>
                  <option value="khoahoc2">Khóa học 2</option>
                </select>
              </div>
            )}
            <div className="col-sm-1" style={{ flex: 1 }}>
              <div className="row_search_button">
                <button type="submit" className="btn btn-secondary">
                  Tìm
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NavSearchMain;
