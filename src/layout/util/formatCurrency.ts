// src/utils/formatCurrency.ts
export const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
  };
  