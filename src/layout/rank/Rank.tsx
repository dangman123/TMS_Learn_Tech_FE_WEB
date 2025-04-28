import React from "react";
import { Link } from "react-router-dom";
import "./style.css"
import { AlignCenter } from "react-bootstrap-icons";
function Rank() {
  return (
    <div className="container">
      <div>
        <h1 className="ranking_title">Ranking</h1>
      </div>
      
      <table className="table-ranking">
        <thead className="ranking-top">
          <tr>
            <th>Hạng</th>
            <th>Tên tài khoản</th>
            <th>Điểm</th>
          </tr>
        </thead>
        <tbody className="ranking-body">
          <tr>
            <td>1</td>
            <td>Trần Ngọc Thanh Sơn</td>
            <td>15222</td>
          </tr>
          <tr>
            <td>1</td>
            <td>Trần Ngọc Thanh Sơn</td>
            <td>15222</td>
          </tr>
          <tr>
            <td>1</td>
            <td>Trần Ngọc Thanh Sơn</td>
            <td>15222</td>
          </tr>
          <tr>
            <td>1</td>
            <td>Trần Ngọc Thanh Sơn</td>
            <td>15222</td>
          </tr>
          <tr>
            <td>1</td>
            <td>Trần Ngọc Thanh Sơn</td>
            <td>15222</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export default Rank;
