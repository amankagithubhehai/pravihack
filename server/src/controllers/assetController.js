import Asset from '../models/Asset.js';
import Assignment from '../models/Assignment.js';
import QRCode from 'qrcode';
import { logAudit } from '../services/auditService.js';
import { checkAndSyncWarrantyAlerts } from '../services/warrantyAlertService.js';

export const getAssets = async (req, res) => {
  try {
    const { category, assetType, status, departmentId, search } = req.query;
    let query = {};

    if (req.user.role !== 'Super Admin') {
      query.organizationId = req.user.organizationId;
    }

    if (category) query.category = category;
    if (assetType) query.assetType = assetType;
    if (status) query.status = status;
    if (departmentId) query.departmentId = departmentId;

    if (search) {
      query.$or = [
        { assetName: { $regex: search, $options: 'i' } },
        { assetId: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { vendor: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const assets = await Asset.find(query)
      .populate('organizationId', 'name code')
      .populate('departmentId', 'name code')
      .populate('assignedTo', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: assets.length, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('organizationId', 'name code')
      .populate('departmentId', 'name code')
      .populate('assignedTo', 'name email phone');

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const assignments = await Assignment.find({ assetId: asset._id })
      .populate('userId', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: asset, assignmentHistory: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAsset = async (req, res) => {
  try {
    let orgId = req.user.role === 'Super Admin' && req.body.organizationId ? req.body.organizationId : req.user.organizationId;
    
    if (!orgId) {
      const firstOrg = await (await import('../models/Organization.js')).default.findOne();
      if (firstOrg) {
        orgId = firstOrg._id;
      } else {
        return res.status(400).json({ success: false, message: 'No public authority found to associate this asset with.' });
      }
    }

    // Auto-generate Asset ID if not provided
    let assetId = req.body.assetId ? req.body.assetId.trim().toUpperCase() : '';
    if (!assetId) {
      let unique = false;
      let counter = await Asset.countDocuments({ organizationId: orgId }) + 1;
      while (!unique) {
        const candidate = `AST-${String(counter).padStart(4, '0')}`;
        const existing = await Asset.findOne({ assetId: candidate });
        if (!existing) {
          assetId = candidate;
          unique = true;
        } else {
          counter++;
        }
      }
    } else {
      const existing = await Asset.findOne({ assetId });
      if (existing) {
        return res.status(400).json({ success: false, message: `Asset ID ${assetId} already exists in the system.` });
      }
    }

    const qrData = JSON.stringify({
      assetId,
      name: req.body.assetName,
      type: req.body.assetType,
      category: req.body.category,
    });
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    const asset = await Asset.create({
      ...req.body,
      assetId,
      organizationId: orgId,
      qrCodeUrl,
    });

    await logAudit({
      req,
      action: `Created Asset: ${asset.assetName} (${asset.assetId})`,
      category: 'ASSET',
      assetId: asset.assetId,
      organizationId: orgId,
      details: { name: asset.assetName, type: asset.assetType, status: asset.status },
    });

    // Real-time notification broadcast via socket if available
    const io = req.app.get('io');
    if (io) {
      io.to(orgId.toString()).emit('asset:created', asset);
    }
    await checkAndSyncWarrantyAlerts(io);

    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAsset = async (req, res) => {
  try {
    const oldAsset = await Asset.findById(req.params.id);
    if (!oldAsset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const previousStatus = oldAsset.status;
    const updatedAsset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('departmentId', 'name code')
      .populate('assignedTo', 'name email');

    let action = `Updated Asset: ${updatedAsset.assetName} (${updatedAsset.assetId})`;
    if (req.body.status && req.body.status !== previousStatus) {
      action = `Lifecycle Status Changed: ${previousStatus} -> ${updatedAsset.status} (${updatedAsset.assetId})`;
    }

    await logAudit({
      req,
      action,
      category: 'ASSET',
      assetId: updatedAsset.assetId,
      organizationId: updatedAsset.organizationId,
      details: { previousStatus, newStatus: updatedAsset.status, updates: req.body },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(updatedAsset.organizationId.toString()).emit('asset:updated', updatedAsset);
    }
    await checkAndSyncWarrantyAlerts(io);

    res.json({ success: true, data: updatedAsset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    await Asset.findByIdAndDelete(req.params.id);

    await logAudit({
      req,
      action: `Deleted Asset: ${asset.assetName} (${asset.assetId})`,
      category: 'ASSET',
      assetId: asset.assetId,
      organizationId: asset.organizationId,
      details: { name: asset.assetName, assetId: asset.assetId },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(asset.organizationId.toString()).emit('asset:deleted', { id: req.params.id, assetId: asset.assetId });
    }
    await checkAndSyncWarrantyAlerts(io);

    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkImportAssets = async (req, res) => {
  try {
    const { assets } = req.body;
    if (!assets || !Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or empty assets array' });
    }

    const orgId = req.user.role === 'Super Admin' && req.body.organizationId ? req.body.organizationId : req.user.organizationId;
    const count = await Asset.countDocuments({ organizationId: orgId });

    const createdList = [];
    for (let i = 0; i < assets.length; i++) {
      const item = assets[i];
      const assetId = item.assetId || `AST-${String(count + i + 1).padStart(4, '0')}`;
      const qrData = JSON.stringify({ assetId, name: item.assetName, type: item.assetType });
      const qrCodeUrl = await QRCode.toDataURL(qrData);

      const created = await Asset.create({
        ...item,
        assetId,
        organizationId: orgId,
        qrCodeUrl,
      });
      createdList.push(created);
    }

    await logAudit({
      req,
      action: `Bulk Imported ${createdList.length} Assets`,
      category: 'ASSET',
      organizationId: orgId,
      details: { count: createdList.length },
    });

    res.status(201).json({ success: true, count: createdList.length, data: createdList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
