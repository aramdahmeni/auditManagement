import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSortUp, FaSortDown, FaCheckCircle, FaClock, FaExclamationTriangle } from "react-icons/fa"; 
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./list.css";

export default function List() {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [hoveredAudit, setHoveredAudit] = useState(null); 
  const [hoveredDate, setHoveredDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/audit/");
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des audits");
        }
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

  const handleSortChange = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    setAudits([...audits].sort((a, b) => {
      if (newSortOrder === "asc") {
        return new Date(a.startDate) - new Date(b.startDate);
      } else {
        return new Date(b.startDate) - new Date(a.startDate);
      }
    }));
  };

  const filteredAudits = audits.filter((audit) => {
    return (
      (statusFilter === "" || audit.status === statusFilter) &&
      (searchTerm === "" ||
        audit.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.startDate.includes(searchTerm) ||
        audit.endDate.includes(searchTerm))
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "green";
      case "Ongoing":
        return "orange";
      case "Pending":
        return "#D50000";
      default:
        return "gray";
    }
  };

  const handleEventHover = (info) => {

    setHoveredAudit(info.event.extendedProps.endDate);
    setHoveredDate(info.event.start);
  };

  const handleEventLeave = () => {
   
    setHoveredAudit(null);
    setHoveredDate(null);
  };

  if (loading) return <div className="list-container">loading...</div>;
  if (error) return <div className="list-container">error : {error}</div>;

  return (
    <div className="list-container">
      <h2>All Audits</h2>

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="300px"
          eventContent={(eventInfo) => {
            const status = eventInfo.event.extendedProps.status;
            const objective = eventInfo.event.extendedProps.objective.replace(/^1a\s*/, "");

            let icon;
            if (status === "Completed") {
              icon = <FaCheckCircle style={{ color: "white", marginRight: "5px" }} />;
            } else if (status === "Ongoing") {
              icon = <FaClock style={{ color: "#FF4500", marginRight: "5px" }} />;
            } else if (status === "Pending") {
              icon = <FaExclamationTriangle style={{ color: "#D50000", marginRight: "5px" }} />;
            }

            return (
              <div
                style={{
                  backgroundColor: getStatusColor(status),
                  color: "#fff",
                  padding: "5px",
                  borderRadius: "5px",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {icon} {objective}
              </div>
            );
          }}
          events={audits.map((audit) => ({
            title: "",
            date: audit.startDate,
            backgroundColor: getStatusColor(audit.status),
            borderColor: getStatusColor(audit.status),
            textColor: "#fff",
            extendedProps: {
              objective: audit.objective.replace(/^1a\s*/, ""),
              type: audit.type,
              status: audit.status,
              endDate: audit.endDate,
            },
          }))}
          eventMouseEnter={handleEventHover}
          eventMouseLeave={handleEventLeave}
        />

     
        {hoveredAudit && hoveredDate && (
          <div
            className="end-date-box"
            style={{
              position: "absolute",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              zIndex: 10,
            }}
          >
            <strong>End Date: </strong>
            {new Date(hoveredAudit).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="filters">
        <div className="filter-controls">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search for a word or a date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="audit-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Objective</th>
              <th>
                Start Date
                <button className="sort-btn" onClick={handleSortChange}>
                  {sortOrder === "asc" ? <FaSortDown /> : <FaSortUp />}
                </button>
              </th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAudits.map((audit) => (
              <tr key={audit._id} onClick={() => navigate(`/audit/${audit._id}`)}>
                <td>{audit.type}</td>
                <td>{audit.objective}</td>
                <td>{new Date(audit.startDate).toLocaleDateString()}</td>
                <td>{new Date(audit.endDate).toLocaleDateString()}</td>
                <td className={`status ${
                  audit.status === "Ongoing" ? "ongoing" :
                  audit.status === "Completed" ? "completed" :
                  "pending"
                }`}>
                  {audit.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
