import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./list.css";

export default function List() {
  const [sortType, setSortType] = useState("status");
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

  const sortedAudits = [...audits].sort((a, b) => {
    if (sortType === "status") {
      return a[sortType] === b[sortType] ? 0 : a[sortType] === "Ongoing" ? -1 : 1;
    } else if (sortType === "start" || sortType === "end") {
      return a[sortType].localeCompare(b[sortType]);
    }
    return 0;
  });

  if (loading) return <div className="list-container">loading...</div>;
  if (error) return <div className="list-container">error : {error}</div>;

  return (
    <div className="list-container">
      <h2>All audits</h2>
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
          {sortedAudits.map((audit) => (
            <tr key={audit._id} onClick={() => navigate(`/audit/${audit._id}`)}>
              <td>{audit.type}</td>
              <td>{audit.objective}</td>
              <td>{new Date(audit.startDate).toLocaleDateString()}</td>
              <td>{new Date(audit.endDate).toLocaleDateString()}</td>
              <td className={`status ${
  audit.status === "Ongoing"
    ? "ongoing"
    : audit.status === "Completed"
    ? "completed"
    : "pending"
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
