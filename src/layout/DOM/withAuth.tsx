import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const navigate = useNavigate();

    // useEffect(() => {
    //   const token = localStorage.getItem('authToken');
    //   // if (!token) {
    //   //    navigate('/dang-nhap');
    //   // }
    // }, [navigate]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
