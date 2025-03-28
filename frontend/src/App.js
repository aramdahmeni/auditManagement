import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import List from "./components/auditList/list";
import AuditHistory from "./components/AuditHistory/AuditHistory";
import SelectedAudit from "./components/selectedAudit/selectedAudit";
import Sidebar from "./components/sidebar/sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import AuditDetail from "./components/auditcompleteddetails/AuditCompletedDetails.js";
import Calendar from './components/calendar/calendar.js';


function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar /> 
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/audits" element={<List />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/audit/:id" element={<SelectedAudit />} />
            <Route path="/audit-history" element={<AuditHistory />} />
            <Route path="/auditcompleted/:id" element={<AuditDetail />} />
            <Route path="*" element={<Dashboard />} /> 
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 