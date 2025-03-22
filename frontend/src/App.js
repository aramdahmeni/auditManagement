import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuditList from "./auditList/list"; // Make sure it's correctly exported

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuditList />} /> 
      </Routes>
    </Router>
  );
}

export default App;
