import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./sidebar.css";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          <li className="disabled">Services</li>
          <li>
            <div 
              className="menu-toggle" 
              onClick={() => setIsOpen(!isOpen)}
            >
              <span>Audit Management</span>
              <span className={`triangle ${isOpen ? 'up' : 'down'}`}>▼</span>
            </div>
            {isOpen && (
              <ul className="submenu">
                <li>
                  <Link to="/audits">Audit List</Link>
                </li>
                <li>
                  <Link to="/audits/create">Create Audit</Link>
                </li>
                <li>
                  <Link to="/audits/reporting">Reporting</Link>
                </li>
                <li>
                  <Link to="/audit-history">Audit History</Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}
