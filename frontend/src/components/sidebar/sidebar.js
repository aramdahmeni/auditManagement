import React from "react";
import "./sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h2>Quick Access</h2>
      <nav>
        <ul>
          <li>Dashboard</li>
        </ul>
      </nav>
      <h2>Services</h2>
      <nav>
        <ul>
          <li className="active">Audit List</li>
        </ul>
      </nav>
    </aside>
  );
}