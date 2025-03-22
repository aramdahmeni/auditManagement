import { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { BiSort } from "react-icons/bi";
import "./list.css"; 

const audits = [
  { type: "Compliance", objective: "Ensure IT policies", start: "2025-01-10", end: "2025-01-19", status: "Ongoing" },
  { type: "Security", objective: "Vulnerability check", start: "2024-12-18", end: "2025-01-05", status: "Completed" },
  { type: "Cloud", objective: "Cloud security", start: "2025-01-01", end: "2025-02-01", status: "Completed" }
];

export default function Dashboard() {
  const [sortType, setSortType] = useState("type");
  const sortedAudits = [...audits].sort((a, b) => a[sortType].localeCompare(b[sortType]));

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-semibold">Quick Access</h2>
        <nav className="mt-4">
          <ul>
            <li className="py-2">Dashboard</li>
            <li className="py-2 font-bold">Audit Management</li>
            <li className="pl-4 py-1">List</li>
            <li className="pl-4 py-1">Creation</li>
            <li className="pl-4 py-1">Outcome Management</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Calendar */}
        <div className="bg-white p-4 rounded-lg shadow mb-4 flex items-center justify-between">
          <div className="text-xl font-semibold">Feb 2025</div>
          <FaCalendarAlt className="text-gray-500 text-2xl" />
        </div>

        {/* Audit List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">All Audits</h3>
            <button onClick={() => setSortType("type")} className="flex items-center bg-gray-200 px-3 py-1 rounded">
              <BiSort className="mr-1" /> Sort by Type
            </button>
          </div>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Audit Type</th>
                <th className="p-2 border">Objective</th>
                <th className="p-2 border">Start Date</th>
                <th className="p-2 border">End Date</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedAudits.map((audit, index) => (
                <tr key={index} className="text-center border">
                  <td className="p-2 border">{audit.type}</td>
                  <td className="p-2 border">{audit.objective}</td>
                  <td className="p-2 border">{audit.start}</td>
                  <td className="p-2 border">{audit.end}</td>
                  <td className="p-2 border">
                    <span className={`px-3 py-1 rounded-full text-white text-sm ${audit.status === "Ongoing" ? "bg-green-500" : "bg-red-500"}`}>
                      {audit.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
