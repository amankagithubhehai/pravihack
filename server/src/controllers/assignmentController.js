import Assignment from '../models/Assignment.js';
import Asset from '../models/Asset.js';
import Notification from '../models/Notification.js';
import { logAudit } from '../services/auditService.js';

export const getAssignments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Employee') {
      query.userId = req.user._id;
    } else if (req.user.role !== 'Super Admin') {
      query.organizationId = req.user.organizationId;
    }

    const assignments = await Assignment.find(query)
      .populate('assetId')
      .populate('userId', 'name email phone departmentId')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAssignment = async (req, res) => {
  try {
    const { assetId, userId, purpose, conditionOnAssign, remarks } = req.body;
    const orgId = req.user.organizationId;

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const assignment = await Assignment.create({
      assetId,
      organizationId: orgId,
      userId,
      assignedBy: req.user._id,
      purpose: purpose || 'Job Responsibility',
      conditionOnAssign: conditionOnAssign || 'Good',
      remarks: remarks || '',
      status: 'Active',
      assignedDate: new Date(),
    });

    // Update Asset status to Assigned
    asset.status = 'Assigned';
    asset.assignedTo = userId;
    await asset.save();

    await logAudit({
      req,
      action: `Assigned Asset: ${asset.assetName} (${asset.assetId})`,
      category: 'ASSIGNMENT',
      assetId: asset.assetId,
      organizationId: orgId,
      details: { userId, purpose },
    });

    // Send Notification to Employee
    await Notification.create({
      organizationId: orgId,
      userId,
      title: 'New Asset Assigned',
      message: `Asset ${asset.assetName} (${asset.assetId}) has been assigned to you.`,
      type: 'INFO',
    });

    const io = req.app.get('io');
    if (io) {
      io.to(orgId.toString()).emit('assignment:created', assignment);
    }

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const returnAssignment = async (req, res) => {
  try {
    const { conditionOnReturn, remarks } = req.body;
    const assignment = await Assignment.findById(req.params.id).populate('assetId');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment record not found' });
    }

    assignment.status = 'Returned';
    assignment.returnDate = new Date();
    assignment.conditionOnReturn = conditionOnReturn || 'Returned in good condition';
    if (remarks) assignment.remarks += `\nReturn remark: ${remarks}`;
    await assignment.save();

    const asset = await Asset.findById(assignment.assetId._id);
    if (asset) {
      asset.status = 'Inventory';
      asset.assignedTo = null;
      await asset.save();
    }

    await logAudit({
      req,
      action: `Returned Asset: ${asset?.assetName} (${asset?.assetId})`,
      category: 'ASSIGNMENT',
      assetId: asset?.assetId,
      organizationId: assignment.organizationId,
      details: { conditionOnReturn },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(assignment.organizationId.toString()).emit('assignment:returned', assignment);
    }

    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
