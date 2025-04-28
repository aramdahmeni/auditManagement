
const ActionLog = require("../models/actionLog");

async function logAction({ type, action, elementId, auditID = null }) {
  try {
    const log = new ActionLog({ type, action, elementId, auditID });
    await log.save();
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du log :", error.message);
  }
}