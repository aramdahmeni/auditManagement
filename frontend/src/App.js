import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import List from "./components/auditList/list";
import AuditHistory from "./components/AuditHistory/AuditHistory";
import SelectedAudit from "./components/selectedAudit/selectedAudit";
import Sidebar from "./components/sidebar/sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import Calendar from './components/calendar/calendar.js';
import Create from './components/createAudit/createAudit.js';
// Import des nouveaux composants
import OutcomeList from './components/outcomes/OutcomesList';


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
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/audit/:id" element={<SelectedAudit />} />
            
          
<Route path="/audits/:id/outcomes" element={<OutcomeList />} />


         
            <Route path="/audit-history" element={<AuditHistory />} />
            <Route path="*" element={<Dashboard />} /> 
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;