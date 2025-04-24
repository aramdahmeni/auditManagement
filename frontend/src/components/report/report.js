import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaFilePdf, FaSpinner, FaTimes } from 'react-icons/fa';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import './report.css';

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
  
  const generateReport = () => {
    setShowReportPanel(true);
    setIsGenerating(true);
    setReportContent('');

    const summary = `
AUDIT REPORT
============

Audit Type: ${auditDetails?.type || 'N/A'}
Status: ${auditDetails?.status || 'N/A'}
Audit Period: ${formatDate(auditDetails?.startDate)} to ${formatDate(auditDetails?.endDate)}
Auditor: ${auditDetails?.createdBy.name || 'N/A'}
\n
Tasks:
${Array.isArray(auditDetails?.tasks) && auditDetails.tasks.length > 0 
  ? auditDetails.tasks.map((task, idx) =>
      `  ${idx + 1}. ${task.task} - ${task.status} - completed: ${formatDate(task.completionDate)}`
    ).join('\n')
  : '  No tasks listed.'}



Overview:

\n
Overview:
This report summarizes the key findings identified during the audit. \n The outcomes have been categorized into Non-Conformities (NC), Opportunities for Improvement (OFI), Strengths, and Sensitive Points.

Findings Breakdown:
- Total Outcomes: ${outcomes.length}
- Non-Conformities: ${outcomes.filter(o => o.type === 'nc').length}
- Opportunities for Improvement: ${outcomes.filter(o => o.type === 'ofi').length}
- Strengths: ${outcomes.filter(o => o.type === 'strength').length}
- Sensitive Points: ${outcomes.filter(o => o.type === 'sensitivepoint').length}


DETAILED FINDINGS
=================
`;

    const formattedOutcomes = outcomes.map((o, index) => {
      let paragraph = `\n${index + 1}. [${o.type.toUpperCase()}]\n`;

      if (o.type === 'strength') {
        paragraph += `Strength Description: ${o.details.description || 'No details provided.'}\n`;
      } else if (o.type === 'nc') {
        paragraph += `Non-Conformity: ${o.details.type || 'N/A'}\n`;
        paragraph += `Description: ${o.details.description || 'N/A'}\n`;
        paragraph += `Root Cause: ${o.details.rootCause || 'N/A'}\n`;
        paragraph += `Impacted Asset: ${o.details.impactedAsset || 'N/A'}\n`;
        paragraph += `Preventive Action: ${o.details.preventiveAction || 'N/A'}\n`;
        paragraph += `Corrective Action Plan:\n`;
        paragraph += `Responsible: ${o.details.cap.responsible || 'N/A'}\n`;
        paragraph += `Action: ${o.details.cap.action || 'N/A'}\n`;
        paragraph += `Due Date: ${o.details.cap.dueDate || 'N/A'}\n`;
        paragraph += `Status: ${o.details.cap.status || 'N/A'}\n`;
        paragraph += `Effectiveness: ${o.details.cap.effectiveness || 'N/A'}\n`;
        paragraph += `Completion Date: ${o.details.cap.completionDate || 'N/A'}\n`;

      } else if (o.type === 'ofi') {
        paragraph += `Description: ${o.details.description || 'No details provided.'}\n`;
        paragraph += `Perspective: ${o.details.prespective || 'No details provided.'}\n`;
        paragraph += `Impacted Asset: ${o.details.impactedAsset || 'No details provided.'}\n`;
        paragraph += `Action: ${o.details.action || 'No details provided.'}\n`;
      } else if (o.type === 'sensitivepoint') {
        paragraph += `Sensitive Point Description: ${o.details.description || 'No details provided.'}\n`;
      }

      return paragraph;
    }).join('\n');

    const fullReportText = summary + formattedOutcomes;

// Create a PDF
const createPDF = async () => {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]);  // Changed from const to let
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width, height } = page.getSize();

  const lines = fullReportText.split('\n');
  let y = height - 30;

  lines.forEach(line => {
    if (y < 40) {
      page = pdfDoc.addPage([600, 800]);  // Reassigning is now allowed
      y = height - 30;
    }
    page.drawText(line, { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
    y -= 15;
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveReportToAudit(blob);  // Save the file to the backend
  setIsGenerating(false);
  setReportContent(fullReportText);
};


createPDF();
  }

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
