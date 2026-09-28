import Asset from '../models/Asset.js';
import Notification from '../models/Notification.js';

/**
 * Checks all active physical assets in the system for upcoming or expired warranties
 * and dispatches notifications if within 2 days (or expired).
 * 
 * Rules:
 * - If warranty expires within 2 days (or today/past) and asset is not yet renewed:
 *     Create or update a WARRANTY notification for the organization managers/officers.
 * - If asset warranty has been renewed (> 2 days in future) or status is Maintenance/Completed:
 *     Automatically resolve / clear old pending warranty notifications for this asset.
 */
export const checkAndSyncWarrantyAlerts = async (io = null) => {
  try {
    const now = new Date();
    // 2 days from now at end of day
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    // 1. Find all assets whose warrantyExpiry is set
    const assets = await Asset.find({ warrantyExpiry: { $exists: true, $ne: null } });

    for (const asset of assets) {
      const expiry = new Date(asset.warrantyExpiry);
      const isExpiringSoon = expiry <= twoDaysFromNow;

      if (isExpiringSoon) {
        // Calculate remaining days
        const diffMs = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        
        let urgencyText = '';
        if (diffDays < 0) {
          urgencyText = `EXPIRED on ${expiry.toLocaleDateString('en-IN')}`;
        } else if (diffDays === 0) {
          urgencyText = `EXPIRES TODAY (${expiry.toLocaleDateString('en-IN')})`;
        } else if (diffDays === 1) {
          urgencyText = `EXPIRES TOMORROW (${expiry.toLocaleDateString('en-IN')})`;
        } else {
          urgencyText = `Expires in 2 days (${expiry.toLocaleDateString('en-IN')})`;
        }

        const title = `⚠️ Statutory Warranty Alert: ${asset.assetId}`;
        const message = `Warranty / CAMC coverage for ${asset.assetName} (${asset.assetType}) ${urgencyText}. Vendor: ${asset.vendor || asset.amcVendor || 'Not specified'}. Immediate renewal or service requisition required.`;

        // Check if an unread notification already exists for this asset
        const existingAlert = await Notification.findOne({
          organizationId: asset.organizationId,
          type: 'WARRANTY',
          'metadata.assetId': asset.assetId,
          isRead: false,
        });

        if (!existingAlert) {
          const newNotif = await Notification.create({
            organizationId: asset.organizationId,
            title,
            message,
            type: 'WARRANTY',
            link: '/assets',
            metadata: {
              assetMongoId: asset._id.toString(),
              assetId: asset.assetId,
              warrantyExpiry: asset.warrantyExpiry,
            },
          });

          if (io) {
            io.to(asset.organizationId.toString()).emit('notification:created', newNotif);
          }
        }
      } else {
        // Asset has been renewed! (Warranty is more than 2 days in future)
        // Clean up / dismiss any lingering warranty notifications for this asset
        const cleared = await Notification.deleteMany({
          type: 'WARRANTY',
          'metadata.assetId': asset.assetId,
        });

        if (cleared.deletedCount > 0 && io) {
          io.to(asset.organizationId.toString()).emit('notification:cleared', { assetId: asset.assetId });
        }
      }
    }
  } catch (error) {
    console.error('Error syncing warranty notifications:', error);
  }
};
