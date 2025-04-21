import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaInfoCircle, FaEdit, FaTrash, FaPlus, FaChevronLeft, FaCheck, FaTimes } from 'react-icons/fa';
import './outcomes.css';

const OutcomeList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auditDetails, setAuditDetails] = useState(null);
  const [outcomes, setOutcomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [outcomeToDelete, setOutcomeToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingOutcomeId, setEditingOutcomeId] = useState(null);
  const [editedOutcome, setEditedOutcome] = useState(null);
  const [addingCAP, setAddingCAP] = useState(false);
  const [newCAP, setNewCAP] = useState({
    responsible: '',
    action: '',
    dueDate: '',
    status: 'pending',
    effectiveness: '',
    completionDate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const auditResponse = await fetch(`http://localhost:5000/api/audit/${id}`);
        if (!auditResponse.ok) throw new Error("Failed to fetch audit details");
        const auditData = await auditResponse.json();
        
        const outcomesResponse = await fetch(`http://localhost:5000/api/outcome/${id}`);
        if (!outcomesResponse.ok) throw new Error("Failed to fetch outcomes");
        const outcomesData = await outcomesResponse.json();
        
        setAuditDetails(auditData);
        setOutcomes(outcomesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleAdd = () => {
    navigate(`/audits/${id}/outcomes/add`);
  };
  const handleGenerateReport = () => {
    navigate(`/audits/${id}/report`);
  };

  const handleEditClick = (outcome) => {
    setEditingOutcomeId(outcome._id);
    setEditedOutcome(JSON.parse(JSON.stringify(outcome)));
    setAddingCAP(false);
  };

  const handleCancelEdit = () => {
    setEditingOutcomeId(null);
    setEditedOutcome(null);
    setAddingCAP(false);
  };

  const handleSaveEdit = async () => {
    try {
      setIsLoading(true);
  
      const type = editedOutcome.type;
      const detailId = editedOutcome.details._id;
      const detailData = editedOutcome.details;
  
      if (!detailId) {
        throw new Error(`Missing or invalid sub-document ID`);
      }

      let typePath = type;
      if (type === "nc") {
        typePath = "nonConformity";
      }

      const response = await fetch(`http://localhost:5000/api/${typePath}/edit/${detailId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(detailData),
      });
  
      if (!response.ok) throw new Error("Failed to update outcome detail");
  
      const updatedOutcomes = outcomes.map(o =>
        o._id === editedOutcome._id ? { ...o, details: { ...o.details, ...detailData } } : o
      );
  
      setOutcomes(updatedOutcomes);
      handleCancelEdit();
    } catch (error) {
      console.error("Error updating outcome detail:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCAP = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/cap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ncId: editedOutcome.details._id,
          responsible: newCAP.responsible,
          action: newCAP.action,
          dueDate: newCAP.dueDate,
          status: newCAP.status,
          effectiveness: newCAP.status === 'completed' ? newCAP.effectiveness : '',
          completionDate: newCAP.status === 'completed' ? newCAP.completionDate : ''
        })
      });

      if (!response.ok) throw new Error("Failed to add CAP");

      const capData = await response.json();
      
      const updatedOutcomes = outcomes.map(o => {
        if (o._id === editedOutcome._id) {
          return {
            ...o,
            details: {
              ...o.details,
              cap: capData.cap
            }
          };
        }
        return o;
      });

      setOutcomes(updatedOutcomes);
      setEditedOutcome(updatedOutcomes.find(o => o._id === editedOutcome._id));
      setAddingCAP(false);
      setNewCAP({
        responsible: '',
        action: '',
        dueDate: '',
        status: 'pending',
        effectiveness: '',
        completionDate: ''
      });
    } catch (error) {
      console.error("Error adding CAP:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field, value, nestedPath = null) => {
    const updatedOutcome = { ...editedOutcome };
    
    if (nestedPath) {
      const pathParts = nestedPath.split('.');
      let current = updatedOutcome;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
      }
      
      current[pathParts[pathParts.length - 1]] = value;
    } else {
      updatedOutcome[field] = value;
    }
    
    setEditedOutcome(updatedOutcome);
  };

  const handleCAPFieldChange = (e) => {
    const { name, value } = e.target;
    setNewCAP(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'status' && value !== 'completed') {
        newData.effectiveness = '';
        newData.completionDate = '';
      }
      
      return newData;
    });
  };

  const handleDeleteClick = (outcome) => {
    setOutcomeToDelete(outcome);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/outcome/${outcomeToDelete._id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error("Failed to delete outcome");
      
      const updatedOutcomes = outcomes.filter(o => o._id !== outcomeToDelete._id);
      setOutcomes(updatedOutcomes);
      setShowDeleteModal(false);
      setOutcomeToDelete(null);
    } catch (error) {
      console.error("Error deleting outcome:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOutcomeToDelete(null);
  };

  const formatEffectiveness = (value) => {
    if (!value) return 'N/A';
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderEditableField = (label, value, path, type = 'text') => {
    if (editingOutcomeId && editedOutcome) {
      if (label === 'Severity' && path === 'details.type') {
        return (
          <div className="detail-item">
            <span className="detail-label">{label}:</span>
            <select
              value={value || ''}
              onChange={(e) => handleFieldChange(null, e.target.value, path)}
              className="edit-input"
            >
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>
        );
      }
      
      if (label === 'Effectiveness' && path === 'details.cap.effectiveness') {
        return (
          <div className="detail-item">
            <span className="detail-label">{label}:</span>
            <select
              value={value || ''}
              onChange={(e) => handleFieldChange(null, e.target.value, path)}
              className="edit-input"
            >
              <option value="">Select effectiveness</option>
              <option value="effective">Effective</option>
              <option value="partially_effective">Partially Effective</option>
              <option value="not_effective">Not Effective</option>
            </select>
          </div>
        );
      }
      
      return (
        <div className="detail-item">
          <span className="detail-label">{label}:</span>
          {type === 'textarea' ? (
            <textarea
              value={value || ''}
              onChange={(e) => handleFieldChange(null, e.target.value, path)}
              className="edit-input"
            />
          ) : type === 'date' ? (
            <input
              type="date"
              value={value ? new Date(value).toISOString().split('T')[0] : ''}
              onChange={(e) => handleFieldChange(null, e.target.value, path)}
              className="edit-input"
            />
          ) : (
            <input
              type={type}
              value={value || ''}
              onChange={(e) => handleFieldChange(null, e.target.value, path)}
              className="edit-input"
            />
          )}
        </div>
      );
    }
    
    return (
      <div className="detail-item">
        <span className="detail-label">{label}:</span>
        <span>
          {type === 'date' && value ? new Date(value).toLocaleDateString() : 
           label === 'Effectiveness' ? formatEffectiveness(value) : 
           value || 'N/A'}
        </span>
      </div>
    );
  };

  const renderEditButtons = (outcome) => {
    if (editingOutcomeId === outcome._id) {
      return (
        <div className="section-actions">
          <button 
            className="icon-btn save-btn"
            onClick={handleSaveEdit}
            title="Save changes"
            disabled={isLoading}
          >
            <FaCheck size={16} />
          </button>
          <button 
            className="icon-btn cancel-btn"
            onClick={handleCancelEdit}
            title="Cancel editing"
            disabled={isLoading}
          >
            <FaTimes size={16} />
          </button>
        </div>
      );
    }
    
    return (
      <button 
        className="icon-btn edit-btn"
        onClick={() => handleEditClick(outcome)}
        title="Edit outcome"
      >
        <FaEdit size={14} />
      </button>
    );
  };

  const renderAddCAPSection = () => {
    if (!addingCAP) return null;

    return (
      <div className="detail-group">
        <div className="group-header">
          <h4>Add Corrective Action Plan</h4>
        </div>
        <div className="form-group">
          <label>Action</label>
          <textarea
            name="action"
            value={newCAP.action}
            onChange={handleCAPFieldChange}
            required
            rows={4}
          />
        </div>
        <div className="form-group">
          <label>Responsible Person</label>
          <input
            name="responsible"
            value={newCAP.responsible}
            onChange={handleCAPFieldChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={newCAP.dueDate}
            onChange={handleCAPFieldChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select
            name="status"
            value={newCAP.status}
            onChange={handleCAPFieldChange}
            required
          >
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {newCAP.status === 'completed' && (
          <>
            <div className="form-group">
              <label>Completion Date</label>
              <input
                type="date"
                name="completionDate"
                value={newCAP.completionDate}
                onChange={handleCAPFieldChange}
                required
                max={newCAP.dueDate}
              />
            </div>
            <div className="form-group">
              <label>Effectiveness</label>
              <select
                name="effectiveness"
                value={newCAP.effectiveness}
                onChange={handleCAPFieldChange}
                required
              >
                <option value="">Select effectiveness</option>
                <option value="effective">Effective</option>
                <option value="partially_effective">Partially Effective</option>
                <option value="not_effective">Not Effective</option>
              </select>
            </div>
          </>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            className="submit-btn"
            onClick={handleAddCAP}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save CAP'}
          </button>
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => setAddingCAP(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const renderAddCAPButton = (outcome) => {
    if (editingOutcomeId === outcome._id && 
        outcome.type === 'nc' && 
        !outcome.details.cap && 
        !addingCAP) {
      return (
        <button 
          className="add-cap-btn"
          onClick={() => setAddingCAP(true)}
        >
          + Add Corrective Action Plan
        </button>
      );
    }
    return null;
  };

  const renderOutcomeDetails = (outcome) => {
    if (!outcome) return null;
    const currentOutcome = editingOutcomeId === outcome._id ? editedOutcome : outcome;
    
    switch(currentOutcome.type) {
      case 'nc':
        return (
          <>
            <div className="detail-group">
              <div className="group-header">
                <h4>Non-Conformity Details</h4>
                {renderEditButtons(outcome)}
              </div>
              {renderEditableField('Severity', currentOutcome.details?.type, 'details.type', 'text')}
              {renderEditableField('Description', currentOutcome.details?.description, 'details.description', 'textarea')}
              {renderEditableField('Root Cause', currentOutcome.details?.rootCause, 'details.rootCause', 'textarea')}
              {renderEditableField('Impacted Asset', currentOutcome.details?.impactedAsset, 'details.impactedAsset', 'text')}
              {renderEditableField('Preventive Action', currentOutcome.details?.preventiveAction, 'details.preventiveAction', 'textarea')}
            </div>

            {currentOutcome.details?.cap && (
              <div className="detail-group">
                <div className="group-header">
                  <h4>Corrective Action Plan</h4>
                </div>
                {renderEditableField('Action', currentOutcome.details.cap.action, 'details.cap.action', 'textarea')}
                {renderEditableField('Responsible', currentOutcome.details.cap.responsible, 'details.cap.responsible', 'text')}
                {renderEditableField('Due Date', currentOutcome.details.cap.dueDate, 'details.cap.dueDate', 'date')}
                {renderEditableField('Status', currentOutcome.details.cap.status, 'details.cap.status', 'text')}
                
                {currentOutcome.details.cap.status === 'completed' && (
                  <>
                    {renderEditableField('Completion Date', currentOutcome.details.cap.completionDate, 'details.cap.completionDate', 'date')}
                    {renderEditableField('Effectiveness', currentOutcome.details.cap.effectiveness, 'details.cap.effectiveness', 'text')}
                  </>
                )}
              </div>
            )}

            {renderAddCAPButton(outcome)}
            {addingCAP && renderAddCAPSection()}
          </>
        );
      case 'ofi':
        return (
          <div className="detail-group">
            <div className="group-header">
              <h4>Opportunity for Improvement Details</h4>
              {renderEditButtons(outcome)}
            </div>
            {renderEditableField('Description', currentOutcome.details?.description, 'details.description', 'textarea')}
            {renderEditableField('Perspective', currentOutcome.details?.perspective, 'details.perspective', 'text')}
            {renderEditableField('Impacted Asset', currentOutcome.details?.impactedAsset, 'details.impactedAsset', 'text')}
            {currentOutcome.details?.action && (
              renderEditableField('Recommended Action', currentOutcome.details.action, 'details.action', 'textarea')
            )}
          </div>
        );
      case 'strength':
        return (
          <div className="detail-group">
            <div className="group-header">
              <h4>Strength Details</h4>
              {renderEditButtons(outcome)}
            </div>
            {renderEditableField('Description', currentOutcome.details?.description, 'details.description', 'textarea')}
          </div>
        );
      case 'sensitivepoint':
        return (
          <div className="detail-group">
            <div className="group-header">
              <h4>Sensitive Point Details</h4>
              {renderEditButtons(outcome)}
            </div>
            {renderEditableField('Description', currentOutcome.details?.description, 'details.description', 'textarea')}
          </div>
        );
      default:
        return null;
    }
  };

  const renderOutcomes = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading outcomes...</p>
        </div>
      );
    }

    if (!outcomes || outcomes.length === 0) {
      return (
        <div className="no-outcomes">
          <FaInfoCircle className="info-icon" size={24} />
          <p>No outcomes recorded for this audit.
            <br/> <span className="click-to-add" onClick={handleAdd}>Click to add.</span>
          </p>
        </div>
      );
    }

    return (
      <div className="outcomes-container">
        {outcomes.map((outcome) => (
          <div key={outcome._id} className={`outcome-card ${outcome.type} ${editingOutcomeId === outcome._id ? 'editing' : ''}`}>
            <div className="outcome-header">
              <div>
                <h4 className="outcome-type">
                  {outcome.type === 'nc' && 'Non-conformity'}
                  {outcome.type === 'ofi' && 'Opportunity for Improvement'}
                  {outcome.type === 'strength' && 'Strength'}
                  {outcome.type === 'sensitivepoint' && 'Sensitive Point'}
                </h4>
                {outcome.type === 'nc' && outcome.details?.type && (
                  <span className={`severity-badge ${outcome.details.type.toLowerCase()}`}>
                    {outcome.details.type}
                  </span>
                )}
              </div>
              <div className="outcome-actions">
                {editingOutcomeId !== outcome._id && (
                  <button 
                    className="icon-btn delete-btn"
                    onClick={() => handleDeleteClick(outcome)}
                    title="Delete outcome"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="outcome-content">
              {renderOutcomeDetails(outcome)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="outcome-page-container">
      <div className="header-nav">
        <button className="back-button" onClick={() => navigate(`/audits/${id}`)}>
          <FaChevronLeft className="header-arrow" size={18} />
          <span>Back to Audit</span>
        </button>
      </div>
      
      <div className="outcome-content-wrapper">
        <div className="left-section">
          <div className="audit-details-section">
            <h3>Audit Summary</h3>
            {auditDetails && (
              <div className="audit-details-card">
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{auditDetails.type || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Objective:</span>
                  <span className="detail-value">{auditDetails.objective || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value status-completed">
                    {auditDetails.status || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Dates:</span>
                  <span className="detail-value">
                    {auditDetails.startDate ? new Date(auditDetails.startDate).toLocaleDateString() : 'N/A'} - {' '}
                    {auditDetails.endDate ? new Date(auditDetails.endDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="report-section">
                <h4>Report</h4>
                <div className="report-status">
                  <p>No report available</p>
                  <button 
                    className="generate-report-btn"
                    onClick={handleGenerateReport}
                  >
                    Click to generate
                  </button>
                </div>
              </div>
        </div>

        <div className="right-section">
          <div className="outcomes-display-section">
            <div className="outcomes-header">
              <h3>Recorded Outcomes</h3>
              <button className="add-outcome-btn" onClick={handleAdd}>
                <FaPlus size={14} /> Add Outcome
              </button>
            </div>
            {renderOutcomes()}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this outcome?</p>
            <div className="modal-actions">
              <button className="btn cancel-btn" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn confirm-delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutcomeList; 