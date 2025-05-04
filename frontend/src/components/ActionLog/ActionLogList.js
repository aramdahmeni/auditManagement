import React, { useEffect, useState } from 'react';

const ActionLogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = '660a8d324b45c21a0ecf1234'; 

  useEffect(() => {
    const fetchUserLogs = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/actionLog/user/${userId}`);
        const data = await res.json();
        setLogs(data);
        console.log(data);
      } catch (error) {
        console.error('Error fetching user logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserLogs();
  }, []);

  if (loading) return <p>Loading user logs...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Your Audit Logs</h2>
      {logs.length === 0 ? (
        <p>No logs available.</p>
      ) : (
        <ul className="space-y-2">
          {logs.map(log => (
            <li key={log._id} className="border p-3 rounded shadow bg-white">
              <p>
                <strong>{log.action.toUpperCase()}</strong> audit "
                {log.auditId?.title || 'Unknown'}" on{' '}
                {new Date(log.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActionLogList;
