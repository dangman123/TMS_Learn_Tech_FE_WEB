import React, { useState, useEffect } from 'react';

interface CourseSearchProps {
  onSearch: (searchTerm: string) => void;
}

const CourseSearch: React.FC<CourseSearchProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isTyping) {
        onSearch(searchTerm);
        setIsTyping(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, isTyping, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsTyping(true);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="course-search-wrapper">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Tìm kiếm nội dung..."
          value={searchTerm}
          onChange={handleChange}
          className="course-search-input"
        />
        {searchTerm && (
          <button className="search-clear-button" onClick={handleClear}>
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseSearch; 