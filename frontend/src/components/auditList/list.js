import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSortUp, FaSortDown, FaPlus, FaFilter, FaTimes } from "react-icons/fa";
import "./list.css";

export default function List() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "startDate",
    direction: "asc"
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    searchTerm: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/audit/");
        if (!response.ok) throw new Error("Error loading audits");
        const data = await response.json();
        setAudits(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, []);

  const handleSortChange = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedAudits = [...audits].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
      searchTerm: ""
    });
  };

  const filteredAudits = sortedAudits.filter(audit => {
    const matchesStatus = !filters.status || audit.status === filters.status;
    const matchesStartDate = !filters.startDate || 
      new Date(audit.startDate) >= new Date(filters.startDate);
    const matchesEndDate = !filters.endDate || 
      new Date(audit.endDate) <= new Date(filters.endDate);
    const matchesSearch = !filters.searchTerm ||
      audit.objective.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      audit.type.toLowerCase().includes(filters.searchTerm.toLowerCase());

    return matchesStatus && matchesStartDate && matchesEndDate && matchesSearch;
  });

  if (loading) return <div className="list-container">Loading...</div>;
  if (error) return <div className="list-container">Error: {error}</div>;

  return (
    <div className="list-container">
      <div className="header-controls">
        <h2>All Audits</h2>
        <div className="action-buttons">
          <button 
            className="add-button"
            onClick={() => navigate("/audits/new")}
          >
            <FaPlus /> Add Audit
          </button>
          <button 
            className="filter-button"
            onClick={() => setShowFilterModal(true)}
          >
            <FaFilter /> Filter
          </button>
        </div>
      </div>

      {showFilterModal && (
        <div className="filter-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Filter Audits</h3>
              <button 
                className="close-button"
                onClick={() => setShowFilterModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="filter-group">
              <label>Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Start Date After</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>End Date Before</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                name="searchTerm"
                placeholder="Search audits..."
                value={filters.searchTerm}
                onChange={handleFilterChange}
              />
            </div>

            <div className="modal-actions">
              <button 
                className="reset-button"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
              <button 
                className="apply-button"
                onClick={() => setShowFilterModal(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <table className="audit-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Objective</th>
            <th 
              className="sortable-header"
              onClick={() => handleSortChange("startDate")}
            >
              <div className="header-content">
                Start Date
                <div className="sort-arrows">
                  <FaSortUp className={`arrow ${sortConfig.key === "startDate" && sortConfig.direction === "asc" ? "active" : ""}`} />
                  <FaSortDown className={`arrow ${sortConfig.key === "startDate" && sortConfig.direction === "desc" ? "active" : ""}`} />
                </div>
              </div>
            </th>
            <th 
              className="sortable-header"
              onClick={() => handleSortChange("endDate")}
            >
              <div className="header-content">
                End Date
                <div className="sort-arrows">
                  <FaSortUp className={`arrow ${sortConfig.key === "endDate" && sortConfig.direction === "asc" ? "active" : ""}`} />
                  <FaSortDown className={`arrow ${sortConfig.key === "endDate" && sortConfig.direction === "desc" ? "active" : ""}`} />
                </div>
              </div>
            </th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredAudits.map(audit => (
            <tr key={audit._id} onClick={() => navigate(`/audits/${audit._id}`)}>
              <td>{audit.type}</td>
              <td>{audit.objective}</td>
              <td>{new Date(audit.startDate).toLocaleDateString()}</td>
              <td>{new Date(audit.endDate).toLocaleDateString()}</td>
              <td className={`status ${audit.status.toLowerCase()}`}>
                {audit.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}