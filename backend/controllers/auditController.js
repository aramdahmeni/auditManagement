const Audit = require("../models/audit");
const upload = require("../middleware/multerConfig")


exports.createAudit = async (req, res) => {
  try {
    const {  type, objective, startDate, endDate, status, auditor, comment } = req.body;

    const newAudit = new Audit({  type, objective, startDate, endDate, status, auditor,
      comment,
      document: req.file ? req.file.path : null,
      createdBy: '67e94905ac5b7e235be0371f'
    });

    const savedAudit = await newAudit.save();
    res.status(201).json(savedAudit);
  } catch (error) {
    console.error("Error creating audit:", error);
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
    const audit = await Audit.findById(req.params.id).populate("createdBy", "name email").sort({ createdAt: -1 });
    if (!audit) return res.status(404).json({ message: "Audit not found" });

    res.json(audit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




exports.updateAudit = async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) return res.status(404).json({ message: "Audit not found" });

    const updateData = { 
      ...req.body,
      type: req.body.type,
      objective: req.body.objective,
      status: req.body.status,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      comment: req.body.comment
    };

    if (req.file) {
      console.log("New file uploaded:", req.file.path);
      updateData.document = req.file.path;
    } else if (req.body.documentPath === '') {

      updateData.document = '';
    }

    const updatedAudit = await Audit.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({ message: "Audit updated successfully", audit: updatedAudit });
  } catch (error) {
    console.error("Error updating audit:", error.stack);
    res.status(500).json({ error: error.message });
  }
};


exports.deleteAudit = async (req, res) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) return res.status(404).json({ message: "Audit not found" });

    await Audit.findByIdAndDelete(req.params.id);
    res.json({ message: "Audit deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
