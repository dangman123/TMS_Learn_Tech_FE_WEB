import React from "react";
import "./ranking.css";

const Ranking = () => {
  const rankings = [
    { rank: 1, name: "Sasmita Sara", points: 281, avatar: "S" },
    { rank: 2, name: "greeshma vejendla", points: 281, avatar: "G" },
    { rank: 3, name: "Jann", points: 248, avatar: "👩" },
    { rank: 4, name: "lily", points: 235, avatar: "👧" },
    {
      rank: 5,
      name: "Thiago Benítez",
      points: 232,
      avatar: "👨‍🎓",
      badge: "100",
    },
    { rank: 6, name: "tu.8zPhLefYobYPB", points: 198, avatar: "T" },
    { rank: 7, name: "zvflcZ8U", points: 182, avatar: "Z" },
    { rank: 8, name: "arif", points: 173, avatar: "A" },
    { rank: 9, name: "Mohtashim khan", points: 152, avatar: "M" },
    { rank: 10, name: "Lasata Bajracharya", points: 149, avatar: "L" },
    { rank: 11, name: "Hihihi", points: 149, avatar: "👨‍🎓" },
  ];

  return (
    <div className="ranking-container">
      <div className="ranking-header">
        <div className="ranking-badge">
          <img src="https://d35aaqx5ub95lt.cloudfront.net/images/leagues/192181672ada150becd83a74a4266ae9.svg" />
        </div>
        <h1 className="ranking-title">Giải đấu Đồng</h1>
        <p className="ranking-subtitle">
          Top 15 sẽ được thăng hạng lên giải đấu cao hơn
        </p>
        <p className="ranking-timer">3 ngày</p>
      </div>
      <div className="ranking-list">
        {rankings.map((user) => (
          <div className="ranking-item" key={user.rank}>
            <div className="ranking-rank">
              {user.rank === 1 && (
                <img
                  src="https://d35aaqx5ub95lt.cloudfront.net/images/leagues/9e4f18c0bc42c7508d5fa5b18346af11.svg"
                  alt="Rank 1"
                  className="rank-icon"
                />
              )}
              {user.rank === 2 && (
                <img
                  src="https://d35aaqx5ub95lt.cloudfront.net/images/leagues/cc7b8f8582e9cfb88408ab851ec2e9bd.svg"
                  alt="Rank 2"
                  className="rank-icon"
                />
              )}
              {user.rank === 3 && (
                <img
                  src="https://d35aaqx5ub95lt.cloudfront.net/images/leagues/eef523c872b71178ef5acb2442d453a2.svg"
                  alt="Rank 3"
                  className="rank-icon"
                />
              )}
              {user.rank > 3 && <span>{user.rank}</span>}
            </div>
            <div className="ranking-avatar">
              <span className="avatar">{user.avatar}</span>
              {user.badge && <span className="badge">{user.badge}</span>}
            </div>
            <div className="ranking-name">{user.name}</div>
            <div className="ranking-points">{user.points} KN</div>
          </div>
        ))}
      </div>
      {/* Nhóm thăng hạng */}
      <div className="promotion-group">
        <p className="promotion-title">
          <img
            src="https://d35aaqx5ub95lt.cloudfront.net/images/leagues/577cf633b59ce72791f725d0cb973061.svg"
            alt="Arrow Up"
            className="arrow-up-icon"
          />
          NHÓM THĂNG HẠNG
          <img
            src="https://d35aaqx5ub95lt.cloudfront.net/images/leagues/577cf633b59ce72791f725d0cb973061.svg"
            alt="Arrow Up"
            className="arrow-up-icon"
          />
        </p>
        <div className="promotion-list">
          {[
            { rank: 16, name: "Halululu", points: 15, avatar: "👨‍🎓" },
            { rank: 17, name: "Shranya", points: 15, avatar: "👩" },
            { rank: 18, name: "zin", points: 14, avatar: "👩‍🎓" },
            { rank: 19, name: "quintin", points: 10, avatar: "👓" },
            { rank: 20, name: "man", points: 5, avatar: "M" },
          ].map((user) => (
            <div
              className={`ranking-item ${
                user.name === "man" ? "current-user" : ""
              }`}
              key={user.rank}
            >
              <div className="ranking-rank">
                <span>{user.rank}</span>
              </div>
              <div className="ranking-avatar">
                <span className="avatar">{user.avatar}</span>
              </div>
              <div className="ranking-name">{user.name}</div>
              <div className="ranking-points">{user.points} KN</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ranking;
