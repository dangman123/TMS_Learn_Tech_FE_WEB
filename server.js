const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Cấu hình Express để phục vụ các file tĩnh từ thư mục build
app.use(express.static(path.join(__dirname, 'build')));

// Tất cả các yêu cầu khác sẽ được chuyển đến file index.html trong build
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Lắng nghe trên cổng đã chỉ định
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
