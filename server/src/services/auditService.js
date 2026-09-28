import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  req,
  organizationId,
  user,
  action,
  category = 'ASSET',
  assetId = '',
  details = {},
}) => {
  try {
    const finalOrgId = organizationId || (user && user.organizationId) || (req && req.user && req.user.organizationId);
    const finalUserId = (user && user._id) || (req && req.user && req.user._id);
    const finalUserName = (user && user.name) || (req && req.user && req.user.name) || 'System';
    const finalUserEmail = (user && user.email) || (req && req.user && req.user.email);
    const finalUserRole = (user && user.role) || (req && req.user && req.user.role) || 'System';
    const ip = (req && (req.headers['x-forwarded-for'] || req.socket?.remoteAddress)) || '127.0.0.1';

    const logEntry = new AuditLog({
      organizationId: finalOrgId,
      userId: finalUserId,
      userName: finalUserName,
      userEmail: finalUserEmail,
      userRole: finalUserRole,
      action,
      category,
      assetId,
      details,
      ipAddress: ip,
      timestamp: new Date(),
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error('Audit logging error:', error.message);
  }
};
