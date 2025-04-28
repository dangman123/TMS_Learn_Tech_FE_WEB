import React from "react";
import { NavLink } from "react-router-dom";

function Top_Header() {
  return (
    <div className="header-top-area d-none d-lg-block">
      <div className="header__container">
        <div className="header-top__wrp">
          <ul className="socila-link">
            <li>
              <a
                href="mailto:hotrokhotrithucso@gmail.com"
                rel="nofollow"
                className="text-white"
              >
                <i className="fa fa-envelope mr-1"></i> tms@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:0396668157" rel="nofollow" className="text-white">
                <i className="fa fa-phone mr-1"></i> <b>0365683018</b> (zalo)
              </a>
            </li>

            {/* <li className="text-white">
              <a href="/tai-khoan">
                <i className="fa-solid fa-user"></i> Tài Khoản
              </a>
            </li>
            <li className="text-white">
              <a href="/gio-hang">
                <i className="fa-solid fa-cart-shopping"></i> Giỏ hàng
              </a>
            </li> */}
            {/* <li className="text-white">
              <a href="/ranking">
                <i className="fa-solid fa-trophy"></i> Top Xếp Hạng
              </a>
            </li> */}
          </ul>
        </div>
      </div>
    </div>
  );
}
export default Top_Header;
