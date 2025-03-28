import React, { useState } from "react";
import { FaTachometerAlt, FaClipboardList, FaCalendarAlt, FaChevronRight, FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./sidebar.css";

export default function Sidebar() {
  const [isAuditListOpen, setIsAuditListOpen] = useState(false);

  const toggleAuditList = () => {
    setIsAuditListOpen(!isAuditListOpen);
  };

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
            <li className={`${isAuditListOpen ? 'active' : ''}`} onClick={toggleAuditList}>
            <Link to="/audits" className="nav-link">
              <FaClipboardList className="nav-icon" />
              <span>Audit List</span>
              {isAuditListOpen ? (
                <FaChevronDown className="nav-arrow" />
              ) : (
                <FaChevronRight className="nav-arrow" />
              )}
              </Link>
            </li>
            {isAuditListOpen && (
              <li className="dropdown-item">
                <Link to="/calendar" className="nav-link">
                  <FaCalendarAlt className="nav-icon" />
                  <span>Calendar</span>
                </Link>
              </li>
            )}
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