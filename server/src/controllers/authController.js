import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Department from '../models/Department.js';
import { logAudit } from '../services/auditService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'assetsphere_super_secret_jwt_key_2026', {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, organizationCode, departmentName, phone } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    let orgId = null;
    if (organizationCode) {
      const org = await Organization.findOne({ code: organizationCode.toUpperCase() });
      if (org) {
        orgId = org._id;
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Employee',
      organizationId: orgId,
      phone: phone || '',
    });

    await logAudit({
      req,
      user,
      action: 'User Registered',
      category: 'AUTH',
      details: { email: user.email, role: user.role },
    });

    const token = generateToken(user._id);
    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate('organizationId', 'name code')
      .populate('departmentId', 'name code');

    res.status(201).json({
      success: true,
      token,
      user: populatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role, departmentId, organizationId, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide officer name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An officer with this email already exists in the registry.' });
    }

    let orgId = organizationId || req.user.organizationId;
    if (!orgId) {
      const defaultOrg = await Organization.findOne();
      if (defaultOrg) orgId = defaultOrg._id;
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Employee',
      organizationId: orgId,
      departmentId: departmentId || null,
      phone: phone || '',
      isActive: true,
    });

    await logAudit({
      req,
      action: `Enrolled Officer: ${newUser.name} (${newUser.role})`,
      category: 'AUTH',
      organizationId: orgId,
      details: { email: newUser.email, role: newUser.role, departmentId },
    });

    const populatedUser = await User.findById(newUser._id)
      .select('-password')
      .populate('organizationId', 'name code')
      .populate('departmentId', 'name code');

    res.status(201).json({
      success: true,
      message: `Officer ${newUser.name} successfully registered with role ${newUser.role}`,
      user: populatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
    }

    const token = generateToken(user._id);
    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate('organizationId', 'name code')
      .populate('departmentId', 'name code');

    await logAudit({
      req,
      user: populatedUser,
      action: 'User Login',
      category: 'AUTH',
      details: { email: user.email, role: user.role },
    });

    res.json({
      success: true,
      token,
      user: populatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('organizationId', 'name code domain')
      .populate('departmentId', 'name code');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Super Admin') {
      query.organizationId = req.user.organizationId;
    }
    const users = await User.find(query)
      .select('-password')
      .populate('organizationId', 'name code')
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
