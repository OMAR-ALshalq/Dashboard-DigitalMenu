// src/components/SidebarContent/SidebarContent.jsx
import { Link, useNavigate } from "react-router-dom";
import { FaBoxOpen } from "react-icons/fa6";
import { BiSolidCategory } from "react-icons/bi";
import { CiLogout } from "react-icons/ci";
import { FaFirstOrderAlt } from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";

import "./SidebarContent.css"
export default function SidebarContent({ onLinkClick }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleClick = () => {
    if (onLinkClick) onLinkClick(); // لإغلاق الستارة عند النقر على رابط
  };

  return (
    <>
      <div className="title-SidBar">
        <h3>DigitalMenu</h3>
      </div>
      <div className="Url-SidBar">
        <div className="box-Url">
          <Link to="/dashbord/products" onClick={handleClick}>
            Products
            <FaBoxOpen className="Url-icon" />
          </Link>
          <Link to="/dashbord/categories" onClick={handleClick}>
            Categories
            <BiSolidCategory className="Url-icon" />
          </Link>
          <Link to="/dashbord/orders" onClick={handleClick}>
            order
            <FaFirstOrderAlt className="Url-icon" />
          </Link>
          <Link to="/dashbord/stats" onClick={handleClick}>
            stats
            <IoStatsChart className="Url-icon"/>
          </Link>
        </div>
      </div>
      <div className="Url-Logout">
        <hr />
        <button onClick={handleLogout} className="logout-btn">
          Logout
          <CiLogout />
        </button>
      </div>
    </>
  );
}
