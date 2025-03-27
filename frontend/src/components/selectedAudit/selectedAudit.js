import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import "./selectedAudit.css";

export default function SelectedAudit() {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAudit, setEditedAudit] = useState({});


  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/audit/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch audit details");
        }
        const data = await response.json();
        setAudit(data);
        setEditedAudit(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        type: editedAudit.type,
        objective: editedAudit.objective,
        status: editedAudit.status,
        startDate: editedAudit.startDate,
        endDate: editedAudit.endDate,
        comments: editedAudit.comments,
        document: editedAudit.document,
      };
  
      console.log("Edited Audit Data:", updatedData); 
  
      const response = await fetch(`http://localhost:5000/api/audit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
  
      console.log(response.status);
  
      if (!response.ok) {
        throw new Error("Failed to save audit details");
      }
  
      const data = await response.json();
      setAudit(data);
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCancel = () => {
    setEditedAudit(audit);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditedAudit({ ...editedAudit, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file); 
      setEditedAudit({ ...editedAudit, document: file }); 
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="selected-audit-container">
      <h2 className="audit-header">Audit Details</h2>

      <div className="audit-form">
        <div className="audit-column">
          <label>Audit Type</label>
          <input
            type="text"
            name="type"
            value={editedAudit.type}
            onChange={handleChange}
            readOnly={!isEditing}
          />
          <label>Start Date</label>
          {isEditing ? (
            <input
              type="date"
              name="startDate"
              value={editedAudit.startDate ? editedAudit.startDate.split('T')[0] : ""}
              onChange={handleChange}
            />
          ) : (
            <input
              type="text"
              value={new Date(editedAudit.startDate).toLocaleDateString()}
              readOnly
            />
          )}
          <label>Created By</label>
          <input
            type="text"
            name="createdBy"
            value={editedAudit.createdBy}
            readOnly
          />
          <label>Comments</label>
          <input
            type="text"
            name="comments"
            value={editedAudit.comments || "No comment available"}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="audit-column">
          <label>Objective</label>
          <input
            type="text"
            name="objective"
            value={editedAudit.objective}
            onChange={handleChange}
            readOnly={!isEditing}
          />
          <label>End Date</label>
          {isEditing ? (
            <input
              type="date"
              name="endDate"
              value={editedAudit.endDate ? editedAudit.endDate.split('T')[0] : ""}
              onChange={handleChange}
            />
          ) : (
            <input
              type="text"
              value={new Date(editedAudit.endDate).toLocaleDateString()}
              readOnly
            />
          )}
          <label>Status</label>
          {isEditing ? (
            <select
              name="status"
              value={editedAudit.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          ) : (
            <input
              type="text"
              value={editedAudit.status}
              readOnly
            />
          )}
          <label>Documents</label>
          {isEditing ? (
            <div className="file-upload">
              <input
                type="file"
                onChange={handleFileUpload}
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input">
                <UploadFileIcon />
                <span>{editedAudit.document?.name || "Click to select file"}</span>
              </label>
            </div>
          ) : (
            <input
              type="text"
              value={editedAudit.document?.name || "No document available"}
              readOnly
            />
          )}
        </div>
      </div>

      <div className="audit-buttons">
        {isEditing ? (
          <>
            <button className="save-button" onClick={handleSave}>
              <SaveIcon /> Save
            </button>
            <button className="cancel-button" onClick={handleCancel}>
              <CancelIcon /> Cancel
            </button>
          </>
        ) : (
          <>
            <button className="edit-button" onClick={handleEdit}>
              <EditIcon /> Edit
            </button>
            <button className="delete-button">
              <DeleteIcon /> Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}