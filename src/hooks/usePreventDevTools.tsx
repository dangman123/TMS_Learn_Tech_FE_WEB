import { useEffect } from 'react';

/**
 * Hook ngăn chặn sử dụng DevTools và F12
 * @param message Thông báo cảnh báo khi người dùng cố gắng mở DevTools
 */
const usePreventDevTools = (message: string = "Không được phép sử dụng công cụ phát triển trong quá trình làm bài!") => {
  useEffect(() => {
    // Biến để theo dõi nếu DevTools đang mở
    let devToolsOpened = false;

    // 1. Ngăn chặn F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        // F12
        e.key === "F12" ||
        // Ctrl+Shift+I hoặc Ctrl+Shift+J hoặc Ctrl+Shift+C
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        // Command+Option+I (Mac)
        (e.metaKey && e.altKey && e.key === "I") ||
        // Command+Option+J (Mac)
        (e.metaKey && e.altKey && e.key === "J") ||
        // Command+Option+C (Mac)
        (e.metaKey && e.altKey && e.key === "C")
      ) {
        e.preventDefault();
        alert(message);
        return false;
      }
    };

    // 2. Ngăn chặn menu chuột phải
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 3. Phát hiện kích thước cửa sổ thay đổi (có thể do DevTools mở)
    const detectDevTools = () => {
      const threshold = 160;
      
      // Khi cửa sổ bị resize do DevTools mở
      if (
        (window.outerWidth - window.innerWidth > threshold) ||
        (window.outerHeight - window.innerHeight > threshold)
      ) {
        if (!devToolsOpened) {
          devToolsOpened = true;
          alert(message);
        }
      } else {
        devToolsOpened = false;
      }
    };

    // 4. Bắt lỗi trên console để phát hiện DevTools
    const consoleHooks = [
      'log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 
      'dirxml', 'trace', 'group', 'groupCollapsed', 'groupEnd', 
      'time', 'timeEnd', 'profile', 'profileEnd', 'count'
    ];

    consoleHooks.forEach((hook) => {
      console[hook as keyof Console] = (function() {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return function() {};
      })() as any;
    });

    // 5. Ngăn chặn việc copy-paste
    const preventCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Đăng ký các sự kiện
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('resize', detectDevTools);
    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('cut', preventCopyPaste);

    // Kiểm tra mỗi 1 giây
    const interval = setInterval(detectDevTools, 1000);

    // Thêm vào thẻ head để ngăn chặn kéo thả phần tử
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-drag: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      input, textarea {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
    `;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', detectDevTools);
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('cut', preventCopyPaste);
      clearInterval(interval);
      document.head.removeChild(style);
    };
  }, [message]);
};

export default usePreventDevTools; 