import React, { useEffect, useState } from "react";
import { decryptData, encryptData } from "./encryption";

const DemoEcrypt = () => {
    const [id, setId] = useState<string | null>(null);

    useEffect(() => {
        // Gán trực tiếp id = 3 và lưu vào localStorage
        const assignedId = "3";
        const encryptedData = encryptData(assignedId);
        localStorage.setItem("encryptedId", encryptedData);
        setId(assignedId);
    }, []);
    const storedEncryptedData = localStorage.getItem("encryptedId");

    if (storedEncryptedData) {
        // Giải mã dữ liệu
        const decryptedData = decryptData(storedEncryptedData);
        console.log("Dữ liệu đã giải mã:", decryptedData);
    } else {
        console.log("Không có dữ liệu đã mã hóa trong localStorage");
    }
    return (
        <div>
            <h1>ID đã lưu: {id}</h1>
        </div>
    );
};

export default DemoEcrypt;
