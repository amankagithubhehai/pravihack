import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true },
    userEmail: { type: String },
    userRole: { type: String },
    action: { type: String, required: true }, // e.g. "Asset Created", "Asset Assigned", "Status Changed"
    category: {
      type: String,
      enum: ['AUTH', 'ASSET', 'ASSIGNMENT', 'MAINTENANCE', 'INCIDENT', 'ORGANIZATION', 'SYSTEM'],
      default: 'ASSET',
    },
    assetId: { type: String },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '127.0.0.1' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AuditLogSchema.index({ organizationId: 1, timestamp: -1 });

export default mongoose.model('AuditLog', AuditLogSchema);
