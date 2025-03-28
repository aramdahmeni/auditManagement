import React from "react";
import { FaTachometerAlt, FaClipboardList, FaChevronRight } from "react-icons/fa";
import "./sidebar.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Audit System</h2>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3 className="nav-title">Quick Access</h3>
          <ul>
            <li>
              <FaTachometerAlt className="nav-icon" />
              <span>Dashboard</span>
              <FaChevronRight className="nav-arrow" />
            </li>
          </ul>
        </div>
        
        <div className="nav-section">
          <h3 className="nav-title">Services</h3>
          <ul>
            <li className="active">
              <FaClipboardList className="nav-icon" />
              <span>Audit List</span>
              <FaChevronRight className="nav-arrow" />
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">AD</div>
          <div className="user-info">
            <span className="username">Admin User</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
