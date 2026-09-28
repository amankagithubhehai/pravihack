import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema(
  {
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedDate: { type: Date, default: Date.now },
    returnDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['Requested', 'Approved', 'Active', 'Returned', 'Rejected'],
      default: 'Active',
    },
    purpose: { type: String, default: 'General Work' },
    conditionOnAssign: { type: String, default: 'Good' },
    conditionOnReturn: { type: String, default: '' },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', AssignmentSchema);
