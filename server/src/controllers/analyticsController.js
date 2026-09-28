import Asset from '../models/Asset.js';
import Maintenance from '../models/Maintenance.js';
import Ticket from '../models/Ticket.js';
import Department from '../models/Department.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Super Admin') {
      query.organizationId = req.user.organizationId;
    }

    const totalAssets = await Asset.countDocuments(query);
    const activeAssets = await Asset.countDocuments({ ...query, status: 'Active' });
    const assignedAssets = await Asset.countDocuments({ ...query, status: 'Assigned' });
    const inventoryAssets = await Asset.countDocuments({ ...query, status: 'Inventory' });
    const maintenanceAssets = await Asset.countDocuments({ ...query, status: 'Maintenance' });
    const retiredAssets = await Asset.countDocuments({ ...query, status: 'Retired' });
    const disposedAssets = await Asset.countDocuments({ ...query, status: 'Disposed' });

    // Category breakdown
    const categoryStats = await Asset.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 }, totalValue: { $sum: '$cost' } } },
    ]);

    // Lifecycle breakdown
    const statusStats = await Asset.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Department breakdown
    const deptStats = await Asset.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$departmentId',
          count: { $sum: 1 },
          totalValue: { $sum: '$cost' },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$department.name', 'Unassigned'] },
          code: { $ifNull: ['$department.code', 'NONE'] },
          count: 1,
          totalValue: 1,
        },
      },
    ]);

    // Maintenance cost aggregate
    const maintenanceCostAgg = await Maintenance.aggregate([
      { $match: query },
      { $group: { _id: null, totalCost: { $sum: '$cost' } } },
    ]);
    const totalMaintenanceCost = maintenanceCostAgg.length > 0 ? maintenanceCostAgg[0].totalCost : 0;

    // Total asset value
    const assetValueAgg = await Asset.aggregate([
      { $match: query },
      { $group: { _id: null, totalValue: { $sum: '$cost' } } },
    ]);
    const totalAssetValue = assetValueAgg.length > 0 ? assetValueAgg[0].totalValue : 0;

    // Open tickets
    const openTicketsCount = await Ticket.countDocuments({
      ...query,
      status: { $in: ['Open', 'Assigned', 'In Progress'] },
    });

    // Warranty expiring in next 60 days
    const now = new Date();
    const sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const expiringWarranties = await Asset.find({
      ...query,
      warrantyExpiry: { $gte: now, $lte: sixtyDaysLater },
    }).limit(10);

    // Total users & departments
    const userCount = await User.countDocuments(query);
    const deptCount = await Department.countDocuments(query);

    res.json({
      success: true,
      stats: {
        totalAssets,
        activeAssets,
        assignedAssets,
        inventoryAssets,
        maintenanceAssets,
        retiredAssets,
        disposedAssets,
        totalAssetValue,
        totalMaintenanceCost,
        openTicketsCount,
        userCount,
        deptCount,
        utilizationRate: totalAssets > 0 ? (((activeAssets + assignedAssets) / totalAssets) * 100).toFixed(1) : 0,
      },
      categoryStats,
      statusStats,
      deptStats,
      expiringWarranties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
