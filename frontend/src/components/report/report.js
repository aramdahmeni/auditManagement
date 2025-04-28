import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaFilePdf, FaSpinner, FaTimes } from 'react-icons/fa';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import './report.css';
const cap_status_map = {
  "pending": 2,
  "ongoing": 1,
  "completed": 0
};

const nc_type_map = {
  "non_existant": 0,
  "minor": 1,
  "major": 2
};

const audit_category_map = {
  "Software Licensing": 0,
  "Operational": 1,
  "Application": 2,
  "IT Governance": 3,
  "System": 4,
  "Network": 5,
  "Compliance": 6,
  "Risk Based": 7,
  "Data Privacy": 8,
  "Cloud Security": 9,
  "Security": 10,
  "Disaster Recovery": 11
};
const ReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auditDetails, setAuditDetails] = useState(null);
  const [outcomes, setOutcomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [showReportPanel, setShowReportPanel] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [audit, setAudit] = useState({
          type: "",
          objective: "",
          startDate: "",
          endDate: "",
          status: "Pending",
          auditor: "",
          comment: ""
      });
      const [error, setError] = useState(null);

      const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return 'N/A'; // Check for invalid dates
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) {
          return 'N/A';
        }
      };

      useEffect(() => {
        console.log("Audit tasks:", auditDetails?.tasks);
      }, [auditDetails]);
    // File configuration

  const saveReportToAudit = async (pdfBlob) => {
    const formData = new FormData();
    formData.append("report", pdfBlob, `audit-report-${id}.pdf`);
  
    try {
      const response = await fetch(`http://localhost:5000/api/audit/update/${id}`, {
        method: "PUT",
        body: formData,
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save report.");
  
      alert("Report saved to audit successfully!");
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to save report to audit.");
    }
  };
  
  const generateReport = async () => {
    console.log("🔥 generateReport() called");
    setShowReportPanel(true);
    setIsGenerating(true);
    setReportContent("");
  
    // 1) Send prediction data to your ML API
    const sendPredictionData = async () => {
      console.log("→ sendPredictionData(): start");
    
      const auditTypeValue = audit_category_map[auditDetails?.type];
      console.log("   auditTypeValue:", auditTypeValue);
    
      const ncOutcomes = outcomes.filter(o => o.type === "nc");
      console.log("   ncOutcomes:", ncOutcomes);
    
      const predictionData = ncOutcomes.map(o => {
        // Check if the cap and dueDate are valid
        const dueDate = o.details.cap?.dueDate ? new Date(o.details.cap?.dueDate) : null;
        const today = new Date();
        let days_until_due = null;
    
        if (dueDate && !isNaN(dueDate)) {
          days_until_due = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        } else {
          // Handle the case where dueDate is missing or invalid
          days_until_due = null;  // Or set it to 0 or a default value, based on your needs
        }
    
        const entry = {
          nc_type: nc_type_map[o.details.type?.toLowerCase()],
          cap_status: o.details.cap 
            ? (cap_status_map[o.details.cap?.status?.toLowerCase()] ?? 2) // Default to "pending" (2) if status is invalid or missing
            : 2, // Ensure cap_status exists, defaulting to "pending" (2)
          days_until_due,
          audit_category: auditTypeValue,
        };
    
        console.log("     mapped entry:", entry);
    
        return entry;
      });
    
      console.log("   full predictionData payload:", predictionData);
    
      try {
        console.log("   → fetching POST http://localhost:8000/predict");
        const response = await fetch("http://localhost:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(predictionData),
        });
        console.log("   ← response status:", response.status);
    
        if (!response.ok) {
          const text = await response.text();
          console.error("   ✖ Non-2xx response:", response.status, text);
          throw new Error(`Failed to get prediction: ${response.status}`);
        }
    
        const json = await response.json();
        console.log("   ← response JSON:", json);
    
        const { predictions } = json;
        console.log("   parsed predictions:", predictions);
    
        ncOutcomes.forEach((nc, idx) => {
          console.log(`     applying risk to outcome[${idx}]:`, predictions[idx]);
          nc.details.risk = predictions[idx];
        });
    
        return predictions;
      } catch (err) {
        console.error("   ❌ sendPredictionData error:", err);
        return null;
      }
    };
    
  
    const predictions = await sendPredictionData();
    console.log("← sendPredictionData complete, predictions:", predictions);
  
    // 2) Build the report text
    console.log("→ building summary and formattedOutcomes");
    const summary = `
  AUDIT REPORT
  ===========
  
  Audit Type: ${auditDetails?.type || "N/A"}
  Status: ${auditDetails?.status || "N/A"}
  Audit Period: ${formatDate(auditDetails?.startDate)} to ${formatDate(auditDetails?.endDate)}
  Auditor: ${auditDetails?.createdBy.name || "N/A"}
  
  Tasks:
  ${Array.isArray(auditDetails?.tasks) && auditDetails.tasks.length > 0
      ? auditDetails.tasks
          .map((t, i) => `  ${i + 1}. ${t.task} - completed: ${formatDate(t.completionDate)}`)
          .join("\n")
      : "  No tasks listed."}
  
  Overview:
  This report summarizes the key findings identified during the audit.
  The outcomes have been categorized into Non-Conformities (NC), Opportunities for Improvement (OFI), Strengths, and Sensitive Points.
  
  Findings Breakdown:
  - Total Outcomes: ${outcomes.length}
  - Non-Conformities: ${outcomes.filter(o => o.type === "nc").length}
  - Opportunities for Improvement: ${outcomes.filter(o => o.type === "ofi").length}
  - Strengths: ${outcomes.filter(o => o.type === "strength").length}
  - Sensitive Points: ${outcomes.filter(o => o.type === "sensitivepoint").length}
  
  
  DETAILED FINDINGS
  =================
    `;
    console.log("   summary built");
  
    const formattedOutcomes = outcomes
      .map((o, idx) => {
        let paragraph = `\n${idx + 1}. [${o.type.toUpperCase()}]\n`;
        if (o.type === "nc") {
          paragraph += `Non-Conformity: ${o.details.type || "N/A"}\n`;
          paragraph += `Risk (Predicted): ${
            typeof o.details.risk === "number" ? o.details.risk.toFixed(2) : "N/A"
          }\n`;
        } else {
          paragraph += `Description: ${o.details.description || "N/A"}\n`;
        }
        return paragraph;
      })
      .join("\n");
    console.log("   formattedOutcomes built");
  
    const fullReportText = summary + formattedOutcomes;
    console.log("   fullReportText:", fullReportText);
  
    // 3) Generate and upload the PDF
    const createPDF = async () => {
      console.log("→ createPDF(): start");
      const pdfDoc = await PDFDocument.create();
      console.log("   PDFDocument created");
      let page = pdfDoc.addPage([600, 800]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const { height } = page.getSize();
      const lines = fullReportText.split("\n");
      let y = height - 30;
  
      for (const line of lines) {
        if (y < 40) {
          page = pdfDoc.addPage([600, 800]);
          y = height - 30;
        }
        page.drawText(line, { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
        y -= 15;
      }
      console.log("   PDF content drawn");
  
      const pdfBytes = await pdfDoc.save();
      console.log("   PDFDocument saved, bytes length:", pdfBytes.byteLength);
  
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      console.log("   Blob created");
  
      // Upload to your audit service
      console.log("   → saving report to audit service");
      await saveReportToAudit(blob);
      console.log("   ← saveReportToAudit returned");
  
      // Auto-download in browser
      console.log("   → triggering browser download");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Audit_Report_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      console.log("   ← download triggered");
  
      setIsGenerating(false);
      console.log("   setIsGenerating(false)");
      setReportContent(fullReportText);
      console.log("   setReportContent done");
    };
  
    await createPDF();
    console.log("← createPDF() complete");
  };
  
  
  

  const handleDownloadPDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Courier);
    const fontSize = 10;
    const margin = 50;
    const maxLineWidth = 500; // Adjust as needed
    const lineHeight = fontSize + 4;
    const pageWidth = 595.28;
    const pageHeight = 841.89;
  
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;
  
    const lines = reportContent.split('\n');
  
    const splitTextIntoLines = (text, maxWidth) => {
      const words = text.split(' ');
      const lines = [];
      let line = '';
  
      for (let word of words) {
        const testLine = line + word + ' ';
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width > maxWidth) {
          lines.push(line.trim());
          line = word + ' ';
        } else {
          line = testLine;
        }
      }
  
      if (line.trim()) lines.push(line.trim());
      return lines;
    };
  
    for (let i = 0; i < lines.length; i++) {
      const wrappedLines = splitTextIntoLines(lines[i], maxLineWidth);
  
      for (const wrappedLine of wrappedLines) {
        if (y < margin) {
          page.drawText('--- Continued on next page ---', {
            x: margin,
            y,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
  
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
  
        page.drawText(wrappedLine, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
  
        y -= lineHeight;
      }
    }
  
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Audit_Report_${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  



  //fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [auditResponse, outcomesResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/audit/${id}`),
          fetch(`http://localhost:5000/api/outcome/${id}`)
        ]);

        if (!auditResponse.ok) throw new Error("Failed to fetch audit details");
        if (!outcomesResponse.ok) throw new Error("Failed to fetch outcomes");

        const [auditData, outcomesData] = await Promise.all([
          auditResponse.json(),
          outcomesResponse.json()
        ]);

        setAuditDetails(auditData);
        

        setOutcomes(outcomesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);


//front
  if (isLoading) {
    return (
      <div className="report-loading-container">
        <FaSpinner className="report-spinner" />
        <p>Loading audit data...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="report-error-container">
        <div className="report-error-alert">
          <h3>Error Loading Data</h3>
          <p>{errorMessage}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }
  return (
    <div className="compact-report-container">
      <div className="report-header">
        <button className="report-back-button" onClick={() => navigate(`/audits/${id}/outcomes`)}>
          <FaChevronLeft />
          <span>Back to Outcomes</span>
        </button>
        <br />
        <h2>Audit Report</h2>
      </div>
  
      {!showReportPanel ? (
        <div className="report-dashboard">
          {/* Audit Overview */}
          <div className="report-summary-card">
            <h3>Audit Overview</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <label>Type</label>
                <p>{auditDetails?.type || 'N/A'}</p>
              </div>
              <div className="summary-item">
                <label>Status</label>
                <span className={`status-tag ${auditDetails?.status?.toLowerCase()}`}>
                  {auditDetails?.status || 'N/A'}
                </span>
              </div>
              <div className="summary-item">
                <label>Period</label>
                <p>{formatDate(auditDetails?.startDate)} - {formatDate(auditDetails?.endDate)}</p>
              </div>
            </div>
          </div>
  
          {/* Audit Tasks */}
          <div className="report-summary-card">
            <h3>Audit Tasks</h3>
            <div className="summary-grid">
            <div className="summary-item">
  <label>Tasks</label>
  {Array.isArray(auditDetails?.tasks) && auditDetails.tasks.length > 0 ? (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {auditDetails.tasks.map((task, idx) => (
        <li key={idx}>
          <span>{idx + 1}. {task.task} - completed: {formatDate(task.completionDate)}</span>
        </li>
      ))}
    </ul>
  ) : (
    <p>No tasks listed.</p>
  )}
</div>
            </div>
          </div>
  
          {/* Findings Stats */}
          <div className="report-stats-section">
            <div className="stats-header">
              <h3>Findings Summary</h3>
              <button className="generate-report-btn" onClick={generateReport} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <FaSpinner className="spin" /> Generating...
                  </>
                ) : (
                  <>
                    <FaFilePdf /> Generate Report
                  </>
                )}
              </button>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{outcomes.length}</div>
                <div className="stat-label">Total Findings</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{outcomes.filter(o => o.type === 'nc').length}</div>
                <div className="stat-label">Non-Conformities</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{outcomes.filter(o => o.type === 'ofi').length}</div>
                <div className="stat-label">Opportunities</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{outcomes.filter(o => o.type === 'strength').length}</div>
                <div className="stat-label">Strengths</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{outcomes.filter(o => o.type === 'sensitivepoint').length}</div>
                <div className="stat-label">Sensitive Points</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="report-generation-panel">
          <div className="panel-header">
            <h3>Report Generation Console</h3>
            <div className="panel-actions">
              {!isGenerating && (
                <button className="download-report-btn" onClick={handleDownloadPDF}>
                  <FaFilePdf /> Download & Save PDF
                </button>
              )}
              <button className="close-panel-btn" onClick={() => setShowReportPanel(false)}>
                <FaTimes />
              </button>
            </div>
          </div>
  
          <div className="report-console-output">
            <pre>{reportContent || "Initializing report generation..."}</pre>
          </div>
  
          {!isGenerating && (
            <div className="report-complete-message">
              <p>Report generation completed successfully.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
  
};

export default ReportPage;
