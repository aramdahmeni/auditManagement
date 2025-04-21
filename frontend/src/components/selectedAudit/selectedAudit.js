import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaSave, FaTimes, FaUpload, FaDownload, FaChevronLeft, FaClipboardCheck } from "react-icons/fa";
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
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingTaskStatus, setEditingTaskStatus] = useState('Pending');
  const [dateExtensionRequired, setDateExtensionRequired] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if end date has passed and status isn't completed
  useEffect(() => {
    if (audit && !loading) {
      const today = new Date();
      const endDate = new Date(audit.endDate);
      const isPastDue = endDate < today;
      const isNotCompleted = audit.status !== "Completed";
      
      setDateExtensionRequired(isPastDue && isNotCompleted);
    }
  }, [audit, loading]);

  //fetch audit
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

  //fetch tasks 
  useEffect(() => {
    const fetchTasksByAudit = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/task/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks for this audit");
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      }
    }; 
    fetchTasksByAudit();
  }, [id]);

  // Check if all tasks are completed
  const allTasksCompleted = tasks.every(task => task.status === "Completed");
  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const newLocalTask = {
      task: newTask.trim(),
      status: "Pending"
    };
  
    setTasks([...tasks, newLocalTask]);
    setNewTask("");
  };
  
  // Start editing a task
  const handleStartEditTask = (task) => {
    setEditingTaskText(task.task);
    setEditingTaskStatus(task.status); 
  };

  // Save edited task
  const handleSaveTask = async () => {
    if (!editingTaskText.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/task/${editingTaskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          task: editingTaskText.trim(),
          status: editingTaskStatus,
          auditID: id
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setTasks(tasks.map(task => 
        task._id === editingTaskId ? { 
          ...task, 
          task: editingTaskText.trim(),
          status: editingTaskStatus
        } : task
      ));
      setEditingTaskId(null);
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task");
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    if (tasks.length <= 1) {
      setError("You must have at least one task");
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/task/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task");
    }
  };

  // Cancel task editing
  const handleCancelEditTask = () => {
    setEditingTaskId(null);
  };

  //edit
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Check if date extension is required
      const today = new Date();
      const endDate = new Date(editedAudit.endDate);
      const isPastDue = endDate < today;
      const isNotCompleted = editedAudit.status !== "Completed";
      
      if (isPastDue && isNotCompleted) {
        setValidationError("The end date has passed but the audit isn't completed. Please extend the end date.");
        setIsDialogOpen(true);
        return;
      }

      // Check if trying to complete audit with incomplete tasks
      if (editedAudit.status === "Completed" && !allTasksCompleted) {
        setValidationError("All tasks must be completed before marking the audit as completed.");
        setIsDialogOpen(true);
        return;
      }

      // Other validators
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
      
      if (!editedAudit.objective || editedAudit.objective.trim().length < 4) {
        setValidationError("Objective must be at least 4 characters long.");
        setIsDialogOpen(true);
        return;
      }
      
      if (editedAudit.comment && editedAudit.comment.trim().length > 0 && editedAudit.comment.trim().length < 4) {
        setValidationError("Comment must be at least 4 characters if provided.");
        setIsDialogOpen(true);
        return;
      }
      
      const taskNames = tasks.map(t => t.task?.trim()).filter(Boolean);
      const invalidTasks = taskNames.filter(name => name.length < 4); 
      if (invalidTasks.length > 0) {
        setValidationError("Each task must be at least 4 characters long.");
        setIsDialogOpen(true);
        return;
      }
      
      const uniqueTasks = new Set(taskNames);
      if (uniqueTasks.size !== taskNames.length) {
        setValidationError("All tasks must be unique.");
        setIsDialogOpen(true);
        return;
      }

      const validatedTasks = tasks
        .filter(task => task.task?.trim() !== '')
        .map(task => ({
          task: task.task.trim(),
          status: (task.status || 'pending').toLowerCase(),
          auditID: id,
          _id: task._id 
        }));
  
      if (validatedTasks.length === 0) {
        setError("At least one task is required");
        return;
      }
  
      const newTasks = validatedTasks.filter(task => !task._id);
      const existingTasks = validatedTasks.filter(task => task._id);
  
      const seen = new Set();
      const uniqueNewTasks = [];
      for (const task of newTasks) {
        if (!seen.has(task.task)) {
          seen.add(task.task);
          uniqueNewTasks.push(task);
        }
      }
  
      const createdTaskIds = [];
      for (const task of uniqueNewTasks) {
        const response = await fetch("http://localhost:5000/api/task", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            task: task.task,
            status: task.status,
            auditID: id
          })
        });
  
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Task creation failed");
        }
  
        const newTask = await response.json();
        createdTaskIds.push(newTask._id);
      }
  
      const allTaskIds = [
        ...existingTasks.map(task => task._id.toString()),
        ...createdTaskIds.map(id => id.toString())
      ];
  
      const formData = new FormData();
      formData.append("type", editedAudit.type || "");
      formData.append("objective", editedAudit.objective || "");
      formData.append("status", editedAudit.status || "");
      formData.append("startDate", editedAudit.startDate);
      formData.append("endDate", editedAudit.endDate);
      formData.append("comment", editedAudit.comment?.trim() || "No comment available");
  
      allTaskIds.forEach(id => formData.append("tasks", id));
  
      if (editedAudit.newDocument instanceof File) {
        formData.append("document", editedAudit.newDocument);
      } else if (editedAudit.document) {
        formData.append("documentPath", editedAudit.document);
      }
  
      // Update the audit
      const updateResponse = await fetch(`http://localhost:5000/api/audit/update/${id}`, {
        method: "PUT",
        body: formData
      });
  
      if (!updateResponse.ok) {
        const errorResponse = await updateResponse.json();
        throw new Error(errorResponse.error || "Failed to update audit");
      }
  
      const data = await updateResponse.json();
  
      // Replace new tasks with real ones from backend
      const updatedTasks = tasks.map(task => {
        if (!task._id) {
          const match = uniqueNewTasks.find(t => t.task === task.task);
          const index = uniqueNewTasks.indexOf(match);
          return {
            ...task,
            _id: createdTaskIds[index]
          };
        }
        return task;
      });
  
      setTasks(updatedTasks);
      setAudit(data.audit);
      setEditedAudit({ ...data.audit, newDocument: null });
      setIsEditing(false);
      setValidationError(null);
      setError(null);
    } catch (error) {
      console.error("Error updating audit:", error.stack);
      setError(error.message || "An unknown error occurred.");
    }
  };
  
  const handleCancel = () => {
    setEditedAudit(audit);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditedAudit({ ...editedAudit, [e.target.name]: e.target.value });
  };

  //audit delete config
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => { 
    setDeleteDialogOpen(false);
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

      navigate("/audits");
    } catch (error) {
      setError(error.message);
    }
  };

  //file config
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedAudit({ ...editedAudit, newDocument: file });
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

  const handleNavigateToOutcomes = () => {
    navigate(`/audits/${id}/outcomes`);
  };

  if (loading) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="selected-audit-container">
      <div className="audit-header">
  <div className="header-content">
    <button 
      className="back-button"
      onClick={() => navigate("/audits")}
      aria-label="Back to audits"
    >
      <FaChevronLeft className="header-arrow" />
      <span className="header-title">Audit Details</span>
    </button>
    
    <div className="action-buttons">
      {isEditing ? (
        <>
          <button 
            className="btn save-btn"
            onClick={handleSave}
            disabled={isSaving}
            aria-label="Save changes"
          >
            <FaSave className="icon" />
            <span className="btn-text">{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
          <button 
            className="btn cancel-btn"
            onClick={handleCancel}
            disabled={isSaving}
            aria-label="Cancel editing"
          >
            <FaTimes className="icon" />
            <span className="btn-text">Cancel</span>
          </button>
        </>
      ) : (
        <>
          <button 
            className="btn edit-btn"
            onClick={handleEdit}
            aria-label="Edit audit"
          >
            <FaEdit className="icon" />
            <span className="btn-text">Edit</span>
          </button>
          <button 
            className="btn delete-btn"
            onClick={handleDeleteClick}
            aria-label="Delete audit"
          >
            <FaTrash className="icon" />
            <span className="btn-text">Delete</span>
          </button>
          {audit?.status === "Completed" && (
            <button 
              className="btn outcomes-btn"
              onClick={handleNavigateToOutcomes}
              aria-label="View audit outcomes"
            >
              <FaClipboardCheck className="icon" />
              <span className="btn-text">Audit Outcomes</span>
            </button>
          )}
        </>
      )}
    </div>
  </div>
</div>

      {dateExtensionRequired && !isEditing && (
        <div className="warning-banner">
          <p>Warning: The end date has passed but this audit isn't completed. Please edit to extend the end date.</p>
        </div>
      )}

      <div className="audit-form">
        {/* type w objective */}
        <div className="form-row">
          <div className="form-group">
            <label>Audit Type</label>
            <input type="text" name="type"
              value={editedAudit.type || ""}
              onChange={handleChange}
              readOnly={!isEditing}
              className={!isEditing ? "read-only" : ""}
            />
          </div>

          <div className="form-group">
            <label>Objective</label>
            <input
              name="objective"
              value={editedAudit.objective || ""}
              onChange={handleChange}
              readOnly={!isEditing}
              className={!isEditing ? "read-only" : ""}
            />
          </div>
        </div>

        {/* dates */}
        <div className="form-row">
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
            <label>End Date</label>
            {isEditing ? (
              <input
                type="date"
                name="endDate"
                value={editedAudit.endDate ? editedAudit.endDate.split('T')[0] : ""}
                onChange={handleChange}
                min={editedAudit.startDate ? editedAudit.startDate.split('T')[0] : ""}
                className={dateExtensionRequired ? "date-warning" : ""}
              />
            ) : (
              <input
                type="text"
                value={editedAudit.endDate ? new Date(editedAudit.endDate).toLocaleDateString() : ""}
                readOnly
                className={`read-only ${dateExtensionRequired ? "date-warning" : ""}`}
              />
            )}
            {dateExtensionRequired && isEditing && (
              <p className="warning-text">Please extend the end date as it has already passed</p>
            )}
          </div>
        </div>

        {/* created w status */}
        <div className="form-row">
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
            <label>Status</label>
            {isEditing ? (
              <select
                name="status"
                value={editedAudit.status}
                onChange={handleChange}
                disabled={!allTasksCompleted && editedAudit.status !== "Completed"}
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
            {!allTasksCompleted && editedAudit.status === "Completed" && isEditing && (
              <p className="warning-text">All tasks must be completed to mark audit as completed</p>
            )}
          </div>
        </div>

        {/* comments */}
        <div className="form-row-full">
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

        {/* doc */}
        <div className="form-row-full">
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

      {/* Tasks */}
      <div className="tasks-section">
        <div className="tasks-header">
          <h3>Tasks</h3>
          <br />
          {isEditing && (
            <div className="add-task-container">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add new task..."
                className="form-input"
              />
              <button 
                className="btn btn-add"
                onClick={handleAddTask}
                disabled={!newTask.trim()}
              >
                Add Task
              </button>
            </div>
          )}
        </div>
        
        {tasks.length > 0 ? (
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task._id} className={`task-item ${editingTaskId === task._id ? 'editing' : ''}`}>
                {editingTaskId === task._id ? (
                  <div className="task-edit-container">
                    <input
                      type="text"
                      value={editingTaskText}
                      onChange={(e) => setEditingTaskText(e.target.value)}
                      className="form-input"
                      autoFocus
                    />
                    <select
                      value={editingTaskStatus}
                      onChange={(e) => setEditingTaskStatus(e.target.value)}
                      className="status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <div className="task-edit-actions">
                      <button 
                        className="btn btn-save"
                        onClick={() => handleSaveTask(task._id)}
                        disabled={!editingTaskText.trim()}
                      >
                        <FaSave />
                      </button>
                      <button 
                        className="btn btn-cancel"
                        onClick={handleCancelEditTask}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-content">
                      <div className="task-text">{task.task}</div>
                      <div className={`task-status ${task.status.toLowerCase()}`}>
                        {task.status}
                      </div>
                    </div>
                    {isEditing && (
                      <div className="task-actions">
                        <button 
                          className="btn-icon"
                          onClick={() => {
                            setEditingTaskId(task._id);
                            setEditingTaskText(task.task);
                            setEditingTaskStatus(task.status);
                          }}
                          title="Edit task"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteTask(task._id)}
                          disabled={tasks.length <= 1}
                          title={tasks.length <= 1 ? "You must keep at least one task" : "Delete task"}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-tasks">No tasks assigned to this audit</div>
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