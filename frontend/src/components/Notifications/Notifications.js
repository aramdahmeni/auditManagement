import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaClock,
  
  FaSpinner,
  FaRegBell,
  
  FaExclamationTriangle,
  FaCalendarAlt,
  FaFire,
  FaClipboardCheck,
  FaClipboardList
} from "react-icons/fa";
import "./Notifications.css";

function Notifications() {
  const [pending, setPending] = useState([]);
  const [ongoing, setOngoing] = useState([]);
  const [ended, setEnded] = useState([]);
  const [capsDeadline, setCapsDeadline] = useState([]);
  const [ncWithoutCap, setNcWithoutCap] = useState([]);
  const [completedWithoutOutcomes, setCompletedWithoutOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [
          pendingRes,
          ongoingRes,
          endedRes,
          capsDeadlineRes,
          ncWithoutCapRes,
          completedNoOutcomesRes
        ] = await Promise.all([
          fetch("http://localhost:5000/api/notifications/pending"),
          fetch("http://localhost:5000/api/notifications/ongoing-ending-soon"),
          fetch("http://localhost:5000/api/notifications/completed-major-nc"),
          fetch("http://localhost:5000/api/notifications/cap-deadline"),
          fetch("http://localhost:5000/api/notifications/nc-without-cap"),
          fetch("http://localhost:5000/api/notifications/completed-no-outcomes")
        ]);

        const now = new Date();

        const ongoingData = (await ongoingRes.json()).notifications || [];
        const filteredOngoing = ongoingData
          .map((notif) => {
            const end = new Date(notif.endDate);
            const diffInDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
            return diffInDays > 0 && diffInDays <= 7 ? { ...notif, daysLeft: diffInDays } : null;
          })
          .filter(Boolean);


        setPending((await pendingRes.json()).notifications || []);
        setOngoing(filteredOngoing);
        setEnded((await endedRes.json()).notifications || []);
        setCapsDeadline((await capsDeadlineRes.json()).notifications || []);
        setNcWithoutCap((await ncWithoutCapRes.json()).notifications || []);
        setCompletedWithoutOutcomes((await completedNoOutcomesRes.json()).notifications || []);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const renderSection = (title, data, Icon, fallbackMessage, contentRenderer, color) => (
    <motion.section
      className="notification-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="section-header">
        <div className="section-title" style={{ color }}>
          <Icon className="section-icon" />
          <h2>{title}</h2>
          <span className="notification-count-badge">{data.length}</span>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="empty-message">{fallbackMessage}</p>
      ) : (
        <ul className="notification-list">
          {data.map((notif) => (
            <motion.li
              key={notif._id || notif.auditId || Math.random()}
              className="notification-item"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="message">{notif.message}</p>
              {contentRenderer(notif)}
            </motion.li>
          ))}
        </ul>
      )}
    </motion.section>
  );

  if (loading) {
    return (
      <div className="loading">
        <FaSpinner className="spinner" /> Loading notifications...
      </div>
    );
  }

  const totalNotifications = pending.length + ongoing.length + ended.length + 
                          capsDeadline.length + ncWithoutCap.length + 
                          completedWithoutOutcomes.length;

  return (
    <div className="notifications-container">
      <header className="notifications-header">
        <h1>
          <FaRegBell className="header-icon" />
          Notifications Center
          <span className="total-notifications-badge">{totalNotifications}</span>
        </h1>
      </header>

      {renderSection(
        "Pending Audits",
        pending,
        FaClock,
        "No pending audits",
        (notif) => <p className="notification-status">Status: {notif.status}</p>,
        "#e74c3c"
      )}

      {renderSection(
        "Ongoing Audits (ending soon)",
        ongoing,
        FaCalendarAlt,
        "No ongoing audits ending soon",
        (notif) => (
          <p className="notification-date">
            ⏳ <strong>{notif.daysLeft}</strong> day(s) remaining
            <br />
            {new Date(notif.endDate).toLocaleDateString()}
          </p>
        ),
        "#f39c12"
      )}

      {renderSection(
        "Completed Without Outcomes",
        completedWithoutOutcomes,
        FaClipboardList,
        "All completed audits have outcomes",
        (notif) => (
          <p className="notification-date">
            Completed on: {new Date(notif.endDate).toLocaleDateString()}
            <br />
            
          </p>
        ),
        "#3498db"
      )}

      {renderSection(
        "Major Non-Conformities",
        ended,
        FaExclamationTriangle,
        "No major non-conformities",
        (notif) => (
          <p className="notification-nc">
            ⚠️ {notif.majorNCCount} major NC(s)
          </p>
        ),
        "#c0392b"
      )}

      {renderSection(
        "CAP Deadlines",
        capsDeadline,
        FaFire,
        "No approaching CAP deadlines",
        (notif) => (
          <p className="notification-date">
            Due: {new Date(notif.dueDate).toLocaleDateString()}
          </p>
        ),
        "#8e44ad"
      )}

      {renderSection(
        "NCs Without CAP",
        ncWithoutCap,
        FaClipboardCheck,
        "All NCs have CAPs",
        (notif) => (
          <p className="notification-nc">
            {notif.details?.type || 'NC'} without CAP
          </p>
        ),
        "#d35400"
      )}
    </div>
  );
}

export default Notifications;
