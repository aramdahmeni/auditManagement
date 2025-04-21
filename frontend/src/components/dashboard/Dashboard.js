import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import {
  FiActivity, FiCheckCircle, FiClock,
  FiAlertCircle, FiTrendingUp, FiCalendar
} from "react-icons/fi";
import { motion } from "framer-motion";
import "./Dashboard.css";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#f43f5e", "#14b8a6"];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAudits: 0,
    completedAudits: 0,
    ongoingAudits: 0,
    pendingAudits: 0,
    completionRate: 0,
  });

  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/audit");
        if (!response.ok) throw new Error("Failed to fetch data.");
        const data = await response.json();

        const total = data.length;
        const completed = data.filter(a => a.status?.toLowerCase() === "completed").length;
        const ongoing = data.filter(a => a.status?.toLowerCase() === "ongoing").length;
        const pending = data.filter(a => a.status?.toLowerCase() === "pending").length;
        const rate = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;

        const pie = [
          { name: "Completed", value: completed },
          { name: "Ongoing", value: ongoing },
          { name: "Pending", value: pending }
        ];

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyAudits = Array(12).fill(0);

        data.forEach((audit) => {
          const date = new Date(audit.date);
          if (!isNaN(date)) {
            const month = date.getMonth();
            monthlyAudits[month]++;
          }
        });

        const bar = monthlyAudits.map((count, i) => ({
          month: monthNames[i],
          audits: count
        }));

        const sortedRecent = [...data]
          .sort((a, b) => new Date(b.updatedAt || b.date) - new Date(a.updatedAt || a.date))
          .slice(0, 5);

        setStats({
          totalAudits: total,
          completedAudits: completed,
          ongoingAudits: ongoing,
          pendingAudits: pending,
          completionRate: rate,
        });
        setPieData(pie);
        setBarData(bar);
        setRecentActivities(sortedRecent);
      } catch (err) {
        setError("An error occurred while fetching data.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const chartVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.3 } }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <motion.h1 className="dashboard-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Audit Dashboard
      </motion.h1>

    
      <div className="cards-container">
        {[{ icon: <FiActivity />, label: "Total Audits", value: stats.totalAudits },
          { icon: <FiCheckCircle />, label: "Completed", value: stats.completedAudits },
          { icon: <FiClock />, label: "Pending", value: stats.pendingAudits },
          { icon: <FiAlertCircle />, label: "Ongoing", value: stats.ongoingAudits }
        ].map((card, index) => (
          <motion.div
            key={index}
            className="card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="card-icon">{card.icon}</div>
            <h2>{card.value}</h2>
            <p>{card.label}</p>
          </motion.div>
        ))}
      </div>

    
      <motion.div
        className="progress-bar-section"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
      >
        <h2><FiTrendingUp /> Completion Rate</h2>
        <div className="progress-container">
          <div className="progress-label">
            <span>Rate</span>
            <span>{stats.completionRate}%</span>
          </div>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${stats.completionRate}%` }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      <div className="charts-container">
        <motion.div
          className="chart"
          variants={chartVariants}
          initial="hidden"
          animate="visible"
        >
          <h3><FiActivity /> Audits by type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                innerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} audits`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="chart"
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <h3><FiCalendar /> Audits by Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [`${value} audits`, "Count"]} />
              <Legend />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
              </defs>
              <Bar dataKey="audits" name="Audits" fill="url(#barGradient)" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

    
      <motion.div
        className="latest-activities"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2>🕓 Latest Activities</h2>
        <ul>
          {recentActivities.map((audit, index) => (
            <li key={audit._id || index}>
              <span className="activity-date">
                {new Date(audit.updatedAt || audit.date).toLocaleString()}
              </span>
              <span className="activity-text">
                <strong>{audit.type || "Unknown type"}</strong> – {audit.status || "Unknown status"}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default Dashboard;
