import React, { useState } from "react";
import { 
  FaTachometerAlt, 
  FaClipboardList, 
  FaCalendarAlt, 
  FaHistory,
  FaChevronRight, 
  FaChevronDown 
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "./sidebar.css";

export default function Sidebar() {
  const [isAuditMenuOpen, setIsAuditMenuOpen] = useState(false);
  const location = useLocation();

  const toggleAuditMenu = () => setIsAuditMenuOpen(!isAuditMenuOpen);

  // Check active route for styling
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Audit System</h2>
      </div>
      
      <nav className="sidebar-nav">
        {/* Quick Access Section */}
        <div className="nav-section">
          <h3 className="nav-title">Quick Access</h3>
          <ul>
            <li className={isActive('/dashboard') ? 'active' : ''}>
              <Link to="/" className="nav-link">
                <FaTachometerAlt className="nav-icon" />
                <span>Dashboard</span>
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Audit Management Section */}
        <div className="nav-section">
          <h3 className="nav-title">Audit Management</h3>
          <ul>
          <li 
  className={`${isAuditMenuOpen ? 'active' : ''} ${isActive('/audits') ? 'current' : ''}`}
>
  <div className="nav-link" style={{ display: 'flex', alignItems: 'center' }}>
    <Link to="/audits" style={{ flex: 1, display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
      <FaClipboardList className="nav-icon" />
      <span>Audits</span>
    </Link>
    <div onClick={toggleAuditMenu} style={{ cursor: 'pointer', padding: '0 8px' }}>
      {isAuditMenuOpen ? (
        <FaChevronDown className="nav-arrow" />
      ) : (
        <FaChevronRight className="nav-arrow" />
      )}
    </div>
  </div>
</li>
            {/* Dropdown Items */}
            {isAuditMenuOpen && (
              <>
                <li className={`dropdown-item ${isActive('/calendar') ? 'active' : ''}`}>
                <Link to="/calendar" className="nav-link">
                  <FaCalendarAlt className="nav-icon" />
                  <span>Audit Calendar</span>
                </Link>
              </li>
              <li className={`dropdown-item ${isActive('/actionLogList') ? 'active' : ''}`}>
                <Link to="/actionLogList" className="nav-link">
                  <FaCalendarAlt className="nav-icon" />
                  <span>Action Log</span>
                </Link>
              </li>
              </>
            )}
          </ul>
        </div>
      </nav>
      
      {/* User Profile Section */}
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