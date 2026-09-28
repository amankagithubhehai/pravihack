import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    headOfDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    budget: { type: Number, default: 0 },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

DepartmentSchema.index({ organizationId: 1, code: 1 }, { unique: true });

export default mongoose.model('Department', DepartmentSchema);
