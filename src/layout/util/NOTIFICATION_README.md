# Hệ thống Thông báo (Notification System)

Đây là một hệ thống thông báo tập trung cho ứng dụng TMS Learn Tech. Hệ thống này cho phép hiển thị thông báo từ bất kỳ đâu trong ứng dụng, cả trong và ngoài React components.

## Cấu trúc

Hệ thống thông báo bao gồm các thành phần sau:

1. **NotificationContext.tsx**: Context React để quản lý trạng thái thông báo và cung cấp hook `useNotification`.
2. **notificationService.ts**: Service singleton để quản lý thông báo từ bất kỳ đâu trong ứng dụng.
3. **Notification.tsx**: Component React để hiển thị thông báo từ component khác.
4. **NotificationExample.tsx**: Component ví dụ về cách sử dụng hệ thống thông báo.

## Cách sử dụng

### 1. Trong React Components

Sử dụng hook `useNotification` để hiển thị thông báo:

```tsx
import { useNotification } from '../util/NotificationContext';

const MyComponent = () => {
  const { showNotification } = useNotification();
  
  const handleClick = () => {
    showNotification('Thao tác thành công!', 'success');
  };
  
  return (
    <button onClick={handleClick}>Thực hiện</button>
  );
};
```

### 2. Từ bất kỳ đâu (kể cả ngoài React components)

Sử dụng các hàm tiện ích từ `notificationService`:

```tsx
import { showSuccess, showError } from '../util/notificationService';

// Trong một hàm bất kỳ
function handleApiSuccess() {
  showSuccess('Dữ liệu đã được lưu thành công!');
}

function handleApiError() {
  showError('Có lỗi xảy ra khi lưu dữ liệu.');
}
```

### 3. Sử dụng component Notification

```tsx
import Notification from '../util/Notification';

const MyComponent = () => {
  return (
    <div>
      {/* Hiển thị thông báo ngay khi component được render */}
      <Notification 
        message="Chào mừng đến với ứng dụng!" 
        type="info" 
        autoShow={true} 
      />
      
      {/* Nội dung khác */}
    </div>
  );
};
```

## Các loại thông báo

Hệ thống hỗ trợ 4 loại thông báo:

1. **success**: Thông báo thành công (màu xanh lá)
2. **error**: Thông báo lỗi (màu đỏ)
3. **warning**: Thông báo cảnh báo (màu vàng)
4. **info**: Thông báo thông tin (màu xanh dương)

## Tùy chỉnh

Bạn có thể tùy chỉnh thời gian hiển thị thông báo bằng tham số `duration` (đơn vị: milliseconds):

```tsx
showNotification('Thông báo này sẽ hiển thị trong 10 giây', 'info', 10000);
```

hoặc

```tsx
showSuccess('Thông báo thành công kéo dài', 10000);
```

## Cài đặt

Hệ thống thông báo đã được cài đặt trong `App.tsx` với `NotificationProvider` bao quanh toàn bộ ứng dụng:

```tsx
function App() {
  return (
    <NotificationProvider>
      {/* Nội dung ứng dụng */}
    </NotificationProvider>
  );
}
```

## Ví dụ

Xem component `NotificationExample.tsx` để biết thêm các ví dụ về cách sử dụng hệ thống thông báo. 