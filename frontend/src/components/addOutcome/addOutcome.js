import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaInfoCircle, FaChevronLeft, FaCheck, FaTimes } from 'react-icons/fa';
import './addOutcome.css';

const AddOutcome = () => {
  const { id } = useParams();
  const outcomeTypes = ['Non-conformity', 'OFI', 'Strength', 'Sensitive point'];
  const [selectedType, setSelectedType] = useState('');
  const [auditDetails, setAuditDetails] = useState(null);
  const [isLoadingAudit, setIsLoadingAudit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [addCAP, setAddCAP] = useState(true); // New state for CAP toggle
  const [showCAPWarning, setShowCAPWarning] = useState(false); // New state for warning modal
  
  const navigate = useNavigate();

  // Initialize form data based on outcome type
  const initializeFormData = () => {
    switch(selectedType) {
      case 'Non-conformity':
        return {
          type: 'Major',
          description: '',
          rootCause: '',
          impactedAsset: '',
          preventiveAction: ''
        };
      case 'OFI':
        return {
          description: '',
          perspective: '',
          impactedAsset: '',
          action: ''
        };
      case 'Strength':
      case 'Sensitive point':
        return { description: '' };
      default:
        return {};
    }
  };

  const [formData, setFormData] = useState(initializeFormData());
  const [capData, setCapData] = useState({
    responsible: '',
    action: '',
    dueDate: '',
    status: 'pending',
    effectiveness: '',
    completionDate: ''
  });

  // Fetch audit details
  useEffect(() => {
    const fetchAuditDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/audit/${id}`);
        if (!response.ok) throw new Error("Failed to fetch audit details");
        const data = await response.json();
        setAuditDetails(data);
      } catch (error) {
        console.error("Error fetching audit details:", error);
        setErrorMessage("Failed to load audit details");
      } finally {
        setIsLoadingAudit(false);
      }
    };
    fetchAuditDetails();
  }, [id]);

  // Reset form when outcome type changes
  useEffect(() => {
    setFormData(initializeFormData());
    setAddCAP(selectedType === 'Non-conformity'); // Default to true for NC
  }, [selectedType]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const resetForm = () => {
    setFormData(initializeFormData());
    if (selectedType === 'Non-conformity') {
      setCapData({
        responsible: '',
        action: '',
        dueDate: '',
        status: 'pending',
        effectiveness: '',
        completionDate: ''
      });
      setAddCAP(true);
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowSuccess(false);
    setShowCAPWarning(false);
  };

  const handleSelectType = (type) => {
    setSelectedType(type);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCapChange = (e) => {
    const { name, value } = e.target;
    setCapData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Reset completion-related fields if status changes from completed
      if (name === 'status' && value !== 'completed') {
        newData.effectiveness = '';
        newData.completionDate = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show warning if trying to create NC without CAP
    if (selectedType === 'Non-conformity' && !addCAP && !showCAPWarning) {
      setShowCAPWarning(true);
      return;
    }
    
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setShowSuccess(false);
    
    try {
      // Validate form data
      if (!selectedType) {
        throw new Error('Please select an outcome type');
      }

      // Validate completion date doesn't exceed due date
      if (selectedType === 'Non-conformity' && addCAP && capData.status === 'completed') {
        if (!capData.completionDate) {
          throw new Error('Completion date is required for completed CAP');
        }
        if (new Date(capData.completionDate) > new Date(capData.dueDate)) {
          throw new Error('Completion date cannot be after due date');
        }
      }

      const outcomeTypeMap = {
        'Strength': 'strength',
        'Non-conformity': 'nc',
        'OFI': 'ofi',
        'Sensitive point': 'sensitivepoint'
      };
      
      const type = outcomeTypeMap[selectedType];
      const outcomeResponse = await fetch('http://localhost:5000/api/outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId: id,
          type
        })
      });
  
      if (!outcomeResponse.ok) {
        const errorData = await outcomeResponse.json();
        throw new Error(errorData.error || 'Failed to create base outcome');
      }
      
      const outcomeData = await outcomeResponse.json();
  
      // Handle different outcome types
      switch(selectedType) {
        case 'Non-conformity':
          const ncResponse = await fetch('http://localhost:5000/api/nonConformity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              outcomeId: outcomeData.outcome._id,
              type: formData.type,
              description: formData.description,
              rootCause: formData.rootCause,
              impactedAsset: formData.impactedAsset,
              preventiveAction: formData.preventiveAction
            })
          });
  
          if (!ncResponse.ok) throw new Error('Failed to create non-conformity');
          const ncData = await ncResponse.json();
  
          if ((formData.type === 'Major' || formData.type === 'Minor') && addCAP) {
            const capResponse = await fetch('http://localhost:5000/api/cap', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ncId: ncData.nonConformity._id,
                responsible: capData.responsible,
                action: capData.action,
                dueDate: capData.dueDate,
                status: capData.status,
                effectiveness: capData.status === 'completed' ? capData.effectiveness : '',
                completionDate: capData.status === 'completed' ? capData.completionDate : ''
              })
            });
            if (!capResponse.ok) throw new Error('Failed to create CAP');
          }
          break;
  
        case 'OFI':
          const ofiResponse = await fetch('http://localhost:5000/api/ofi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              outcomeId: outcomeData.outcome._id,
              description: formData.description,
              perspective: formData.perspective,
              impactedAsset: formData.impactedAsset,
              action: formData.action
            })
          });
          if (!ofiResponse.ok) throw new Error('Failed to create OFI');
          break;
  
        case 'Strength':
          const strengthResponse = await fetch('http://localhost:5000/api/strength', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              outcomeId: outcomeData.outcome._id,
              description: formData.description
            })
          });
          if (!strengthResponse.ok) throw new Error('Failed to create Strength');
          break;
  
        case 'Sensitive point':
          const spResponse = await fetch('http://localhost:5000/api/sensitivePoint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              outcomeId: outcomeData.outcome._id,
              description: formData.description
            })
          });
          if (!spResponse.ok) throw new Error('Failed to create Sensitive Point');
          break;
  
        default:
          throw new Error('Invalid outcome type');
      }
  
      setSuccessMessage(`${selectedType} added successfully!`);
      setShowSuccess(true);
      resetForm();
    } catch (error) {
      console.error('Submission error:', error);
      setErrorMessage(error.message || 'Failed to save outcome');
    } finally {
      setLoading(false);
      setShowCAPWarning(false);
    }
  };

  const proceedWithoutCAP = () => {
    setShowCAPWarning(false);
    handleSubmit(new Event('submit')); // Trigger the submit again
  };

  if (isLoadingAudit) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading audit details...</p>
      </div>
    );
  }

  return (
    <div className="outcome-page-container">
      <FaChevronLeft className="header-arrow" onClick={() => navigate(`/audits/${id}/outcomes`)} />
      <br/>
      <div className="outcome-content-wrapper">
        <div className="audit-details-section compact">
          <h3>Audit Summary</h3>
          {auditDetails && (
            <div className="audit-details-card compact">
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{auditDetails.type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Objective:</span>
                <span className="detail-value">{auditDetails.objective}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status-${auditDetails.status.toLowerCase()}`}>
                  {auditDetails.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dates:</span>
                <span className="detail-value">
                  {new Date(auditDetails.startDate).toLocaleDateString()} - {' '}
                  {new Date(auditDetails.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <div className="outcome-selection">
            <h3>Outcome Types</h3>
            <div className="outcome-types compact">
              {outcomeTypes.map((type) => (
                <button
                  key={type}
                  className={`outcome-type-btn ${selectedType === type ? 'active' : ''}`}
                  onClick={() => handleSelectType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="outcome-form-section">
          {selectedType ? (
            <div className="outcome-form-container">
              <h2>Add {selectedType}</h2>
              
              <form onSubmit={handleSubmit}>
                {selectedType === 'Non-conformity' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="type">Severity</label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="Major">Major</option>
                        <option value="Minor">Minor</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="description">Problem Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="rootCause">Root Cause</label>
                      <textarea
                        id="rootCause"
                        name="rootCause"
                        value={formData.rootCause}
                        onChange={handleChange}
                        required
                        rows={4}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="impactedAsset">Impacted Asset</label>
                      <input
                        id="impactedAsset"
                        name="impactedAsset"
                        value={formData.impactedAsset}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="preventiveAction">Preventive Action</label>
                      <textarea
                        id="preventiveAction"
                        name="preventiveAction"
                        value={formData.preventiveAction}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>

                    <div className="form-group toggle-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={addCAP}
                          onChange={() => setAddCAP(!addCAP)}
                        />
                        Add Corrective Action Plan (CAP)
                      </label>
                      <span className="toggle-note">
                        {addCAP ? 'CAP will be created with this NC' : 'No CAP will be created with this NC'}
                      </span>
                    </div>

                    {addCAP && (
                      <>
                        <h3>Corrective Action Plan (CAP)</h3>
                        <div className="form-group">
                          <label htmlFor="responsible">Responsible Person</label>
                          <input
                            id="responsible"
                            name="responsible"
                            value={capData.responsible}
                            onChange={handleCapChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="action">Corrective Action</label>
                          <textarea
                            id="action"
                            name="action"
                            value={capData.action}
                            onChange={handleCapChange}
                            required
                            rows={4}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="dueDate">Due Date</label>
                          <input
                            type="date"
                            id="dueDate"
                            name="dueDate"
                            value={capData.dueDate}
                            onChange={handleCapChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="status">Status</label>
                          <select
                            id="status"
                            name="status"
                            value={capData.status}
                            onChange={handleCapChange}
                            required
                          >
                            <option value="pending">Pending</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        {capData.status === 'completed' && (
                          <>
                            <div className="form-group">
                              <label htmlFor="completionDate">Completion Date</label>
                              <input
                                type="date"
                                id="completionDate"
                                name="completionDate"
                                value={capData.completionDate}
                                onChange={handleCapChange}
                                required
                                max={capData.dueDate}
                              />
                              {capData.completionDate && new Date(capData.completionDate) > new Date(capData.dueDate) && (
                                <span className="error-text">Completion date cannot be after due date</span>
                              )}
                            </div>

                            <div className="form-group">
                              <label htmlFor="effectiveness">Effectiveness Evaluation</label>
                              <select
                                id="effectiveness"
                                name="effectiveness"
                                value={capData.effectiveness}
                                onChange={handleCapChange}
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
                      </>
                    )}
                  </>
                )}

                {selectedType === 'OFI' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="description">OFI Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="perspective">Perspective</label>
                      <input
                        id="perspective"
                        name="perspective"
                        value={formData.perspective}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="impactedAsset">Impacted Asset</label>
                      <input
                        id="impactedAsset"
                        name="impactedAsset"
                        value={formData.impactedAsset}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="action">Recommended Action</label>
                      <textarea
                        id="action"
                        name="action"
                        value={formData.action}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>
                  </>
                )}

                {selectedType === 'Strength' && (
                  <div className="form-group">
                    <label htmlFor="description">Strength Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={6}
                    />
                  </div>
                )}

                {selectedType === 'Sensitive point' && (
                  <div className="form-group">
                    <label htmlFor="description">Sensitive Point Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={6}
                    />
                  </div>
                )}

                <div className="form-messages">
                  {errorMessage && (
                    <div className="error-message">
                      <FaInfoCircle /> {errorMessage}
                    </div>
                  )}
                  {showSuccess && successMessage && (
                    <div className="success-message">
                      <FaCheck /> {successMessage}
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Outcome'}
                  </button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="select-outcome-prompt">
              <div className="prompt-content">
                <FaInfoCircle className="prompt-icon" />
                <h3>Select an outcome type to begin</h3>
                <p>Choose from the available outcome types on the left to document your audit findings.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CAP Warning Modal */}
      {showCAPWarning && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Missing Corrective Action Plan</h3>
            </div>
            <div className="modal-body">
              <p>It's strongly recommended to add a Corrective Action Plan (CAP) for non-conformities.</p>
              <p>Are you sure you want to create this non-conformity without a CAP?</p>
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn confirm-btn"
                onClick={proceedWithoutCAP}
              >
                Yes, Create Without CAP
              </button>
              <button 
                className="modal-btn cancel-btn"
                onClick={() => {
                  setAddCAP(true);
                  setShowCAPWarning(false);
                }}
              >
                No, Add CAP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddOutcome;