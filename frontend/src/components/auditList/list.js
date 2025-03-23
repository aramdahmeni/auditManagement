import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./list.css";

export default function List() {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/audit/");
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des audits");
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

  const filteredAudits = audits.filter((audit) => {
    return (
      (statusFilter === "" || audit.status === statusFilter) &&
      (searchTerm === "" ||
        audit.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.startDate.includes(searchTerm) ||
        audit.endDate.includes(searchTerm))
    );
  });

  if (loading) return <div className="list-container">loading...</div>;
  if (error) return <div className="list-container">error : {error}</div>;

  return (
    <div className="list-container">
      <h2>All audits</h2>
      

      <div className="filter-controls">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
        </select>

        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search for a word or a date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <table className="audit-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Objective</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredAudits.map((audit) => (
            <tr key={audit._id} onClick={() => navigate(`/audit/${audit._id}`)}>
              <td>{audit.type}</td>
              <td>{audit.objective}</td>
              <td>{new Date(audit.startDate).toLocaleDateString()}</td>
              <td>{new Date(audit.endDate).toLocaleDateString()}</td>
              <td className={`status ${
                audit.status === "Ongoing" ? "ongoing" :
                audit.status === "Completed" ? "completed" :
                "pending"
              }`}>
                {audit.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
