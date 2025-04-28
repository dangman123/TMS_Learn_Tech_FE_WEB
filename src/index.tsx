import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


import 'bootstrap/dist/css/bootstrap.min.css'
import 'animate.css/animate.css';
import "./assets/css/meanmenu.css"
import "./assets/css/nice-select.css"
import "./assets/css/animate.css"
import "./assets/css/all.min.css"
import "./assets/css/swiper-bundle.min.css"
import "./assets/css/magnific-popup.css"

import "./assets/css/style.css"
import 'jquery/dist/jquery.min.js'
import 'bootstrap/dist/js/bootstrap.min.js'
import { ToastContainer } from 'react-bootstrap';
// import { JQuery } from "jquery";
// import "jquery.counterup/jquery.counterup.js";
// import "jquery.counterup/jquery.counterup.min.js";



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
    {/* <ToastContainer/> */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
