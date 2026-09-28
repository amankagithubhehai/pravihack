import mongoose from 'mongoose';

const AssetSchema = new mongoose.Schema(
  {
    assetId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    assetName: { type: String, required: true, trim: true },
    
    // Physical Government Asset Classification
    category: {
      type: String,
      enum: [
        'Government Buildings & Infrastructure',
        'Fleet & Public Transport Vehicles',
        'Public Health & Hospital Equipment',
        'Civic & Municipal Machinery',
        'Emergency & Defense Equipment',
        'IT & Surveillance Infrastructure',
        'Land & Real Estate',
        'Other Public Asset',
      ],
      required: true,
    },
    
    assetType: { type: String, required: true }, // e.g. Electric City Bus, MRI Scanner, Fire Engine, Smart Traffic Signal, Civic Water Pump
    serialNumber: { type: String, default: '' },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Custodian Officer
    
    // Government Physical Asset Lifecycle
    status: {
      type: String,
      enum: [
        'Procurement',
        'Received',
        'Inventory',
        'Assigned',
        'Active',
        'Maintenance',
        'Retired',
        'Disposed',
      ],
      default: 'Active',
    },
    
    location: { type: String, default: 'Municipal Depot' },
    district: { type: String, default: 'Central District' },
    gpsCoordinates: { type: String, default: '19.0760° N, 72.8777° E' },
    cost: { type: Number, default: 0 }, // Value in INR (₹) or USD
    purchaseDate: { type: Date, default: Date.now },
    warrantyExpiry: { type: Date },
    vendor: { type: String, default: '' },
    amcVendor: { type: String, default: '' },
    qrCodeUrl: { type: String, default: '' },
    
    // Government specific fields
    sanctionOrderNo: { type: String, default: '' },
    custodianOfficer: { type: String, default: '' },
    physicalCondition: {
      type: String,
      enum: ['Operational / Excellent', 'Good', 'Requires Maintenance', 'Critical / Degraded', 'Condemned / Decommissioned'],
      default: 'Operational / Excellent',
    },
    lastInspectionDate: { type: Date, default: Date.now },
    nextInspectionDate: { type: Date },
    specifications: { type: Map, of: String, default: {} },
    tags: [{ type: String }],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

AssetSchema.index({ organizationId: 1, assetId: 1 });
AssetSchema.index({ organizationId: 1, status: 1 });
AssetSchema.index({ organizationId: 1, departmentId: 1 });
AssetSchema.index({ assetName: 'text', serialNumber: 'text', vendor: 'text', location: 'text', district: 'text' });

export default mongoose.model('Asset', AssetSchema);
