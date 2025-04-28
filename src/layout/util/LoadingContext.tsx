import React, { createContext, useState, useContext, ReactNode } from 'react';

// Tạo context để quản lý trạng thái loading
const LoadingContext = createContext<any>(null);

// Tạo provider để quản lý loading
export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);

  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ loading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Custom hook để sử dụng trong các component
export const useLoading = () => useContext(LoadingContext);
