import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import List from "./components/auditList/list";
import SelectedAudit from "./components/selectedAudit/selectedAudit";
import Sidebar from "./components/sidebar/sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import Calendar from './components/calendar/calendar';
import Create from './components/createAudit/createAudit';
import OutcomeList from './components/outcomes/OutcomesList';
import AddOutcome from "./components/addOutcome/addOutcome";
import ReportPage from "./components/report/report";
import ActionLogList from "./components/ActionLog/ActionLogList";

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ 
          flex: 1, 
          padding: '20px',
          backgroundColor: '#f5f5f5'
        }}>
          <Routes>
            {/* Route par défaut */}
            <Route index element={<Dashboard />} />
            
            {/* Routes principales */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Routes des audits */}
            <Route path="/audits">
              <Route index element={<List />} />
              <Route path="new" element={<Create />} />
              <Route path=":id">
                <Route index element={<SelectedAudit />} />
                <Route path="outcomes">
                  <Route index element={<OutcomeList />} />
                  <Route path="add" element={<AddOutcome />} />
                </Route>
                <Route path="report" element={<ReportPage />} />
              </Route>
            </Route>
            
            {/* Autres routes */}
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/actionLogList" element={<ActionLogList />} />
            
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;