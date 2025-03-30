import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSave, FaTimes, FaUpload, FaDownload } from "react-icons/fa";
import "./createAudit.css";

export default function CreateAudit() {
    const navigate = useNavigate();
    const [audit, setAudit] = useState({
        type: "",
        objective: "",
        startDate: "",
        endDate: "",
        status: "pending",
        auditor: "",
        comment: "",
        document: null  
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fileUploading, setFileUploading] = useState(false);

    useEffect(() => {
        if (audit.startDate && audit.endDate) {
            const today = new Date();
            const startDate = new Date(audit.startDate);
            const endDate = new Date(audit.endDate);
            
            if (startDate > today) {
                setAudit(prev => ({ ...prev, status: "pending" }));
            } else if (endDate < today) {
                setAudit(prev => ({ ...prev, status: "completed" }));
            } else {
                setAudit(prev => ({ ...prev, status: "Ongoing" }));
            }
        }
    }, [audit.startDate, audit.endDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAudit(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        if (name === "startDate" && audit.endDate && new Date(value) > new Date(audit.endDate)) {
            setError("Start date must be before end date");
            return;
        }
        if (name === "endDate" && audit.startDate && new Date(value) < new Date(audit.startDate)) {
            setError("End date must be after start date");
            return;
        }
        
        setError(null);
        setAudit(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0]; // Get only the first file
        if (!file) return;
        
        setFileUploading(true);
        try {
            const uploadedFile = {
                name: file.name,
                size: file.size,
                type: file.type,
                file: file  // Store the actual file object
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (new Date(audit.startDate) > new Date(audit.endDate)) {
          setError("Start date must be before end date");
          return;
        }
      
        setLoading(true);
        try {
          const formData = new FormData();
          formData.append('type', audit.type);
          formData.append('objective', audit.objective);
          formData.append('startDate', audit.startDate);
          formData.append('endDate', audit.endDate);
          formData.append('status', audit.status);
          formData.append('auditor', audit.auditor);
          formData.append('comment', audit.comment);
          formData.append('createdBy', 'temp-user');
          
          // Make sure this matches the field name in Multer
          if (audit.document) {
            formData.append('document', audit.document.file);
          }
      
          // Debugging - log FormData contents
          for (let [key, value] of formData.entries()) {
            console.log(key, value);
          }
      
          const response = await fetch("http://localhost:5000/api/audit/add", {
            method: "POST",
            body: formData // Don't set Content-Type header
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create audit");
          }
      
          navigate("/audits");
        } catch (err) {
          console.error("Create error:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };



    if (loading) return <div className="loading">Creating audit...</div>;

    return (
        <div className="create-audit-container">
            <div className="audit-form-header">
                <h2>Create New Audit</h2>
                <button className="btn-cancel" onClick={() => navigate("/audits")}>
                    <FaTimes /> Cancel
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="audit-form">
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

                <div className="form-row">
                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={audit.startDate}
                            onChange={handleDateChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="form-group">
                        <label>End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={audit.endDate}
                            onChange={handleDateChange}
                            required
                            min={audit.startDate || new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>

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
                            <option value="pending">Pending</option>
                            <option value="Ongoing">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Comments</label>
                        <input
                            type="text"
                            name="comment"
                            value={audit.comment}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

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

                <div className="form-actions">
                    <button type="submit" className="btn-submit" disabled={loading || fileUploading}>
                        <FaSave /> {loading ? "Creating..." : "Create Audit"}
                    </button>
                </div>
            </form>
        </div>
    );
}