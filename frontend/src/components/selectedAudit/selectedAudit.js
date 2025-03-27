import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaSave, FaTimes, FaUpload, FaDownload } from "react-icons/fa";
import "./selectedAudit.css";

export default function SelectedAudit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAudit, setEditedAudit] = useState({
    document: '',
    newDocument: null
  });
  const [validationError, setValidationError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/audit/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch audit details");
        }
        const data = await response.json();
        setAudit(data);
        setEditedAudit({
          ...data,
          newDocument: null
        });
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
    setValidationError(null);
    setEditedAudit({
      ...audit,
      newDocument: null
    });
  };

  const handleSave = async () => {
    try {
      if (!editedAudit.startDate || !editedAudit.endDate) {
        setValidationError("Both start and end dates are required.");
        setIsDialogOpen(true);
        return;
      }

      if (new Date(editedAudit.startDate) > new Date(editedAudit.endDate)) {
        setValidationError("Start date must be before end date.");
        setIsDialogOpen(true);
        return;
      }

      const formData = new FormData();
      formData.append("type", editedAudit.type || "");
      formData.append("objective", editedAudit.objective || "");
      formData.append("status", editedAudit.status || "");
      formData.append("startDate", editedAudit.startDate);
      formData.append("endDate", editedAudit.endDate);
      formData.append("comment", editedAudit.comment?.trim() || "No comment available");

      if (editedAudit.newDocument) {
        formData.append("document", editedAudit.newDocument);
      } else if (editedAudit.document) {
        formData.append("documentPath", editedAudit.document);
      } else {
        formData.append("documentPath", "");
      }

      const response = await fetch(`http://localhost:5000/api/audit/edit/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save audit details: ${errorText}`);
      }

      const data = await response.json();
      setAudit(data);
      setEditedAudit({
        ...data,
        newDocument: null
      });
      setIsEditing(false);
      setValidationError(null);
    } catch (error) {
      console.error("Error saving audit:", error);
      setError(error.message || "An unknown error occurred.");
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/audit/delete/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete audit");
      }

      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      setError(error.message);
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleCancel = () => {
    setEditedAudit({
      ...audit,
      newDocument: null
    });
    setIsEditing(false);
    setValidationError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedAudit(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedAudit(prev => ({
        ...prev,
        newDocument: file
      }));
    }
  };

  const handleRemoveDocument = () => {
    setEditedAudit(prev => ({
      ...prev,
      document: '',
      newDocument: null
    }));
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="selected-audit-container">
      <div className="audit-header">
        <h2>Audit Details</h2>
      </div>

      <div className="audit-form">
        <div className="audit-column">
          <div className="form-group">
            <label>Audit Type</label>
            <input
              type="text"
              name="type"
              value={editedAudit.type || ""}
              onChange={handleChange}
              readOnly={!isEditing}
              className={!isEditing ? "read-only" : ""}
            />
          </div>

          <div className="form-group">
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
                className="read-only"
              />
            )}
          </div>

          <div className="form-group">
            <label>Created By</label>
            <input
              type="text"
              name="createdBy"
              value={editedAudit.createdBy?.username || ""}
              readOnly
              className="read-only"
            />
          </div>

          <div className="form-group">
            <label>Comments</label>
            <textarea
              name="comment"
              value={editedAudit.comment || "No comment available"}
              onChange={handleChange}
              readOnly={!isEditing}
              className={!isEditing ? "read-only" : ""}
              rows="3"
            />
          </div>
        </div>

        <div className="audit-column">
          <div className="form-group">
            <label>Objective</label>
            <textarea
              name="objective"
              value={editedAudit.objective || ""}
              onChange={handleChange}
              readOnly={!isEditing}
              className={!isEditing ? "read-only" : ""}
              rows="3"
            />
          </div>

          <div className="form-group">
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
                value={editedAudit.endDate ? new Date(editedAudit.endDate).toLocaleDateString() : ""}
                readOnly
                className="read-only"
              />
            )}
          </div>

          <div className="form-group">
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
              <div className={`status-text ${editedAudit.status?.toLowerCase()}`}>
                {editedAudit.status || ""}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Documents</label>
            {isEditing ? (
              <div className="file-upload-container">
                <div className="file-upload">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    id="file-upload-input"
                  />
                  <label htmlFor="file-upload-input" className="upload-button">
                    <FaUpload className="icon" />
                    <span>
                      {editedAudit.newDocument
                        ? editedAudit.newDocument.name
                        : "Select new file"}
                    </span>
                  </label>
                </div>
                {editedAudit.document && !editedAudit.newDocument && (
                  <div className="file-info">
                    <span>Current file: {editedAudit.document.split('/').pop()}</span>
                    <button
                      type="button"
                      className="remove-file-button"
                      onClick={handleRemoveDocument}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ) : editedAudit.document ? (
              <a
                href={`http://localhost:5000/${editedAudit.document}`}
                download={editedAudit.document.split('/').pop()}
                className="document-link"
              >
                <FaDownload className="icon" />
                {editedAudit.document.split('/').pop()}
              </a>
            ) : (
              <div className="no-document">No document available</div>
            )}
          </div>
        </div>
      </div>

      <div className="action-buttons">
        {isEditing ? (
          <>
            <button className="btn save-btn" onClick={handleSave}>
              <FaSave className="icon" /> Save
            </button>
            <button className="btn cancel-btn" onClick={handleCancel}>
              <FaTimes className="icon" /> Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn edit-btn" onClick={handleEdit}>
              <FaEdit className="icon" /> Edit
            </button>
            <button className="btn delete-btn" onClick={handleDeleteClick}>
              <FaTrash className="icon" /> Delete
            </button>
          </>
        )}
      </div>

      {/* Dialogs */}
      <div className={`dialog-overlay ${isDialogOpen || deleteDialogOpen ? 'active' : ''}`}>
        {isDialogOpen && (
          <div className="dialog">
            <h3>Validation Error</h3>
            <p>{validationError}</p>
            <div className="dialog-actions">
              <button className="btn primary-btn" onClick={handleCloseDialog}>
                OK
              </button>
            </div>
          </div>
        )}

        {deleteDialogOpen && (
          <div className="dialog">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this audit? This action cannot be undone.</p>
            <div className="dialog-actions">
              <button className="btn cancel-btn" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button className="btn delete-btn" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}