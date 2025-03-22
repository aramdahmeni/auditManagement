import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaFileAlt } from "react-icons/fa";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import "./selectedAudit.css";

export default function SelectedAudit() {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/audit/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch audit details");
        }
        const data = await response.json();
        setAudit(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="selected-audit-container">
      <div className="audit-header">
        <h2>Audit Details</h2>
      </div>
      <div className="audit-info">
        <div className="audit-item">
          <strong>Audit Type:</strong> {audit.type}
        </div>
        <div className="audit-item">
          <strong>Objective:</strong> {audit.objective}
        </div>
        <div className="audit-item">
          <strong>Created By:</strong> {audit.createdBy}
        </div>
        <div className="audit-item">
          <strong>Status:</strong> {audit.status}
        </div>
        <div className="audit-item">
          <strong>Start Date:</strong> {new Date(audit.startDate).toLocaleDateString()}
        </div>
        <div className="audit-item">
          <strong>End Date:</strong> {new Date(audit.endDate).toLocaleDateString()}
        </div>
        <div className="audit-item">
          <strong>Comments:</strong> {audit.comments || "No comments available"}
        </div>
        <div className="audit-item">
          <strong>Notes:</strong> {audit.notes || "No notes available"}
        </div>
        <div className="audit-item">
          <strong>Documents:</strong>{" "}
          {audit.documents ? (
            <a href={audit.documents} target="_blank" rel="noreferrer">
              <FileCopyIcon /> View Document
            </a>
          ) : (
            "No documents available"
          )}
        </div>
      </div>

      <div className="audit-actions">
        <button className="action-button edit">
          <EditIcon /> Edit
        </button>
        <button className="action-button delete">
          <DeleteIcon /> Delete
        </button>
      </div>
    </div>
  );
}
