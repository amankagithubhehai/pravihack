import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['SOP', 'Policy', 'Manual', 'Compliance', 'Maintenance Guidelines', 'Contract', 'Other'],
      default: 'SOP',
    },
    content: { type: String, required: true },
    tags: [{ type: String }],
    fileUrl: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

DocumentSchema.index({ organizationId: 1, title: 'text', content: 'text' });

export default mongoose.model('Document', DocumentSchema);
