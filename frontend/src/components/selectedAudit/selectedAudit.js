import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaEdit, FaTrash, FaSave, FaTimes, FaChevronLeft, 
  FaClipboardCheck, FaFileAlt, FaCalendarAlt 
} from "react-icons/fa";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import "./selectedAudit.css";

export default function SelectedAudit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAudit, setEditedAudit] = useState({
    type: '',
    objective: '',
    status: '',
    startDate: '',
    endDate: '',
    comments: []
  });
  const [validationError, setValidationError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [editingTaskText, setEditingTaskText] = useState("");
  const [editingTaskStatus, setEditingTaskStatus] = useState('Pending');
  const [editingCompletionDate, setEditingCompletionDate] = useState("");
  const [dateExtensionRequired, setDateExtensionRequired] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not completed';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Check for date conflicts and end date validation
  useEffect(() => {
    if (audit && !loading && isEditing) {
      const checkDateConflict = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/audit/check-date?date=${editedAudit.startDate}&auditId=${id}`
          );
          if (!response.ok) {
            throw new Error("Failed to check date availability");
          }
          const { exists } = await response.json();
          if (exists) {
            setValidationError("Another audit already exists with this start date. Please choose a different date.");
            setIsDialogOpen(true);
          }
        } catch (error) {
          console.error("Error checking date:", error);
        }
      };

      if (editedAudit.startDate !== audit.startDate) {
        checkDateConflict();
      }

      const today = new Date();
      const endDate = new Date(editedAudit.endDate);
      const isPastDue = endDate < today;
      const isNotCompleted = editedAudit.status !== "Completed";
      
      setDateExtensionRequired(isPastDue && isNotCompleted);
    }
  }, [editedAudit.startDate, editedAudit.endDate, editedAudit.status, audit, loading, isEditing, id]);

  // Fetch audit data
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
          type: data.type || '',
          objective: data.objective || '',
          status: data.status || '',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          comments: data.comments || []
        });
        
        // Set tasks from the audit data
        if (data.tasks && data.tasks.length > 0) {
          setTasks(data.tasks);
        } else {
          setTasks([]);
        }
      } catch (error) {
        setError(error.message);
        toast.error(`Error loading audit: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, [id]);

  const allTasksCompleted = tasks.every(task => task.status === "Completed");

  // Task management functions
  const handleAddTask = () => {
    if (!newTask.trim()) {
      toast.warning("Please enter a task description");
      return;
    }
    
    const newTaskObj = {
      _id: `temp-${Date.now()}`,
      task: newTask.trim(),
      status: "Pending",
      auditID: id,
      completionDate: null
    };
  
    setTasks([...tasks, newTaskObj]);
    setNewTask("");
    toast.success("Task added successfully");
  };

  const handleStartEditTask = (task) => {
    setEditingTaskId(task._id);
    setEditingTaskText(task.task);
    setEditingTaskStatus(task.status);
    setEditingCompletionDate(task.completionDate || "");
  };

  const handleSaveTask = async () => {
    if (!editingTaskText.trim()) {
      toast.warning("Task description cannot be empty");
      return;
    }

    try {
      const taskUpdate = {
        task: editingTaskText.trim(),
        status: editingTaskStatus,
        auditID: id
      };

      // Only set completion date if task is being marked as completed
      if (editingTaskStatus === "Completed") {
        taskUpdate.completionDate = editingCompletionDate || new Date().toISOString();
      } else {
        taskUpdate.completionDate = null;
      }

      // For existing tasks
      if (!editingTaskId.startsWith('temp-')) {
        const response = await fetch(`http://localhost:5000/api/task/${editingTaskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskUpdate),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update task");
        }
      }

      setTasks(tasks.map(task => 
        task._id === editingTaskId ? { 
          ...task, 
          task: editingTaskText.trim(),
          status: editingTaskStatus,
          completionDate: editingTaskStatus === "Completed" ? 
            (editingCompletionDate || new Date().toISOString()) : 
            null
        } : task
      ));
      
      setEditingTaskId(null);
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(`Failed to update task: ${error.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (tasks.length <= 1) {
      toast.error("You must have at least one task");
      return;
    }

    try {
      // Only call API for existing tasks (not temporary ones)
      if (!taskId.startsWith('temp-')) {
        const response = await fetch(`http://localhost:5000/api/task/${taskId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete task");
        }
      }

      setTasks(tasks.filter(task => task._id !== taskId));
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(`Failed to delete task: ${error.message}`);
    }
  };

  const handleCancelEditTask = () => {
    setEditingTaskId(null);
  };

  // Comment management
  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.warning("Please enter a comment");
      return;
    }
    
    const newCommentObj = {
      _id: `temp-comment-${Date.now()}`,
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
      createdBy: "Current User" // Replace with actual user from your auth system
    };

    setEditedAudit(prev => ({
      ...prev,
      comments: [...prev.comments, newCommentObj]
    }));
    setNewComment("");
    toast.success("Comment added successfully");
  };

  const handleDeleteComment = (commentId) => {
    setEditedAudit(prev => ({
      ...prev,
      comments: prev.comments.filter(c => c._id !== commentId)
    }));
    toast.success("Comment deleted successfully");
  };

  // Audit CRUD operations
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validation checks
      if (dateExtensionRequired) {
        setValidationError("The end date has passed but the audit isn't completed. Please extend the end date.");
        setIsDialogOpen(true);
        return;
      }

      if (editedAudit.status === "Completed" && !allTasksCompleted) {
        setValidationError("All tasks must be completed before marking the audit as completed.");
        setIsDialogOpen(true);
        return;
      }

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

      // Separate new and existing tasks
      const newTasks = tasks
        .filter(task => task._id.startsWith('temp-'))
        .map(task => ({
          task: task.task.trim(),
          status: task.status,
          auditID: id,
          completionDate: task.completionDate
        }));

      const existingTasks = tasks
        .filter(task => !task._id.startsWith('temp-'))
        .map(task => ({
          _id: task._id,
          task: task.task.trim(),
          status: task.status,
          auditID: id,
          completionDate: task.completionDate
        }));

      // Create new tasks
      const createdTaskIds = [];
      for (const task of newTasks) {
        const response = await fetch("http://localhost:5000/api/task", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Task creation failed");
        }

        const newTask = await response.json();
        createdTaskIds.push(newTask._id);
      }

      // Update existing tasks
      for (const task of existingTasks) {
        const response = await fetch(`http://localhost:5000/api/task/${task._id}`, {
          method: "PUT",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });

        if (!response.ok) {
          throw new Error("Failed to update task");
        }
      }

      // Update the audit
      const updateResponse = await fetch(`http://localhost:5000/api/audit/update/${id}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editedAudit,
          tasks: [...existingTasks.map(t => t._id), ...createdTaskIds],
          status: allTasksCompleted ? "Completed" : editedAudit.status
        })
      });

      if (!updateResponse.ok) {
        const errorResponse = await updateResponse.json();
        throw new Error(errorResponse.error || "Failed to update audit");
      }

      const data = await updateResponse.json();
      
      // Update local state
      setAudit(data.audit);
      setEditedAudit({
        ...data.audit,
        comments: data.audit.comments || []
      });
      
      // Update tasks with real IDs for newly created ones
      setTasks(tasks.map(task => {
        if (task._id.startsWith('temp-')) {
          const index = newTasks.findIndex(t => t.task === task.task);
          if (index !== -1) {
            return {
              ...task,
              _id: createdTaskIds[index]
            };
          }
        }
        return task;
      }));

      setIsEditing(false);
      setValidationError(null);
      setError(null);
      toast.success("Audit updated successfully");
    } catch (error) {
      console.error("Error updating audit:", error);
      setError(error.message || "An unknown error occurred.");
      toast.error(`Failed to update audit: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedAudit({
      type: audit.type || '',
      objective: audit.objective || '',
      status: audit.status || '',
      startDate: audit.startDate || '',
      endDate: audit.endDate || '',
      comments: audit.comments || []
    });
    setTasks(audit.tasks || []);
    setIsEditing(false);
    toast.info("Changes discarded");
  };

  const handleChange = (e) => {
    setEditedAudit({ ...editedAudit, [e.target.name]: e.target.value });
  };

  // Delete audit
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
      toast.success("Audit deleted successfully");
    } catch (error) {
      setError(error.message);
      toast.error(`Failed to delete audit: ${error.message}`);
    }
  };

  // Navigation
  const handleNavigateToOutcomes = () => {
    navigate(`/audits/${id}/outcomes`);
  };

  const handleNavigateToReporting = () => {
    navigate(`/audits/${id}/report`);
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
                  <>
                    <button 
                      className="btn outcomes-btn"
                      onClick={handleNavigateToOutcomes}
                      aria-label="View audit outcomes"
                    >
                      <FaClipboardCheck className="icon" />
                      <span className="btn-text">Audit Outcomes</span>
                    </button>
                    <button 
                      className="btn reporting-btn"
                      onClick={handleNavigateToReporting}
                      aria-label="Generate audit report"
                    >
                      <FaFileAlt className="icon" />
                      <span className="btn-text">Generate Report</span>
                    </button>
                  </>
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
        <div className="form-row">
          <div className="form-group">
            <label>Audit Type</label>
            <input 
              type="text" 
              name="type"
              value={editedAudit.type}
              onChange={handleChange}
              readOnly={!isEditing}
              className={!isEditing ? "read-only" : ""}
            />
          </div>

          <div className="form-group">
            <label>Objective</label>
            <input
              name="objective"
              value={editedAudit.objective}
              onChange={handleChange}
              readOnly={!isEditing}
              className={!isEditing ? "read-only" : ""}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            {isEditing ? (
              <input
                type="date"
                name="startDate"
                value={editedAudit.startDate ? editedAudit.startDate.split('T')[0] : ""}
                onChange={handleChange}
                required
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
                required
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

        <div className="form-row">
          <div className="form-group">
            <label>Created By</label>
            <input
              type="text"
              name="createdBy"
              value={audit?.createdBy?.username || ""}
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

        {/* Comments Section */}
        <div className="form-row-full">
          <div className="form-group">
            <label>Comments</label>
            {isEditing && (
              <div className="comment-input-container">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a new comment..."
                  rows="2"
                  className="comment-input"
                />
                <button
                  className="btn btn-add-comment"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </button>
              </div>
            )}
            
            <div className="comments-list">
              {editedAudit.comments.length > 0 ? (
                editedAudit.comments.map((comment) => (
                  <div key={comment._id} className="comment-item">
                    <div className="comment-content">
                      <p className="comment-text">{comment.text}</p>
                      <div className="comment-meta">
                        <span className="comment-author">{comment.createdBy}</span>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {isEditing && (
                      <button
                        className="btn-icon btn-delete-comment"
                        onClick={() => handleDeleteComment(comment._id)}
                        title="Delete comment"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-comments">No comments yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="tasks-section">
        <div className="tasks-header">
          <h3>Tasks</h3>
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
                    {editingTaskStatus === "Completed" && (
                      <div className="completion-date-input">
                        <FaCalendarAlt className="calendar-icon" />
                        <input
                          type="date"
                          value={editingCompletionDate ? editingCompletionDate.split('T')[0] : new Date().toISOString().split('T')[0]}
                          onChange={(e) => setEditingCompletionDate(e.target.value)}
                          className="date-input"
                        />
                      </div>
                    )}
                    
                    <div className="task-edit-actions">
                      <button 
                        className="btn btn-save"
                        onClick={handleSaveTask}
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
                      {task.status === "Completed" && task.completionDate && (
                        <div className="task-completion-date">
                          <FaCalendarAlt className="calendar-icon" />
                          {formatDate(task.completionDate)}
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <div className="task-actions">
                        <button 
                          className="btn-icon"
                          onClick={() => handleStartEditTask(task)}
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
              <button className="btn primary-btn" onClick={() => setIsDialogOpen(false)}>
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