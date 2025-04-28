import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Props {
}

interface JwtPayload {
    isAdmin: boolean;
    isTeacher: boolean;
    isUser: boolean;
}

const RequireAdmin = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const WithAdminCheck: React.FC<P> = (props) => {
        const navigate = useNavigate();
        useEffect(() => {
            const token = localStorage.getItem('authToken');         
            if (!token) {
                navigate("/dang-nhap");
                return;
            } else {            
                const decodedToken = jwtDecode(token) as JwtPayload;
                const isAdmin = decodedToken.isAdmin;
                const isTeacher = decodedToken.isTeacher;
                if (!isAdmin && !isTeacher) {
                    navigate("/bao-loi-403");
                    return;
                }
            }
        }, [navigate]);
        return <WrappedComponent {...props} />
    }
    return WithAdminCheck;
}

export default RequireAdmin;