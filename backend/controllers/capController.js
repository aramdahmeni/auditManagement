const CAP = require("../models/cap");


exports.createCAP = async (req, res) => {
    try {
        const { ncId, responsible, dueDate,action, status, effectiveness ,completionDate} = req.body;
        const newCAP = new CAP({ ncId, responsible, dueDate,action, status, effectiveness ,completionDate});
        await newCAP.save();
        res.status(201).json({ message: "CAP created successfully", cap: newCAP });
    } catch (error) {
        res.status(500).json({ error: "Failed to create CAP", details: error.message });
    }
};

exports.getAllCAPs = async (req, res) => {
    try {
        const caps = await CAP.find().populate("ncId");
        res.status(200).json(caps);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve CAPs", details: error.message });
    }
};

exports.getCAPsByNC = async (req, res) => {
    try {
        const { ncId } = req.params;
        const caps = await CAP.find({ ncId }).populate("ncId");
        res.status(200).json(caps);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve CAPs for this NC", details: error.message });
    }
};

exports.updateCAP = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCAP = await CAP.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedCAP) return res.status(404).json({ error: "CAP not found" });
        res.status(200).json({ message: "CAP updated successfully", cap: updatedCAP });
    } catch (error) {
        res.status(500).json({ error: "Failed to update CAP", details: error.message });
    }
};

exports.deleteCAP = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCAP = await CAP.findByIdAndDelete(id);
        if (!deletedCAP) return res.status(404).json({ error: "CAP not found" });
        res.status(200).json({ message: "CAP deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete CAP", details: error.message });
    }
};
