# Sử dụng Node.js làm môi trường runtime
FROM node:18-alpine
WORKDIR /app

# Copy file package.json và cài đặt dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy toàn bộ mã nguồn vào container
COPY . .

# Mở cổng 3000 để chạy React Dev Server
EXPOSE 3000

# Chạy ứng dụng ở chế độ development
CMD ["npm", "start"]
