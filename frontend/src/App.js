import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar/sidebar";
import List from "./components/auditList/list";
import selectedAudit from "./components/selectedAudit/selectedAudit";

function App() {
  return (
    <Router>
      <div>
        <Sidebar />
        <Routes>
          <Route path="/" element={<List />} />
          <Route path="/selected" element={<selectedAudit />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;