import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import "./selectedAudit.css";

export default function SelectedAudit() {
  const { id } = useParams();
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

  // Get audit
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
      // Validate dates
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
  
      // Prepare form data
      const formData = new FormData();
      formData.append("type", editedAudit.type || "");
      formData.append("objective", editedAudit.objective || "");
      formData.append("status", editedAudit.status || "");
      formData.append("startDate", editedAudit.startDate);
      formData.append("endDate", editedAudit.endDate);
      formData.append("comment", editedAudit.comment?.trim() || "No comment available");
  
      // Handle document upload - CRITICAL FIX
      if (editedAudit.newDocument) {
        // If a new file was uploaded
        formData.append("document", editedAudit.newDocument);
      } else if (editedAudit.document) {
        // If keeping existing document
        formData.append("documentPath", editedAudit.document);
      } else {
        // Explicitly send null if document should be removed
        formData.append("documentPath", "");
      }
  
      // Send request
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
        newDocument: null // Clear the uploaded file after successful save
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
  
      window.location.href = "/";
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
      document: '', // Clear the path
      newDocument: null // Clear any uploaded file
    }));
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false); 
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
            value={editedAudit.type || ""}
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
            value={editedAudit.createdBy?.username || ""}
            readOnly
          />
          <label>Comments</label>
          <input
            type="text"
            name="comment"
            value={editedAudit.comment || "No comment available"}
            onChange={handleChange}
            readOnly={!isEditing}
          />
        </div>

        <div className="audit-column">
          <label>Objective</label>
          <input
            type="text"
            name="objective"
            value={editedAudit.objective || ""}
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
              value={editedAudit.endDate ? new Date(editedAudit.endDate).toLocaleDateString() : ""}
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
              value={editedAudit.status || ""}
              readOnly
            />
          )}
          <label>Documents</label>
          {isEditing ? (
            <div className="file-upload-container">
              <div className="file-upload">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  id="file-upload-input"
                />
                <label htmlFor="file-upload-input">
                  <UploadFileIcon />
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
  download={editedAudit.document.split('/').pop()} // Sets the filename
  className="document-link"
>
  Download Document ({editedAudit.document.split('/').pop()})
</a>

          ) : (
            <input
              type="text"
              value="No document available"
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
            <button className="delete-button" onClick={handleDeleteClick}>
              <DeleteIcon /> Delete
            </button>
          </>
        )}
      </div>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Validation Error</DialogTitle>
        <DialogContent>
          <p>{validationError}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this audit? This action cannot be undone.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}