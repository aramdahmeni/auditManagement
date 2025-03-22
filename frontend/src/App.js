import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import List from "./components/auditList/list";
import SelectedAudit from "./components/selectedAudit/selectedAudit";
import Sidebar from "./components/sidebar/sidebar";

function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar /> 
        <div style={{ flex: 1 }}>
          <Routes>
      
            <Route path="/" element={<List />} />

        
            <Route path="/audit/:id" element={<SelectedAudit />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
