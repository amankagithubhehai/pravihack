import Maintenance from '../models/Maintenance.js';
import Asset from '../models/Asset.js';
import { logAudit } from '../services/auditService.js';

export const getMaintenance = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Super Admin') {
      query.organizationId = req.user.organizationId;
    }
    if (req.query.assetId) {
      query.assetId = req.query.assetId;
    }

    const records = await Maintenance.find(query)
      .populate('assetId')
      .populate('performedBy', 'name email')
      .sort({ scheduledDate: -1 });

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMaintenance = async (req, res) => {
  try {
    const { assetId, title, description, maintenanceType, scheduledDate, cost, vendor, technicianName } = req.body;
    const orgId = req.user.organizationId;

    const record = await Maintenance.create({
      assetId,
      organizationId: orgId,
      title,
      description,
      maintenanceType,
      scheduledDate,
      cost: cost || 0,
      vendor: vendor || '',
      technicianName: technicianName || '',
      performedBy: req.user._id,
      status: 'Scheduled',
    });

    const asset = await Asset.findById(assetId);
    if (asset) {
      asset.status = 'Maintenance';
      await asset.save();
    }

    await logAudit({
      req,
      action: `Scheduled Maintenance: ${title} for ${asset?.assetId}`,
      category: 'MAINTENANCE',
      assetId: asset?.assetId,
      organizationId: orgId,
      details: { title, maintenanceType, scheduledDate },
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMaintenanceStatus = async (req, res) => {
  try {
    const { status, serviceReport, cost } = req.body;
    const record = await Maintenance.findById(req.params.id).populate('assetId');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    record.status = status || record.status;
    if (serviceReport) record.serviceReport = serviceReport;
    if (cost !== undefined) record.cost = cost;

    if (status === 'Completed') {
      record.completedDate = new Date();
      // restore asset status to Active/Inventory
      const asset = await Asset.findById(record.assetId._id);
      if (asset) {
        asset.status = asset.assignedTo ? 'Active' : 'Inventory';
        await asset.save();

        // Clear associated alerts for this asset
        await (await import('../models/Notification.js')).default.deleteMany({
          $or: [
            { 'metadata.assetId': asset.assetId },
            { 'metadata.assetMongoId': asset._id.toString() },
          ],
        });
        const io = req.app.get('io');
        if (io) {
          io.to(record.organizationId.toString()).emit('notification:cleared', { assetId: asset.assetId });
        }
      }
    }

    await record.save();

    await logAudit({
      req,
      action: `Maintenance Status Changed to ${status} for ${record.assetId?.assetId}`,
      category: 'MAINTENANCE',
      assetId: record.assetId?.assetId,
      organizationId: record.organizationId,
      details: { status, serviceReport },
    });

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
