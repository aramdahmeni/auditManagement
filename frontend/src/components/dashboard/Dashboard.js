// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import {
  FiActivity, FiCheckCircle, FiClock,
  FiAlertCircle, FiTrendingUp, FiCalendar,
  FiLayers, FiClock as FiTime
} from "react-icons/fi";
import { motion } from "framer-motion";
import "./Dashboard.css";

const STATUS_COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAudits: 0,
    completedAudits: 0,
    ongoingAudits: 0,
    pendingAudits: 0,
    completionRate: 0,
    averageAuditDuration: 0,
    onTimeCompletionRate: 0,
    overdueAudits: 0,
    avgTasksPerAudit: 0,
    avgTaskResolutionTime: 0
  });
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // simple average helper
  const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/audit");
        if (!res.ok) throw new Error("Failed to fetch audits");
        const audits = await res.json();

        const now = new Date();
        const total = audits.length;
        const completedList = audits.filter(a => a.status.toLowerCase() === "completed");
        const ongoingList   = audits.filter(a => a.status.toLowerCase() === "ongoing");
        const pendingList   = audits.filter(a => a.status.toLowerCase() === "pending");
        const completed     = completedList.length;
        const ongoing       = ongoingList.length;
        const pending       = pendingList.length;
        const completionRate = total ? ((completed / total) * 100).toFixed(1) : 0;

        // Avg Audit Duration (days)
        const durations = completedList.map(a => {
          const sd = new Date(a.startDate);
          const ed = new Date(a.endDate);
          return (ed - sd) / (1000 * 60 * 60 * 24);
        });
        const averageAuditDuration = +avg(durations).toFixed(1);

        // On-time completion rate
        const onTimeCount = completedList.filter(a =>
          new Date(a.updatedAt) <= new Date(a.endDate)
        ).length;
        const onTimeCompletionRate = completed
          ? +((onTimeCount / completed) * 100).toFixed(1)
          : 0;

        // Overdue audits
        const overdueAudits = audits.filter(a =>
          a.status.toLowerCase() !== "completed" &&
          new Date(a.endDate) < now
        ).length;

        // Avg tasks per audit
        const totalTasks = audits.reduce((sum, a) => sum + (a.tasks?.length || 0), 0);
        const avgTasksPerAudit = total ? +(totalTasks / total).toFixed(1) : 0;

        // Avg task resolution time (days)
        const allTasks = audits.flatMap(a => a.tasks || []);
        const completedTasks = allTasks.filter(t =>
          t.status.toLowerCase() === "completed" && t.completionDate
        );
        const taskResTimes = completedTasks.map(t => {
          const c = new Date(t.completionDate);
          const cr = new Date(t.createdAt);
          return (c - cr) / (1000 * 60 * 60 * 24);
        });
        const avgTaskResolutionTime = +avg(taskResTimes).toFixed(1);

        // Pie data
        const pie = [
          { name: "Completed", value: completed },
          { name: "Ongoing",   value: ongoing },
          { name: "Pending",   value: pending }
        ];

        // Bar data: by createdAt month
        const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const countsByMonth = Array(12).fill(0);
        audits.forEach(a => {
          const d = new Date(a.createdAt || a.startDate);
          if (!isNaN(d)) countsByMonth[d.getMonth()]++;
        });
        const bar = countsByMonth.map((c, i) => ({ month: monthNames[i], audits: c }));

        // Recent activities
        const recent = [...audits]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 5);

        setStats({
          totalAudits: total,
          completedAudits: completed,
          ongoingAudits: ongoing,
          pendingAudits: pending,
          completionRate: +completionRate,
          averageAuditDuration,
          onTimeCompletionRate,
          overdueAudits,
          avgTasksPerAudit,
          avgTaskResolutionTime
        });
        setPieData(pie);
        setBarData(bar);
        setRecentActivities(recent);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, []);

  if (loading) return (
    <div className="dashboard-container">
      <div className="loading-spinner"><div className="spinner"/></div>
      <p>Loading data…</p>
    </div>
  );
  if (error) return (
    <div className="dashboard-container">
      <p className="error-message">Error: {error}</p>
    </div>
  );

  const cardData = [
    { icon: <FiActivity/>, label: "Total Audits",         value: stats.totalAudits },
    { icon: <FiCheckCircle/>, label: "Completed",         value: stats.completedAudits },
    { icon: <FiClock/>,       label: "Pending",           value: stats.pendingAudits },
    { icon: <FiAlertCircle/>, label: "Ongoing",           value: stats.ongoingAudits },
    { icon: <FiTrendingUp/>,  label: "Completion Rate",   value: `${stats.completionRate}%` },
    { icon: <FiCalendar/>,    label: "Avg Audit Duration (d)", value: stats.averageAuditDuration },
    { icon: <FiCheckCircle/>, label: "On-Time Rate",      value: `${stats.onTimeCompletionRate}%` },
    { icon: <FiAlertCircle/>, label: "Overdue Audits",    value: stats.overdueAudits },
    { icon: <FiLayers/>,      label: "Avg Tasks/Audit",   value: stats.avgTasksPerAudit },
    { icon: <FiTime/>,        label: "Avg Task Resolution (d)", value: stats.avgTaskResolutionTime }
  ];

  const cardVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  const chartVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.3 } } };

  return (
    <div className="dashboard-container">
      <motion.h1 className="dashboard-title"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        Audit Dashboard
      </motion.h1>

      <div className="cards-container">
        {cardData.map((c, i) => (
          <motion.div key={i}
            className="card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <div className="card-icon">{c.icon}</div>
            <h2>{c.value}</h2>
            <p>{c.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div className="progress-bar-section"
        variants={chartVariants}
        initial="hidden"
        animate="visible"
      >
        <h2><FiTrendingUp/> Completion Rate</h2>
        <div className="progress-container">
          <div className="progress-label">
            <span>Rate</span>
            <span>{stats.completionRate}%</span>
          </div>
          <div className="progress-bar">
            <motion.div className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${stats.completionRate}%` }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      <div className="charts-container">
        <motion.div className="chart"
          variants={chartVariants} initial="hidden" animate="visible">
          <h3><FiTrendingUp/> Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" innerRadius={60} outerRadius={100} label>
                {pieData.map((e, idx) => (
                  <Cell key={idx} fill={STATUS_COLORS[idx % STATUS_COLORS.length]}/>
                ))}
              </Pie>
              <Tooltip formatter={(v, name) => [`${v} audits`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="chart"
          variants={chartVariants} initial="hidden" animate="visible"
          transition={{ delay: 0.2 }}>
          <h3><FiCalendar/> Audits by Month</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={v => [`${v} audits`, "Audits"]} />
              <Bar dataKey="audits" name="Audits" fill="#7C3AED" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div className="latest-activities"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3>🕓 Latest Activities</h3>
        <ul>
          {recentActivities.map(a => (
            <li key={a._id}>
              <span className="activity-date">
                {new Date(a.updatedAt || a.createdAt).toLocaleString()}
              </span>
              <span className="activity-text">
                <strong>{a.type}</strong> — {a.status}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
