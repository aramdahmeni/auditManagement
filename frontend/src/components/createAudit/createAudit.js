import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSave, FaTimes, FaUpload, FaPlus, FaTrash } from "react-icons/fa";
import "./createAudit.css";

export default function CreateAudit() {
    const navigate = useNavigate();
    const [audit, setAudit] = useState({
        type: "",
        objective: "",
        startDate: "",
        endDate: "",
        status: "Pending",
        auditor: "",
        comment: "",
        document: null  
    });
    const [tasks, setTasks] = useState([
        { task: "", status: "pending" }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fileUploading, setFileUploading] = useState(false);

    // Date configuration
    useEffect(() => {
        if (audit.startDate && audit.endDate) {
            const today = new Date();
            const startDate = new Date(audit.startDate);
            const endDate = new Date(audit.endDate);
            
            today.setHours(0, 0, 0, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            
            if (startDate > today) {
                setAudit(prev => ({ ...prev, status: "Pending" }));
            } else if (endDate < today) {
                setAudit(prev => ({ ...prev, status: "Completed" }));
            } else {
                setAudit(prev => ({ ...prev, status: "Ongoing" }));
            }
        }
    }, [audit.startDate, audit.endDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAudit(prev => ({ ...prev, [name]: value }));
    };

    // Task configuration
    const addTask = () => {
        setTasks([...tasks, { task: "", status: "pending" }]);
    };

    const removeTask = (index) => {
        if (tasks.length <= 1) {
            setError("At least one task is required");
            return;
        }
        const updatedTasks = [...tasks];
        updatedTasks.splice(index, 1);
        setTasks(updatedTasks);
        setError(null);
    };

    const handleTaskChange = (index, e) => {
        const { name, value } = e.target;
        const updatedTasks = [...tasks];
        updatedTasks[index] = {
            ...updatedTasks[index],
            [name]: value
        };
        setTasks(updatedTasks);
    };

    // File configuration
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setFileUploading(true);
        try {
            const uploadedFile = {
                name: file.name,
                size: file.size,
                type: file.type,
                file: file
            };
            
            setAudit(prev => ({
                ...prev,
                document: uploadedFile
            }));
        } catch (err) {
            setError("File upload failed");
        } finally {
            setFileUploading(false);
        }
    };
    const removeDocument = () => {
        setAudit(prev => ({
            ...prev,
            document: null
        }));
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (new Date(audit.startDate) > new Date(audit.endDate)) {
          setError("Start date must be before end date");
          return;
        }
      
        const validatedTasks = tasks.map(task => ({
          task: task.task.trim(),
          status: (task.status || 'pending').toLowerCase()
        }));
      
        if (validatedTasks.some(t => !t.task)) {
          setError("All tasks must have a description");
          return;
        }
      
        setLoading(true);
        setError(null);
      
        try {
          const formData = new FormData();
          

          formData.append('type', audit.type);
          formData.append('objective', audit.objective);
          formData.append('startDate', audit.startDate);
          formData.append('endDate', audit.endDate);
          formData.append('status', audit.status);
          formData.append('auditor', audit.auditor);
          formData.append('comment', audit.comment);
          formData.append('createdBy', '67e94905ac5b7e235be0371f');
          formData.append('tasks', JSON.stringify(validatedTasks));
          

          if (audit.document) {
            formData.append('document', audit.document.file);
          }
          const response = await fetch("http://localhost:5000/api/audit/add", {
            method: "POST",
            body: formData
          });
      
          const responseData = await response.json();
          if (!response.ok) {
            throw new Error(responseData.error || "Failed to create audit");
          }
      
          if (!responseData.tasks || responseData.tasks.length === 0) {
            console.warn("Audit created but no tasks were added");
          }
          navigate("/audits");
      
        } catch (err) {
          console.error("Create error:", err);
          setError(err.message || "An error occurred during creation");
        } finally {
          setLoading(false);
        }
      };
      

    if (loading) return <div className="loading">Creating audit...</div>;

    return (
        <div className="create-audit-page-wrapper">
            <div className="create-audit-container">
                <div className="audit-form-header">
                    <h2>Create New Audit</h2>
                    <button className="btn-cancel" onClick={() => navigate("/audits")}>
                        <FaTimes /> Cancel
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="audit-form">
                    {/* Audit Type */}
                    <div className="form-group">
                        <label>Audit Type</label>
                        <select
                            name="type"
                            value={audit.type}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Select Type</option>
                            <optgroup label="Security Audits">
                                <option value="Security">Security</option>
                                <option value="cloud">Cloud Security</option>
                                <option value="dataPrivacy">Data Privacy</option>
                            </optgroup>
                            <optgroup label="Operational Audits">
                                <option value="operational">Operational</option>
                                <option value="network">Network</option>
                            </optgroup>
                            <optgroup label="Compliance Audits">
                                <option value="compliance">Compliance</option>
                            </optgroup>
                            <optgroup label="Risk-Based Audits">
                                <option value="riskBased">Risk Based</option>
                            </optgroup>
                            <optgroup label="System/Application Audits">
                                <option value="system">System</option>
                                <option value="application">Application</option>
                            </optgroup>
                            <optgroup label="IT Governance and Licensing Audits">
                                <option value="it">IT Governance</option>
                                <option value="software">Software Licensing</option>
                            </optgroup>
                            <optgroup label="Disaster Recovery Audits">
                                <option value="disasterRecovery">Disaster Recovery</option>
                            </optgroup>
                        </select>
                    </div>

                    {/* Objective */}
                    <div className="form-group">
                        <label>Objective</label>
                        <textarea
                            name="objective"
                            value={audit.objective}
                            onChange={handleChange}                                     
                            required
                            rows="3"
                        />
                    </div>

                    {/* Dates */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={audit.startDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={audit.endDate}
                                onChange={handleChange}
                                required
                                min={audit.startDate}
                            />
                        </div>
                    </div>

                    {/* Status and Comments */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                value={audit.status}
                                onChange={handleChange}
                                required
                                disabled
                            >
                                <option value="Pending">Pending</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Comments</label>
                            <input
                                type="text"
                                name="comment"
                                value={audit.comment}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Tasks Section */}
                    <div className="form-group">
                        <label>Tasks</label>
                        <div className="tasks-container">
                            {tasks.map((task, index) => (
                                <div key={index} className="task-item">
                                    <div className="task-inputs">
                                        <input
                                            type="text"
                                            name="task"
                                            placeholder="Task description"
                                            value={task.task}
                                            onChange={(e) => handleTaskChange(index, e)}
                                            required
                                        />
                                        <select
                                            name="status"
                                            value={task.status}
                                            onChange={(e) => handleTaskChange(index, e)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="ongoing">Ongoing</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                        <button
                                            type="button"
                                            className="btn-remove-task"
                                            onClick={() => removeTask(index)}
                                            disabled={tasks.length <= 1}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn-add-task"
                                onClick={addTask}
                            >
                                <FaPlus /> Add Task
                            </button>
                        </div>
                    </div>

                    {/* Document Upload */}
                    <div className="form-group">
                        <label>Document</label>
                        <div className="document-container">
                            {audit.document ? (
                                <div className="document-item">
                                    <span>{audit.document.name}</span>
                                    <button 
                                        type="button" 
                                        className="btn-remove"
                                        onClick={removeDocument}
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <label className="btn-upload">
                                    <input 
                                        type="file" 
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                        accept=".pdf,.doc,.docx,.xls,.xlsx" 
                                    />
                                    <FaUpload /> {fileUploading ? "Uploading..." : "Upload Document"}
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="form-actions">
                        <button type="submit" className="btn-submit" disabled={loading || fileUploading}>
                            <FaSave /> {loading ? "Creating..." : "Create Audit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}