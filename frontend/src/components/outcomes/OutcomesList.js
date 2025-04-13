import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './outcomes.css';

const OutcomeList = () => {
  const { id: auditId } = useParams();

  const outcomeTypes = ['Non-conformity', 'OFI', 'Strength', 'Sensitive point'];

  const [selectedType, setSelectedType] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [outcomes, setOutcomes] = useState([]);
  const [loadingOutcomes, setLoadingOutcomes] = useState(true);

  const initialFormState = {
    title: '',
    severity: '',
    description: '',
    perspectives: '',
    impactedAssets: '',
    actionPlan: '',
    bestPractice: '',
    riskLevel: '',
    monitoringPlan: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [subActions, setSubActions] = useState([{ id: Date.now(), description: '', status: 'Not started' }]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchOutcomes = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/audits/${auditId}/outcomes`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setOutcomes(data);
      } catch (error) {
        console.error('Error fetching outcomes:', error);
        setErrorMessage('Failed to load outcomes');
      } finally {
        setLoadingOutcomes(false);
      }
    };

    fetchOutcomes();
  }, [auditId, successMessage]);

  const resetForm = () => {
    setFormData(initialFormState);
    setSubActions([{ id: Date.now(), description: '', status: 'Not started' }]);
  };

  const handleOpenDialog = (type) => {
    setSelectedType(type);
    resetForm();
    setDialogVisible(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCloseDialog = () => {
    setDialogVisible(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubAction = () => {
    setSubActions((prev) => [...prev, { id: Date.now(), description: '', status: 'Not started' }]);
  };

  const handleRemoveSubAction = (id) => {
    if (subActions.length > 1) {
      setSubActions((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSubActionChange = (id, field, value) => {
    setSubActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const newItem = {
      ...formData,
      type: selectedType,
      date: new Date().toISOString(),
    };

    if (selectedType === 'Non-conformity') {
      newItem.subActions = subActions.filter((a) => a.description.trim() !== '');
    }

    try {
      const response = await fetch(`http://localhost:3000/api/audits/${auditId}/outcomes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      await response.json();
      setSuccessMessage('Outcome successfully saved.');
      setTimeout(() => {
        setDialogVisible(false);
        resetForm();
      }, 1500);
    } catch (error) {
      setErrorMessage(`Error: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOutcomesByType = (type) => {
    return outcomes.filter(outcome => outcome.type === type);
  };

  const renderOutcomeItem = (outcome) => {
    switch (outcome.type) {
      case 'Non-conformity':
        return (
          <div className="ol-outcome-item">
            <h4>{outcome.severity} Non-conformity</h4>
            <p><strong>Description:</strong> {outcome.description}</p>
            <p><strong>Impacted Assets:</strong> {outcome.impactedAssets}</p>
            {outcome.subActions && outcome.subActions.length > 0 && (
              <div>
                <strong>Corrective Actions:</strong>
                <ul>
                  {outcome.subActions.map((action, idx) => (
                    <li key={idx}>
                      {action.description} - <span className={`status-${action.status.toLowerCase().replace(' ', '-')}`}>{action.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 'OFI':
        return (
          <div className="ol-outcome-item">
            <h4>{outcome.title}</h4>
            <p><strong>Description:</strong> {outcome.description}</p>
            <p><strong>Impacted Assets:</strong> {outcome.impactedAssets}</p>
            <p><strong>Action Plan:</strong> {outcome.actionPlan}</p>
          </div>
        );
      case 'Strength':
        return (
          <div className="ol-outcome-item">
            <h4>Strength</h4>
            <p>{outcome.description}</p>
          </div>
        );
      case 'Sensitive point':
        return (
          <div className="ol-outcome-item">
            <h4>Sensitive Point</h4>
            <p>{outcome.description}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="ol-container">
      <h1>Audit Outcome Types</h1>
      <div className="ol-grid">
        {outcomeTypes.map((type) => (
          <div
            key={type}
            className={`ol-card ol-card-${type.toLowerCase().replace(' ', '-')}`}
            onClick={() => handleOpenDialog(type)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleOpenDialog(type)}
          >
            <h3 className="ol-card-title">{type}</h3>
            <div className="ol-card-icon">
              {type === 'Non-conformity' && <span>⚠️</span>}
              {type === 'OFI' && <span>💡</span>}
              {type === 'Strength' && <span>👍</span>}
              {type === 'Sensitive point' && <span>🔍</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="ol-existing-outcomes">
        <h2>Existing Outcomes</h2>
        {loadingOutcomes ? (
          <div className="ol-loading">Loading outcomes...</div>
        ) : outcomes.length === 0 ? (
          <div className="ol-no-outcomes">No outcomes found for this audit.</div>
        ) : (
          outcomeTypes.map((type) => {
            const typeOutcomes = getOutcomesByType(type);
            if (typeOutcomes.length === 0) return null;
            
            return (
              <div key={type} className="ol-outcome-type-section">
                <h3 className="ol-outcome-type-header">
                  {type}
                  <span className="ol-outcome-type-icon">
                    {type === 'Non-conformity' && '⚠️'}
                    {type === 'OFI' && '💡'}
                    {type === 'Strength' && '👍'}
                    {type === 'Sensitive point' && '🔍'}
                  </span>
                  <span className="ol-outcome-count">({typeOutcomes.length})</span>
                </h3>
                <div className="ol-outcome-list">
                  {typeOutcomes.map((outcome, index) => (
                    <div key={index} className={`ol-outcome-card ol-outcome-${type.toLowerCase().replace(' ', '-')}`}>
                      {renderOutcomeItem(outcome)}
                      <div className="ol-outcome-date">
                        {new Date(outcome.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {dialogVisible && (
        <>
          <div className="ol-dialog-overlay" onClick={handleCloseDialog} />
          <div className="ol-dialog" role="dialog" aria-labelledby="ol-dialog-title">
            <h2 id="ol-dialog-title" className="ol-dialog-title">
              Add {selectedType}
              <span className="ol-dialog-type-icon">
                {selectedType === 'Non-conformity' && '⚠️'}
                {selectedType === 'OFI' && '💡'}
                {selectedType === 'Strength' && '👍'}
                {selectedType === 'Sensitive point' && '🔍'}
              </span>
            </h2>
            <form onSubmit={handleSubmit} className="ol-form">
              {selectedType === 'Non-conformity' && (
                <>
                  <div className="ol-form-group">
                    <label htmlFor="severity" className="ol-form-label">Severity:</label>
                    <select
                      id="severity"
                      name="severity"
                      value={formData.severity}
                      onChange={handleChange}
                      className="ol-form-select"
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Major">Major</option>
                      <option value="Minor">Minor</option>
                    </select>
                  </div>

                  <div className="ol-form-group">
                    <label htmlFor="description" className="ol-form-label">Problem description:</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="ol-form-textarea"
                      required
                    />
                  </div>

                  <div className="ol-form-group">
                    <label htmlFor="impactedAssets" className="ol-form-label">Impacted assets:</label>
                    <input
                      id="impactedAssets"
                      name="impactedAssets"
                      value={formData.impactedAssets}
                      onChange={handleChange}
                      className="ol-form-input"
                      required
                    />
                  </div>

                  <div className="ol-sub-actions">
                    <h3 className="ol-sub-actions-title">Corrective sub-actions</h3>
                    {subActions.map((action) => (
                      <div key={action.id} className="ol-sub-action">
                        <textarea
                          value={action.description}
                          onChange={(e) => handleSubActionChange(action.id, 'description', e.target.value)}
                          className="ol-form-textarea ol-sub-action-input"
                          placeholder="Sub-action description"
                          required
                        />
                        <select
                          value={action.status}
                          onChange={(e) => handleSubActionChange(action.id, 'status', e.target.value)}
                          className="ol-form-select ol-sub-action-select"
                        >
                          <option value="Not started">Not started</option>
                          <option value="In progress">In progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubAction(action.id)}
                          disabled={subActions.length <= 1}
                          className="ol-btn ol-btn-remove"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddSubAction}
                      className="ol-btn ol-btn-add"
                    >
                      + Add a sub-action
                    </button>
                  </div>
                </>
              )}

              {selectedType === 'OFI' && (
                <>
                  <div className="ol-form-group">
                    <label htmlFor="title" className="ol-form-label">OFI title:</label>
                    <input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="ol-form-input"
                      required
                    />
                  </div>

                  <div className="ol-form-group">
                    <label htmlFor="description" className="ol-form-label">OFI description:</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="ol-form-textarea"
                      required
                    />
                  </div>

                  <div className="ol-form-group">
                    <label htmlFor="impactedAssets" className="ol-form-label">Impacted assets:</label>
                    <input
                      id="impactedAssets"
                      name="impactedAssets"
                      value={formData.impactedAssets}
                      onChange={handleChange}
                      className="ol-form-input"
                      required
                    />
                  </div>

                  <div className="ol-form-group">
                    <label htmlFor="actionPlan" className="ol-form-label">Action plan:</label>
                    <textarea
                      id="actionPlan"
                      name="actionPlan"
                      value={formData.actionPlan}
                      onChange={handleChange}
                      className="ol-form-textarea"
                      required
                    />
                  </div>
                </>
              )}

              {selectedType === 'Strength' && (
                <div className="ol-form-group">
                  <label htmlFor="description" className="ol-form-label">Strength description:</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="ol-form-textarea"
                    required
                  />
                </div>
              )}

              {selectedType === 'Sensitive point' && (
                <div className="ol-form-group">
                  <label htmlFor="description" className="ol-form-label">Sensitive point description:</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="ol-form-textarea"
                    required
                  />
                </div>
              )}

              {errorMessage && (
                <div className="ol-message ol-message-error">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="ol-message ol-message-success">
                  {successMessage}
                </div>
              )}

              <div className="ol-form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="ol-btn ol-btn-primary"
                >
                  {loading ? (
                    <>
                      <span className="ol-spinner"></span> Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="ol-btn ol-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default OutcomeList;