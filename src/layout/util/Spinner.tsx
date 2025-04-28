import React from "react";
import { useLoading } from "./LoadingContext";
import "./Spinner.css";
const Spinner = () => {
  const { loading } = useLoading();

  if (!loading) return null;

  return <div className="loader"></div>;
};

export default Spinner;
