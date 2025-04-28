import React, {
  ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
// import Top_Header from "../header-footer/Top_Header";
// import Header from "../header-footer/Header";
// import Footer from "../header-footer/Footer";
// import Scroll from "../util/Scroll";
import { ToastContainer } from "react-toastify";
import "./main.css";
import { onDisconnect, ref, set } from "firebase/database";
import { database } from "../util/fucntion/firebaseConfig";
import { useLoading } from "../util/LoadingContext";
import Spinner from "../util/Spinner";

const Top_Header = React.lazy(() => import("../header-footer/Top_Header"));
const Header = React.lazy(() => import("../header-footer/Header"));
const Footer = React.lazy(() => import("../header-footer/Footer"));
const Scroll = React.lazy(() => import("../util/Scroll"));
interface MainLayoutProps {
  children: ReactNode;
}
const styles = {
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f0f0f0",
  },
  loadingICON: {
    width: "100px",
    height: "100px",
    animation: "spin 1s linear infinite", // Hiệu ứng xoay
  },
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { startLoading, stopLoading } = useLoading();
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const getUserData = () => {
    const authData = localStorage.getItem("authData");
    return authData ? JSON.parse(authData) : null;
  };
  const user = useMemo(() => getUserData(), []);

  useEffect(() => {
    const userId = user?.id;
    if (userId) {
      const statusRef = ref(database, `users/${userId}/status`);
      set(statusRef, "online");
      onDisconnect(statusRef).set("offline");

      return () => {
        set(statusRef, "offline");
      };
    }
  }, [user]);
  const [showSpinner, setShowSpinner] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(false);
    }, 800);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {showSpinner && (
        <div className="overlay main-all">
          <div className="loader main"></div>
        </div>
      )}
      <ToastContainer />

      <Spinner />
      <Top_Header />
      <header
        className="header-area"
        style={{ boxShadow: "0 4px 10px rgb(175 175 175 / 50%)" }}
      >
        <Header />
      </header>
      <main>{children}</main>
      <Footer />
      <Scroll />
    </div>
    // <Suspense fallback={<div className="loader"></div>}>
    //   <div>
    //     <ToastContainer />
    //     <Top_Header />
    //     <header
    //       className="header-area"
    //       style={{ boxShadow: "0 4px 10px rgb(175 175 175 / 50%)" }}
    //     >
    //       <Header />
    //     </header>
    //     <main>{children}</main>
    //     <Footer />
    //     <Scroll />
    //   </div>
    // </Suspense>
  );
};

export default MainLayout;
