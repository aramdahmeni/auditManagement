import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaClock, FaCalendarAlt, FaExclamationCircle,
  FaSpinner, FaRegBell
} from "react-icons/fa";
import "./Notifications.css";

function Notifications() {
  const [pending, setPending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [ongoing, setOngoing] = useState([]);
  const [ended, setEnded] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [pendingRes, upcomingRes, ongoingRes] = await Promise.all([
          fetch("http://localhost:5000/api/notifications/pending"),
          fetch("http://localhost:5000/api/notifications/upcoming"),
          fetch("http://localhost:5000/api/notifications/ongoing-ending-soon"),
        ]);

        setPending((await pendingRes.json()).notifications || []);
        setUpcoming((await upcomingRes.json()).notifications || []);
        setOngoing((await ongoingRes.json()).notifications || []);
      } catch (error) {
        console.error("Error loading notifications:", error);
      }

      try {
        const endedRes = await fetch("http://localhost:5000/api/notifications/completed-major-nc");
        setEnded((await endedRes.json()).notifications || []);
      } catch (error) {
        console.error("Error loading completed audits:", error);
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
      <h2 className="subtitle" style={{ color }}>
        <Icon style={{ marginRight: 8 }} /> {title}
      </h2>
      {data.length === 0 ? (
        <p className="empty-message">{fallbackMessage}</p>
      ) : (
        <ul className="notification-list">
          {data.map((notif) => (
            <motion.li
              key={notif.auditId}
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

  if (loading)
    return (
      <div className="loading">
        <FaSpinner className="spinner" /> Loading notifications...
      </div>
    );

  return (
    <div className="notifications-container">
      {renderSection(
        "Pending Audits",
        pending,
        FaClock,
        "No notifications for pending audits.",
        (notif) => <p className="notification-status">Status: {notif.status}</p>,
        "#e74c3c"
      )}

      {renderSection(
        "Upcoming Audits (in 3 days)",
        upcoming,
        FaCalendarAlt,
        "No upcoming audits.",
        (notif) => (
          <p className="notification-date">
            📅 Scheduled start: {new Date(notif.startDate).toLocaleDateString()}
          </p>
        ),
        "#2980b9"
      )}

      {renderSection(
        "Ongoing Audits Ending Soon",
        ongoing,
        FaRegBell,
        "No ongoing audits ending soon.",
        (notif) => (
          <p className="notification-date">
            📅 Scheduled end: {new Date(notif.endDate).toLocaleDateString()}
          </p>
        ),
        "#f39c12"
      )}

      {renderSection(
        "Completed Audits with Major NCs",
        ended,
        FaExclamationCircle,
        "No completed audits with major non-conformities.",
        (notif) => (
          <>
            <p className="notification-date">
              ✅ Completed on {new Date(notif.endDate).toLocaleDateString()}
            </p>
            <p className="risk-warning">
              ⚠️ Major NCs detected: {notif.majorNCCount}
            </p>
          </>
        ),
        "#27ae60"
      )}
    </div>
  );
}

export default Notifications;
