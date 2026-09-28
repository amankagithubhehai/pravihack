import Ticket from '../models/Ticket.js';
import Notification from '../models/Notification.js';
import { logAudit } from '../services/auditService.js';

export const getTickets = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Employee') {
      query.reportedBy = req.user._id;
    } else if (req.user.role !== 'Super Admin') {
      query.organizationId = req.user.organizationId;
    }

    const tickets = await Ticket.find(query)
      .populate('assetId', 'assetName assetId category assetType location')
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { title, description, assetId, ticketType, priority } = req.body;
    const orgId = req.user.organizationId;

    const count = await Ticket.countDocuments({ organizationId: orgId });
    const ticketNumber = `INC-${String(count + 1).padStart(4, '0')}`;

    const ticket = await Ticket.create({
      ticketNumber,
      title,
      description,
      assetId: assetId || null,
      organizationId: orgId,
      reportedBy: req.user._id,
      ticketType: ticketType || 'Hardware Failure',
      priority: priority || 'Medium',
      status: 'Open',
    });

    await logAudit({
      req,
      action: `Created Incident Ticket: ${ticket.ticketNumber} - ${ticket.title}`,
      category: 'INCIDENT',
      organizationId: orgId,
      details: { ticketNumber: ticket.ticketNumber, priority: ticket.priority },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(orgId.toString()).emit('ticket:created', ticket);
    }

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { status, assignedTo, resolutionNotes } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (assignedTo !== undefined) ticket.assignedTo = assignedTo;
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    if (status === 'Resolved' || status === 'Closed') {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();

    await logAudit({
      req,
      action: `Updated Ticket ${ticket.ticketNumber} status: ${ticket.status}`,
      category: 'INCIDENT',
      organizationId: ticket.organizationId,
      details: { status: ticket.status, notes: ticket.resolutionNotes },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(ticket.organizationId.toString()).emit('ticket:updated', ticket);
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
