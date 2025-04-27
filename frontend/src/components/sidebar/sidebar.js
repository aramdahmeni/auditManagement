import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaCalendarAlt,
  FaHistory,
  FaChevronRight,
  FaChevronDown,
  FaFileAlt
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import "./sidebar.css";

export default function Sidebar() {
  const location = useLocation();

  const [isQuickAccessOpen, setQuickAccessOpen] = useState(true);
  const [isAuditMenuOpen, setAuditMenuOpen] = useState(true);
  const [isLogsMenuOpen, setLogsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <h2>Audit System</h2>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {/* Quick Access */}
        <div className="nav-section">
          <h3
            className="nav-title"
            onClick={() => setQuickAccessOpen(!isQuickAccessOpen)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <span>Quick Access</span>
            {isQuickAccessOpen ? <FaChevronDown /> : <FaChevronRight />}
          </h3>
          {isQuickAccessOpen && (
            <ul>
              <li className={isActive("/") ? "active" : ""}>
                <Link to="/" className="nav-link">
                  <FaTachometerAlt className="nav-icon" />
                  <span>Dashboard</span>
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Audit Management */}
        <div className="nav-section">
          <h3
            className="nav-title"
            onClick={() => setAuditMenuOpen(!isAuditMenuOpen)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <span>Audit Management</span>
            {isAuditMenuOpen ? <FaChevronDown /> : <FaChevronRight />}
          </h3>
          {isAuditMenuOpen && (
            <ul>
              <li className={isActive("/audits") ? "active" : ""}>
                <Link to="/audits" className="nav-link">
                  <FaClipboardList className="nav-icon" />
                  <span>Audits</span>
                </Link>
              </li>
              <li className={isActive("/calendar") ? "active" : ""}>
                <Link to="/calendar" className="nav-link">
                  <FaCalendarAlt className="nav-icon" />
                  <span>Audit Calendar</span>
                </Link>
              </li>
              <li className={isActive("/audit-history") ? "active" : ""}>
                <Link to="/audit-history" className="nav-link">
                  <FaHistory className="nav-icon" />
                  <span>Audit History</span>
                </Link>
              </li>
            </ul>
          )}
        </div>

        {/* Logs */}
        <div className="nav-section">
          <h3
            className="nav-title"
            onClick={() => setLogsMenuOpen(!isLogsMenuOpen)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <span>Logs</span>
            {isLogsMenuOpen ? <FaChevronDown /> : <FaChevronRight />}
          </h3>
          {isLogsMenuOpen && (
            <ul>
              <li className={isActive("/action-logs") ? "active" : ""}>
                <Link to="/action-logs" className="nav-link">
                  <FaFileAlt className="nav-icon" />
                  <span>Action Logs</span>
                </Link>
              </li>
            </ul>
          )}
        </div>
      </nav>

      {/* Footer */}
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
