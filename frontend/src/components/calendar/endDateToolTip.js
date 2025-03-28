import React from "react";

const EndDateTooltip = ({ hoveredAudit }) => {
  if (!hoveredAudit) return null;

  return (
    <div className="end-date-box">
      <strong>End Date: </strong>
      {new Date(hoveredAudit).toLocaleDateString()}
    </div>
  );
};

export default EndDateTooltip;