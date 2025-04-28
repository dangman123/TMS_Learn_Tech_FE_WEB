import CryptoJS from 'crypto-js';

const secretKey = '13092003';

export const encryptData = (data: any): string => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

// Hàm giải mã dữ liệu
export const decryptData = (cipherText: string): any => {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
