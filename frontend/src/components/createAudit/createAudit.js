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
        report: null,
        comments: []
    });

    const [tasks, setTasks] = useState([{ task: "", status: "pending", completionDate: "" }]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Date logic
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

    const addComment = () => {

        const trimmed = newComment.trim();
        if (trimmed.length < 5) {
    setError("Comments must be at least 5 characters long.");
    return;
}
        if (
            trimmed &&
            !audit.comments.includes(trimmed) &&
            audit.comments.length < 5
        ) {
            setAudit(prev => ({
                ...prev,
                comments: [...prev.comments, trimmed]
            }));
            setNewComment("");
        }
    };

    const removeComment = (index) => {
        const updated = [...audit.comments];
        updated.splice(index, 1);
        setAudit(prev => ({ ...prev, comments: updated }));
    };

    const addTask = () => {
        

        if (tasks.length >= 5) return;
        setTasks([...tasks, { task: "", status: "pending", completionDate: "" }]);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (new Date(audit.startDate) > new Date(audit.endDate)) {
            setError("Start date must be before end date");
            return;
        }
        if (audit.objective.trim().length < 10) {
            setError("Objective must be at least 10 characters long.");
            return;
        }
        
        const start = new Date(audit.startDate);
        const end = new Date(audit.endDate);
        const diffDays = (end - start) / (1000 * 60 * 60 * 24);
        if (diffDays < 1) {
            setError("The audit must last at least 1 day.");
            return;
        }
        
        const trimmedTasks = tasks.map(t => ({
            task: t.task.trim(),
            status: (t.status || "pending").toLowerCase(),
            completionDate: t.status === "completed" ? t.completionDate : ""
        }));

        const uniqueTasks = new Set(trimmedTasks.map(t => t.task));
        if (uniqueTasks.size !== trimmedTasks.length) {
            setError("Duplicate tasks are not allowed");
            return;
        }

        if (trimmedTasks.some(t => !t.task)) {
            setError("All tasks must have a description");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("type", audit.type);
            formData.append("objective", audit.objective);
            formData.append("startDate", audit.startDate);
            formData.append("endDate", audit.endDate);
            formData.append("status", audit.status);
            formData.append("createdBy", "67e94905ac5b7e235be0371f");
            formData.append("tasks", JSON.stringify(trimmedTasks));
            formData.append("comments", JSON.stringify(audit.comments));

            if (audit.report) {
                formData.append("report", audit.report.file);
            }

            const response = await fetch("http://localhost:5000/api/audit/add", {
                method: "POST",
                body: formData
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || "Failed to create audit");
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

                {/* Popup Error Message */}
                {error && (
                    <div className="popup-error">
                        <div className="popup-error-message">{error}</div>
                        <button className="popup-error-close" onClick={() => setError(null)}>
                            <FaTimes />
                        </button>
                    </div>
                )}

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
                                <option value="Cloud">Cloud Security</option>
                                <option value="Data Privacy">Data Privacy</option>
                            </optgroup>
                            <optgroup label="Operational Audits">
                                <option value="Operational">Operational</option>
                                <option value="Network">Network</option>
                            </optgroup>
                            <optgroup label="Compliance Audits">
                                <option value="Compliance">Compliance</option>
                            </optgroup>
                            <optgroup label="Risk-Based Audits">
                                <option value="Risk Based">Risk Based</option>
                            </optgroup>
                            <optgroup label="System/Application Audits">
                                <option value="System">System</option>
                                <option value="Application">Application</option>
                            </optgroup>
                            <optgroup label="IT Governance and Licensing Audits">
                                <option value="IT Governance">IT Governance</option>
                                <option value="Software">Software Licensing</option>
                            </optgroup>
                            <optgroup label="Disaster Recovery Audits">
                                <option value="Disaster Recovery">Disaster Recovery</option>
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

                    {/* Status */}
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

                    {/* Comments */}
                    <div className="form-group">
                        <label>Comments</label>
                        <div className="comments-wrapper">
                            {audit.comments.map((comment, index) => (
                                <div key={index} className="comment-item">
                                    <span>{comment}</span>
                                    <button type="button" onClick={() => removeComment(index)}>
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                            {audit.comments.length < 5 && (
                                <div className="comment-input-group">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add comment"
                                    />
                                    <button type="button" onClick={addComment}>
                                        <FaPlus /> Add
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tasks */}
                    <div className="form-group">
                        <label>Tasks</label>
                        <div className="tasks-container">
                            {tasks.map((task, index) => (
                                <div key={index} className="task-item">
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
                                    {task.status === "completed" && (
                                        <input
                                            type="date"
                                            name="completionDate"
                                            value={task.completionDate}
                                            onChange={(e) => handleTaskChange(index, e)}
                                            placeholder="Completion Date"
                                            min={audit.startDate}
                                            max={audit.endDate}
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeTask(index)}
                                        disabled={tasks.length <= 1}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                            {tasks.length < 5 && (
                                <button type="button" onClick={addTask}>
                                    <FaPlus /> Add Task
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="form-actions">
                        <button type="submit" disabled={loading}>
                            <FaSave /> {loading ? "Creating..." : "Create Audit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
