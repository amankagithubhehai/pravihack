import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ticketType: {
      type: String,
      enum: ['Hardware Failure', 'Software Issue', 'Network Problem', 'Security Incident', 'General Request'],
      default: 'Hardware Failure',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open',
    },
    resolutionNotes: { type: String, default: '' },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Ticket', TicketSchema);
