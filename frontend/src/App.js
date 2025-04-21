import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import List from "./components/auditList/list";
import SelectedAudit from "./components/selectedAudit/selectedAudit";
import Sidebar from "./components/sidebar/sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import Calendar from './components/calendar/calendar.js';
import Create from './components/createAudit/createAudit.js';
import OutcomeList from './components/outcomes/OutcomesList';
import AddOutcome from "./components/addOutcome/addOutcome.js";
import ReportPage from "./components/report/report.js";
function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar /> 
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />


            <Route path="/audits" element={<List />} />
            <Route path="/audits/new" element={<Create/>} />
            <Route path="/audits/:id" element={<SelectedAudit />} />
            <Route path="/audits/:id/outcomes" element={<OutcomeList />} />
            <Route path="/audits/:id/outcomes/add" element={<AddOutcome />} />
            <Route path="/audits/:id/report" element={<ReportPage />} />
            <Route path="/calendar" element={<Calendar />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;