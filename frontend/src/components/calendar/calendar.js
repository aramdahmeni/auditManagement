import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./calendar.css";

const statusColors = {
  Ongoing: '#f39c12',
  Completed: '#2ecc71',
  Pending: '#e74c3c',
  default: '#3498db' // Added default color
};

export default function Calendar() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/audit/");
        const data = await res.json();
        setAudits(data.map(audit => ({
          title: `${audit.type}: ${audit.objective}`, // Combine type and objective
          start: audit.startDate,
          end: audit.endDate,
          backgroundColor: statusColors[audit.status] || statusColors.default,
          borderColor: statusColors[audit.status] || statusColors.default,
          extendedProps: audit
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, []);

  // Custom event content renderer
  const renderEventContent = (eventInfo) => {
    return (
      <div className="custom-event">
        <div className="event-title">{eventInfo.event.title}</div>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="compact-calendar">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        height="auto"
        headerToolbar={{
          start: "title",
          end: "prev,next"
        }}
        events={audits}
        eventContent={renderEventContent} 
        dayMaxEvents={3} 
        moreLinkContent={(args) => {
          return `+ ${args.num} more`; 
        }}
      />
    </div>
  );
}