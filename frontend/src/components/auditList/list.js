import React, { useState } from "react";
import "./list.css";

const audits = [
  { type: "Compliance", objective: "Ensure IT policies", start: "2025-01-10", end: "2025-01-19", status: "Ongoing" },
  { type: "Security", objective: "Vulnerability check", start: "2024-12-18", end: "2025-01-05", status: "Completed" },
  { type: "Cloud", objective: "Cloud security", start: "2025-01-01", end: "2025-02-01", status: "Completed" }
];

export default function List() {
  const [sortType, setSortType] = useState("status"); // Default sorting by status

  const sortedAudits = [...audits].sort((a, b) => {
    if (sortType === "status") {
      // For status, we want "Ongoing" to come before "Completed"
      return a[sortType] === b[sortType] ? 0 : a[sortType] === "Ongoing" ? -1 : 1;
    } else if (sortType === "start" || sortType === "end") {
      // For start and end dates, compare them lexicographically as strings
      return a[sortType].localeCompare(b[sortType]);
    }
    return 0;
  });

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Audit List</h2>
        <div className="sort-buttons">
          {/* Dropdown for sorting options */}
          <select
            className="sort-dropdown"
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
          >
            <option value="start">Sort by Start Date</option>
            <option value="end">Sort by End Date</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      <table className="audit-table">
        <thead>
          <tr>
            <th>Audit Type</th>
            <th>Objective</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedAudits.map((audit, index) => (
            <tr key={index}>
              <td>{audit.type}</td>
              <td>{audit.objective}</td>
              <td>{audit.start}</td>
              <td>{audit.end}</td>
              <td>
                <span className={`status ${audit.status === "Ongoing" ? "ongoing" : "completed"}`}>
                  {audit.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}