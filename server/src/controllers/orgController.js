import Organization from '../models/Organization.js';
import Department from '../models/Department.js';
import { logAudit } from '../services/auditService.js';

export const getOrganizations = async (req, res) => {
  try {
    let orgs;
    if (req.user.role === 'Super Admin') {
      orgs = await Organization.find().sort({ createdAt: -1 });
    } else {
      orgs = await Organization.find({ _id: req.user.organizationId });
    }
    res.json({ success: true, count: orgs.length, data: orgs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrganization = async (req, res) => {
  try {
    const { name, code, domain, description, contactEmail, address, subscriptionPlan } = req.body;

    const existing = await Organization.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Organization code already exists' });
    }

    const org = await Organization.create({
      name,
      code: code.toUpperCase(),
      domain,
      description,
      contactEmail,
      address,
      subscriptionPlan,
    });

    await logAudit({
      req,
      action: `Created Organization: ${org.name} (${org.code})`,
      category: 'ORGANIZATION',
      organizationId: org._id,
      details: { name: org.name, code: org.code },
    });

    res.status(201).json({ success: true, data: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Super Admin') {
      query.organizationId = req.user.organizationId;
    } else if (req.query.organizationId) {
      query.organizationId = req.query.organizationId;
    }

    const departments = await Department.find(query)
      .populate('organizationId', 'name code')
      .populate('headOfDepartment', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code, organizationId, headOfDepartment, budget, location, description } = req.body;
    let orgId = organizationId || req.user.organizationId;

    if (!orgId) {
      // For Super Admin without a direct organizationId, default to the first available organization
      const firstOrg = await Organization.findOne();
      if (firstOrg) {
        orgId = firstOrg._id;
      } else {
        return res.status(400).json({ success: false, message: 'Please create or specify an Authority first.' });
      }
    }

    const existing = await Department.findOne({ organizationId: orgId, code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Division code already exists in this Authority' });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      organizationId: orgId,
      headOfDepartment: headOfDepartment || null,
      budget: budget || 0,
      location: location || '',
      description: description || '',
    });

    await logAudit({
      req,
      action: `Created Department: ${department.name}`,
      category: 'ORGANIZATION',
      organizationId: orgId,
      details: { name: department.name, code: department.code },
    });

    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
