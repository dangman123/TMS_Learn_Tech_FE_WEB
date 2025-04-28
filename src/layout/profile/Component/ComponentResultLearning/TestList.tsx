import React from "react";
import styles from "./TestList.module.css";

interface TestData {
  id: number;
  title: string;
  score: number;
  status: string;
  date: Date;
}

interface TestListProps {
  tests: TestData[];
}

const TestList: React.FC<TestListProps> = ({ tests }) => {
  return (
    <div className="test-history-result" style={{ height: "400px" }}>
      <h3>Danh sách bài kiểm tra gần đây</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Tên bài kiểm tra</th>
            <th>Điểm</th>
            <th>Trạng thái</th>
            <th>Ngày</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((test) => (
            <tr key={test.id}>
              <td>{test.title}</td>
              <td>{test.score.toFixed(1)}</td>
              <td>{test.status}</td>
              <td>{new Date(test.date).toLocaleDateString('vi-VN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestList;
