import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; 
import './outcomes.css';

const OutcomeList = () => {
  const { auditId } = useParams(); 
  const outcomeTypes = [
    'Non-conformity',
    'OFI',
    'Strength',
    'Sensitive point',
  ];

  const [selectedType, setSelectedType] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    severity: '',
    description: '',
    perspectives: '',
    impactedAssets: '',
    actionPlan: '',
    bestPractice: '',
    riskLevel: '',
    monitoringPlan: ''
  });

  const [subActions, setSubActions] = useState([{ 
    id: Date.now(), 
    description: '', 
    status: 'Not started' 
  }]);

  const resetForm = () => {
    setFormData({
      title: '',
      severity: '',
      description: '',
      perspectives: '',
      impactedAssets: '',
      actionPlan: '',
      bestPractice: '',
      riskLevel: '',
      monitoringPlan: ''
    });
    setSubActions([{ 
      id: Date.now(), 
      description: '', 
      status: 'Not started' 
    }]);
  };

  const handleOpenDialog = (type) => {
    setSelectedType(type);
    resetForm();
    setDialogVisible(true);
  };

  const handleCloseDialog = () => {
    setDialogVisible(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubAction = () => {
    setSubActions(prev => [...prev, { 
      id: Date.now(), 
      description: '', 
      status: 'Not started' 
    }]);
  };

  const handleRemoveSubAction = (id) => {
    if (subActions.length > 1) {
      setSubActions(prev => prev.filter(action => action.id !== id));
    }
  };

  const handleSubActionChange = (id, field, value) => {
    setSubActions(prev => prev.map(action =>
      action.id === id ? { ...action, [field]: value } : action
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    const newItem = {
      ...formData,
      type: selectedType,
      date: new Date().toISOString(),
    };

    if (selectedType === 'Non-conformity') {
      newItem.subActions = subActions.filter(a => a.description.trim() !== '');
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/audits/${auditId}/outcomes`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Success:', result);
      setDialogVisible(false);
     
    } catch (error) {
      console.error('Error:', error);
      alert(`Error while saving the outcome: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <h1>Audit Outcome Types</h1>
      <div className="outcome-grid">
        {outcomeTypes.map((type) => (
          <div
            key={type}
            className="outcome-box"
            onClick={() => handleOpenDialog(type)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleOpenDialog(type)}
          >
            <h3>{type}</h3>
          </div>
        ))}
      </div>

      {dialogVisible && (
        <div className="dialog" role="dialog" aria-labelledby="dialog-title">
          <h2 id="dialog-title">Add {selectedType}</h2>
          <form onSubmit={handleSubmit}>
            {selectedType === 'Non-conformity' && (
              <>
                <label htmlFor="severity">Severity:</label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select...</option>
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                </select>

                <label htmlFor="description">Problem description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="impactedAssets">Impacted assets:</label>
                <input
                  id="impactedAssets"
                  name="impactedAssets"
                  value={formData.impactedAssets}
                  onChange={handleChange}
                  required
                />

                <div className="sub-actions">
                  <h3>Corrective sub-actions</h3>

                  {subActions.map((action) => (
                    <div key={action.id} className="sub-action">
                      <textarea
                        value={action.description}
                        onChange={(e) =>
                          handleSubActionChange(action.id, 'description', e.target.value)
                        }
                        placeholder="Sub-action description"
                        required
                      />
                      <select
                        value={action.status}
                        onChange={(e) =>
                          handleSubActionChange(action.id, 'status', e.target.value)
                        }
                      >
                        <option value="Not started">Not started</option>
                        <option value="In progress">In progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => handleRemoveSubAction(action.id)}
                        disabled={subActions.length <= 1}
                        aria-label="Remove sub-action"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="add-btn"
                    onClick={handleAddSubAction}
                    aria-label="Add sub-action"
                  >
                    + Add a sub-action
                  </button>
                </div>
              </>
            )}

            {selectedType === 'OFI' && (
              <>
                <label htmlFor="title">OFI title:</label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="description">OFI description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="impactedAssets">Impacted assets:</label>
                <input
                  id="impactedAssets"
                  name="impactedAssets"
                  value={formData.impactedAssets}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="actionPlan">Action plan:</label>
                <textarea
                  id="actionPlan"
                  name="actionPlan"
                  value={formData.actionPlan}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            {selectedType === 'Strength' && (
              <>
                <label htmlFor="description">Strength description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            {selectedType === 'Sensitive point' && (
              <>
                <label htmlFor="description">Sensitive point description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </>
            )}

            <div className="btn-group">
              <button type="submit">Save</button>
              <button type="button" onClick={handleCloseDialog}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OutcomeList;