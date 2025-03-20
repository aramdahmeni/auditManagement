const Audit = require("../models/audit");

exports.createAudit = async (req, res) => {
  try {
    const { type, objective, createdBy, status, startDate, endDate, comment, document } = req.body;
    const newAudit = new Audit({ type, objective, createdBy, status, startDate, endDate, comment, document });

    await newAudit.save();
    res.status(201).json({ message: "Audit created successfully", audit: newAudit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllAudits = async (req, res) => {
  try {
    const audits = await Audit.find().populate("createdBy", "name email");
    res.json(audits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAuditById = async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id).populate("createdBy", "name email");
    if (!audit) return res.status(404).json({ message: "Audit not found" });

    res.json(audit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAudit = async (req, res) => {
  try {
    const updatedAudit = await Audit.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedAudit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAudit = async (req, res) => {
  try {
    await Audit.findByIdAndDelete(req.params.id);
    res.json({ message: "Audit deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
