import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function AuditCompletedDetails() {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auditId } = useParams();

  useEffect(() => {
    const fetchAuditDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auditcompleted/${auditId}`);
        
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des détails de l'audit.");
        }

        const data = await response.json();

        if (!data || !data._id) {
          throw new Error("Aucun audit trouvé pour cet ID.");
        }

        setAudit(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditDetails();
  }, [auditId]);

  if (loading) return <div className="details-container">Chargement...</div>;
  if (error) return <div className="details-container">Erreur : {error}</div>;

  return (
    <div className="details-container">
      {audit ? (
        <>
          <h2>Détails de l'Audit</h2>
          <div>
            <strong>Type : </strong> {audit.type}
          </div>
          <div>
            <strong>Objectif : </strong> {audit.objective}
          </div>
          <div>
            <strong>Date de début : </strong> {new Date(audit.startDate).toLocaleDateString()}
          </div>
          <div>
            <strong>Date de fin : </strong> {new Date(audit.endDate).toLocaleDateString()}
          </div>
          <div>
            <strong>Commentaires : </strong> {audit.comments || "Aucun commentaire"}
          </div>
        </>
      ) : (
        <div>Aucun audit trouvé pour cet ID.</div>
      )}
    </div>
  );
}
