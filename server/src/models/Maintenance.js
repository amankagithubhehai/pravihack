import mongoose from 'mongoose';

const MaintenanceSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    maintenanceType: {
      type: String,
      enum: ['Routine', 'Preventive', 'Corrective', 'Emergency', 'AMC'],
      default: 'Routine',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    cost: { type: Number, default: 0 },
    vendor: { type: String, default: '' },
    technicianName: { type: String, default: '' },
    serviceReport: { type: String, default: '' },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Maintenance', MaintenanceSchema);
