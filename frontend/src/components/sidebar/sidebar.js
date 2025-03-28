import React, { useState } from "react";
import { FaTachometerAlt, FaClipboardList, FaCalendarAlt, FaHistory, FaChevronRight, FaChevronDown, FaTasks } from "react-icons/fa"; // Ajout de l'icône FaTasks
import { Link } from "react-router-dom";
import "./sidebar.css";

export default function Sidebar() {
  const [isAuditListOpen, setIsAuditListOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);

  const toggleAuditList = () => {
    setIsAuditListOpen(!isAuditListOpen);
  };

  const toggleDashboard = () => {
    setIsDashboardOpen(!isDashboardOpen);
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
            <li className={`${isDashboardOpen ? 'active' : ''}`} onClick={toggleDashboard}>
              <Link to="/dashboard" className="nav-link">
                <FaTachometerAlt className="nav-icon" />
                <span>Dashboard</span>
                {isDashboardOpen ? (
                  <FaChevronDown className="nav-arrow" />
                ) : (
                  <FaChevronRight className="nav-arrow" />
                )}
              </Link>
            </li>
          </ul>
        </div>

        <div className="nav-section">
        
          <h3 className="nav-title" onClick={toggleAuditList}>
            <div className="nav-link">
              <FaTasks className="nav-icon" /> 
              <span>Audit Management</span>
              {isAuditListOpen ? (
                <FaChevronDown className="nav-arrow" />
              ) : (
                <FaChevronRight className="nav-arrow" />
              )}
            </div>
          </h3>
          
         
          {isAuditListOpen && (
            <ul>
              <li className="dropdown-item">
                <Link to="/audits" className="nav-link">
                  <FaClipboardList className="nav-icon" />
                  <span>Audit List</span>
                </Link>
              </li>
              <li className="dropdown-item">
                <Link to="/calendar" className="nav-link">
                  <FaCalendarAlt className="nav-icon" />
                  <span>Calendar</span>
                </Link>
              </li>
              <li className="dropdown-item">
                <Link to="/audit-history" className="nav-link">
                  <FaHistory className="nav-icon" />
                  <span>Audit History</span>
                </Link>
              </li>
            </ul>
          )}
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
