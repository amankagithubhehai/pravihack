import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    domain: { type: String, trim: true },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    contactEmail: { type: String, required: true },
    address: { type: String, default: '' },
    subscriptionPlan: {
      type: String,
      enum: ['Starter', 'Professional', 'Enterprise'],
      default: 'Enterprise',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Organization', OrganizationSchema);
