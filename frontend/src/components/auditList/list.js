import React, { useState, useEffect } from "react";
import "./list.css";

export default function List() {
  const [sortType, setSortType] = useState("status"); 
  const [audits, setAudits] = useState([]); // State to store fetched audits
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
//get mtaa auditds
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/audit/");
        if (!response.ok) {
          throw new Error("Failed to fetch audits");
        }
        const data = await response.json();
        setAudits(data);
      } catch (error) {
        setError(error.message); 
      } finally {
        setLoading(false); 
      }
    };

    fetchAudits();
  }, []); 


  const sortedAudits = [...audits].sort((a, b) => {
    if (sortType === "status") {
      return a[sortType] === b[sortType] ? 0 : a[sortType] === "Ongoing" ? -1 : 1;
    } else if (sortType === "start" || sortType === "end") {

      return a[sortType].localeCompare(b[sortType]);
    }
    return 0;
  });

  if (loading) {
    return <div className="list-container">Loading...</div>;
  }

  if (error) {
    return <div className="list-container">Error: {error}</div>;
  }

  return (
    <div className="list-container">
      <div className="list-header">
        <h2>Audit List</h2>
        <div className="sort-buttons">
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
              <td>{new Date(audit.startDate).toLocaleDateString()}</td>
              <td>{new Date(audit.endDate).toLocaleDateString()}</td>
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