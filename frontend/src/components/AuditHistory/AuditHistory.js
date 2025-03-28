import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuditHistory() {
  const [completedAudits, setCompletedAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompletedAudits = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/audit/");

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des audits.");
        }

        const data = await response.json();
        console.log("Audits récupérés :", data);  // Pour voir la structure exacte

        // Si la structure est correcte, filtrer les audits terminés
        const filteredAudits = data.filter(audit => audit.status === "Completed");
        setCompletedAudits(filteredAudits);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedAudits();
  }, []);

  const handleRowClick = (auditId) => {
    navigate(`/auditcompleted/${auditId}`);
  };

  if (loading) return <div className="list-container">Chargement...</div>;
  if (error) return <div className="list-container">Erreur : {error}</div>;

  return (
    <div className="list-container">
      <h2>Historique des Audits Terminés</h2>
      <table className="audit-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Objectif</th>
            <th>Date de début</th>
            <th>Date de fin</th>
          </tr>
        </thead>
        <tbody>
          {completedAudits.length > 0 ? (
            completedAudits.map((audit) => (
              <tr key={audit._id} onClick={() => handleRowClick(audit._id)}>
                <td>{audit.type}</td>
                <td>{audit.objective}</td>
                <td>{new Date(audit.startDate).toLocaleDateString()}</td>
                <td>{new Date(audit.endDate).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>Aucun audit terminé pour le moment.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
