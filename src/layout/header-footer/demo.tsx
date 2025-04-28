import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
  level: number;
  category?: {
    id: number;
    name: string;
  };
}

const Header11: React.FC = () => {
  const [level1Categories, setLevel1Categories] = useState<Category[]>([]);

  useEffect(() => {
    // Giả sử bạn đã lấy dữ liệu từ API và set vào state
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/categories/level1`);
        setLevel1Categories(response.data);
      } catch (error) {
        console.error('Error fetching level 1 categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <h1>Danh mục cấp 1</h1>
      <ul>
        {level1Categories.map(category => (
          <li key={category.id}>
            <a href={`/category/${category.id}`}>{category.name}</a>

            <p>ID: {category.id}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Header11;
