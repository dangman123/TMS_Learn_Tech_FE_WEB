import React, { useEffect, useState } from 'react';
import RequireAdmin from '../DOM/RequireAdmin';

const GeneralDocuments: React.FC = () => {
    const [documents, setDocuments] = useState<{ id: number; title: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        const fetchGeneralDocuments = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/general-document2?idCategory=7&level=3`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Fetched data:", data); // Log dữ liệu phản hồi để kiểm tra cấu trúc

                // Chuyển đổi cấu trúc dữ liệu thành đối tượng có id và title
                const formattedData = data.map((item: any[]) => ({
                    id: item[0],
                    title: item[1],
                }));

                console.log("Formatted data:", formattedData); // Log dữ liệu đã định dạng

                setDocuments(formattedData);
            } catch (error: any) {
                console.error("Error fetching general documents:", error);
                setError(error.message || 'Failed to fetch documents');
            } finally {
                setLoading(false);
            }
        };

        fetchGeneralDocuments();
    }, []);

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>Lỗi: {error}</p>;

    return (
        <div>
            <h2>Tài liệu chung</h2>
            <ul>
                {documents.map(doc => (
                    <li key={doc.id}>{doc.title}</li>
                ))}
            </ul>
        </div>
    );
};



const Test_Admin22 = RequireAdmin(GeneralDocuments);

export default Test_Admin22;
