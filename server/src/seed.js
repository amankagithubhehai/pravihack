import Organization from './models/Organization.js';
import Department from './models/Department.js';
import User from './models/User.js';
import Asset from './models/Asset.js';
import Assignment from './models/Assignment.js';
import Maintenance from './models/Maintenance.js';
import Ticket from './models/Ticket.js';
import Document from './models/Document.js';
import AuditLog from './models/AuditLog.js';
import Notification from './models/Notification.js';
import QRCode from 'qrcode';

export const seedInitialData = async (force = false) => {
  try {
    if (force) {
      console.log('🧹 Clearing legacy data for Government Physical Assets overhaul...');
      await Promise.all([
        Organization.deleteMany({}),
        Department.deleteMany({}),
        User.deleteMany({}),
        Asset.deleteMany({}),
        Assignment.deleteMany({}),
        Maintenance.deleteMany({}),
        Ticket.deleteMany({}),
        Document.deleteMany({}),
        AuditLog.deleteMany({}),
        Notification.deleteMany({}),
      ]);
    } else {
      const orgCount = await Organization.countDocuments();
      if (orgCount > 0) {
        console.log('Database already has records, skipping seed.');
        return;
      }
    }

    console.log('🏛️ Seeding Government of India / State Public Sector Physical Asset Infrastructure...');

    // 1. Government Organizations (Departments / Municipal Corporations)
    const mcgmOrg = await Organization.create({
      name: 'Municipal Corporation & Public Works Authority',
      code: 'MC-PWA',
      domain: 'gov.in',
      description: 'Public Works, Urban Transportation, Water Supply & Civic Infrastructure Board',
      contactEmail: 'commissioner@pwd-urban.gov.in',
      address: 'Central Secretariat, Vidhan Bhavan Marg, Mumbai 400032',
      subscriptionPlan: 'Enterprise',
    });

    const healthOrg = await Organization.create({
      name: 'State Directorate of Health Services & Hospitals',
      code: 'DHS-GOV',
      domain: 'health.gov.in',
      description: 'Government Medical Colleges, District Civil Hospitals, and Primary Healthcare Equipment',
      contactEmail: 'director@health.gov.in',
      address: 'Swasthya Bhavan, Arogya Nagar, New Delhi',
      subscriptionPlan: 'Enterprise',
    });

    // 2. Government Departments / Directorates
    const deptTransport = await Department.create({
      name: 'Public Transit & Heavy Fleet Division',
      code: 'TRANS',
      organizationId: mcgmOrg._id,
      budget: 85000000,
      location: 'Depot 4, Worli Transit Terminal',
      description: 'State Electric City Buses, Emergency Ambulances, Heavy Cranes, and Recovery Vans',
    });

    const deptWaterSanitation = await Department.create({
      name: 'Water Supply & Sewage Treatment Directorate',
      code: 'WSD',
      organizationId: mcgmOrg._id,
      budget: 120000000,
      location: 'Bhandup Pumping Station & Treatment Complex',
      description: 'High-Capacity Turbine Pumps, Chlorination Plants, and Smart Flow Meters',
    });

    const deptPublicWorks = await Department.create({
      name: 'Civil Works, Bridges & Flyovers Wing',
      code: 'PWD-INFRA',
      organizationId: mcgmOrg._id,
      budget: 250000000,
      location: 'Engineering Division HQ, Dadar',
      description: 'Road Pavers, Hydraulic Excavators, Bridge Structural Sensors, and Asphalt Plants',
    });

    const deptDisaster = await Department.create({
      name: 'State Disaster Management & Fire Services',
      code: 'SDRF-FIRE',
      organizationId: mcgmOrg._id,
      budget: 65000000,
      location: 'Command Center & Fire Station #01',
      description: 'Multi-Utility Fire Tenders, Aerial Ladder Platforms, Life Detection Radar, and Inflatable Boats',
    });

    const deptGovHospital = await Department.create({
      name: 'Government District Civil Hospital - Radiology Wing',
      code: 'CIVIL-MED',
      organizationId: mcgmOrg._id,
      budget: 180000000,
      location: 'Block C, KEM Civil Hospital Complex',
      description: 'MRI Scanners, CT Analyzers, Oxygen Generation Plants, and ICU Ventilators',
    });

    // 3. Demo Government Officers / Custodians
    const superAdmin = await User.create({
      name: 'Shri Aman Virani, IAS',
      email: 'superadmin@assetsphere.ai',
      password: 'password123',
      role: 'Super Admin',
      phone: '+91 98200 11223',
    });

    const commissioner = await User.create({
      name: 'Dr. Rajeshwar Patil, IAS (Municipal Commissioner)',
      email: 'admin@abccorp.com',
      password: 'password123',
      role: 'Organization Admin',
      organizationId: mcgmOrg._id,
      departmentId: deptPublicWorks._id,
      phone: '+91 98199 44332',
    });

    const chiefEngineer = await User.create({
      name: 'Er. Sandeep Deshmukh (Chief Asset Officer)',
      email: 'manager@abccorp.com',
      password: 'password123',
      role: 'Asset Manager',
      organizationId: mcgmOrg._id,
      departmentId: deptTransport._id,
      phone: '+91 97690 88771',
    });

    const subEngineer = await User.create({
      name: 'Pooja Kulkarni (Executive Sub-Divisional Engineer)',
      email: 'elena@abccorp.com',
      password: 'password123',
      role: 'Employee',
      organizationId: mcgmOrg._id,
      departmentId: deptWaterSanitation._id,
      phone: '+91 98211 55667',
    });

    const cagAuditor = await User.create({
      name: 'Vikramaditya Rao (Principal Auditor - CAG / State AG)',
      email: 'auditor@abccorp.com',
      password: 'password123',
      role: 'Auditor',
      organizationId: mcgmOrg._id,
      departmentId: deptPublicWorks._id,
      phone: '+91 99300 22119',
    });

    // 4. REAL-LIFE PHYSICAL GOVERNMENT ASSETS
    const rawGovernmentAssets = [
      {
        assetId: 'GOV-FLT-1001',
        assetName: 'Tata Ultra 9/9m Electric Air-Conditioned Public Bus',
        category: 'Fleet & Public Transport Vehicles',
        assetType: 'Electric City Bus',
        serialNumber: 'MH-01-EV-4421',
        organizationId: mcgmOrg._id,
        departmentId: deptTransport._id,
        assignedTo: subEngineer._id,
        custodianOfficer: 'Depot Manager - R. K. Shinde',
        status: 'Active',
        location: 'Depot 4, Bay 12, Worli Terminal',
        district: 'Mumbai South',
        gpsCoordinates: '19.0178° N, 72.8478° E',
        cost: 18500000, // ₹1.85 Cr
        purchaseDate: new Date('2025-02-10'),
        warrantyExpiry: new Date('2028-02-10'),
        vendor: 'Tata Motors Commercial Vehicles Ltd.',
        amcVendor: 'Tata Fleet Care Services (5-Year AMC)',
        sanctionOrderNo: 'GO-TRANS/EV/2024/781',
        physicalCondition: 'Operational / Excellent',
        lastInspectionDate: new Date('2026-08-15'),
        nextInspectionDate: new Date('2026-11-15'),
        notes: 'Equipped with ITS Automated Vehicle Location System and CCTV Cameras.',
      },
      {
        assetId: 'GOV-MED-2002',
        assetName: 'Siemens Magnetom Vida 3.0T High-Field MRI Scanner',
        category: 'Public Health & Hospital Equipment',
        assetType: 'Magnetic Resonance Imaging (MRI)',
        serialNumber: 'SN-SIEM-MRI-3081',
        organizationId: mcgmOrg._id,
        departmentId: deptGovHospital._id,
        status: 'Active',
        location: 'Radiology Block, Ground Floor, Room 102',
        district: 'Central Mumbai',
        gpsCoordinates: '19.0028° N, 72.8423° E',
        cost: 82000000, // ₹8.2 Cr
        purchaseDate: new Date('2024-04-12'),
        warrantyExpiry: new Date('2026-10-15'), // Expiring in days! High Risk
        vendor: 'Siemens Healthineers India Ltd.',
        amcVendor: 'Siemens Comprehensive AMC (CAMC)',
        sanctionOrderNo: 'NHM/HOSP-EQUIP/2023/104',
        physicalCondition: 'Good',
        lastInspectionDate: new Date('2026-07-20'),
        nextInspectionDate: new Date('2026-10-20'),
        notes: 'Critical Diagnostic Unit serving ~40 OPD/IPD patients daily. Cryogen helium level at 94%.',
      },
      {
        assetId: 'GOV-EMG-3003',
        assetName: 'Rosenbauer 55-Meter Hydraulic Aerial Ladder Platform Fire Tender',
        category: 'Emergency & Defense Equipment',
        assetType: 'Hydraulic Fire Engine & Aerial Ladder',
        serialNumber: 'MH-01-FT-0911',
        organizationId: mcgmOrg._id,
        departmentId: deptDisaster._id,
        status: 'Active',
        location: 'Byculla Central Fire Station, Bay 01',
        district: 'Mumbai Central',
        gpsCoordinates: '18.9750° N, 72.8333° E',
        cost: 62000000, // ₹6.2 Cr
        purchaseDate: new Date('2023-11-14'),
        warrantyExpiry: new Date('2026-10-05'), // Expiring soon
        vendor: 'Rosenbauer International AG',
        amcVendor: 'Brij Fire Engineers Ltd.',
        sanctionOrderNo: 'SDRF/DIS-EQUIP/2023/99',
        physicalCondition: 'Operational / Excellent',
        lastInspectionDate: new Date('2026-09-01'),
        nextInspectionDate: new Date('2026-12-01'),
        notes: 'Capable of reaching 18-storey residential and commercial high-rises.',
      },
      {
        assetId: 'GOV-WTR-4004',
        assetName: 'Kirloskar 1,800 kW High-Volume Clear Water Centrifugal Pump',
        category: 'Civic & Municipal Machinery',
        assetType: 'Municipal Water Pumping Turbine',
        serialNumber: 'KIR-WP-1800-449',
        organizationId: mcgmOrg._id,
        departmentId: deptWaterSanitation._id,
        status: 'Maintenance',
        location: 'Bhandup Water Treatment Complex - Pump House 2',
        district: 'Suburban North',
        gpsCoordinates: '19.1462° N, 72.9351° E',
        cost: 14500000, // ₹1.45 Cr
        purchaseDate: new Date('2022-06-01'),
        warrantyExpiry: new Date('2025-06-01'),
        vendor: 'Kirloskar Brothers Limited',
        amcVendor: 'KBL Hydro Services',
        sanctionOrderNo: 'MCGM/WATER-ENG/2022/332',
        physicalCondition: 'Requires Maintenance',
        lastInspectionDate: new Date('2026-09-22'),
        nextInspectionDate: new Date('2026-10-05'),
        notes: 'Supplies 45 Million Liters Daily (MLD). Impeller bearing inspection underway.',
      },
      {
        assetId: 'GOV-INF-5005',
        assetName: 'JCB 3DX Super Heavy Backhoe Loader Excavator',
        category: 'Civic & Municipal Machinery',
        assetType: 'Hydraulic Earthmover',
        serialNumber: 'MH-03-EX-8812',
        organizationId: mcgmOrg._id,
        departmentId: deptPublicWorks._id,
        status: 'Active',
        location: 'PWD Central Mechanical Yard, Chembur',
        district: 'Eastern Suburbs',
        gpsCoordinates: '19.0622° N, 72.8994° E',
        cost: 4800000, // ₹48 Lakhs
        purchaseDate: new Date('2024-01-20'),
        warrantyExpiry: new Date('2027-01-20'),
        vendor: 'JCB India Private Limited',
        amcVendor: 'Larsen & Toubro Heavy Equipment Service',
        sanctionOrderNo: 'PWD/RD-MAINT/2023/511',
        physicalCondition: 'Operational / Excellent',
        lastInspectionDate: new Date('2026-08-30'),
        nextInspectionDate: new Date('2026-11-30'),
        notes: 'Dispatched for stormwater drain desilting and road resurfacing projects.',
      },
      {
        assetId: 'GOV-SURV-6006',
        assetName: 'Smart City High-Definition AI Optical Traffic Surveillance Pole Unit',
        category: 'IT & Surveillance Infrastructure',
        assetType: 'Smart City Surveillance & ANPR System',
        serialNumber: 'ANPR-POLE-4491-BANDRA',
        organizationId: mcgmOrg._id,
        departmentId: deptPublicWorks._id,
        status: 'Active',
        location: 'Western Express Highway - Kalanagar Junction',
        district: 'Bandra West',
        gpsCoordinates: '19.0607° N, 72.8515° E',
        cost: 1650000,
        purchaseDate: new Date('2024-09-10'),
        warrantyExpiry: new Date('2027-09-10'),
        vendor: 'Honeywell Automation India',
        amcVendor: 'L&T Smart World & Communication',
        sanctionOrderNo: 'SMART-CITY/TRAF-AI/2024/09',
        physicalCondition: 'Operational / Excellent',
        lastInspectionDate: new Date('2026-09-10'),
        nextInspectionDate: new Date('2026-12-10'),
        notes: 'Automated Number Plate Recognition (ANPR) and Red-Light Violation Detection.',
      },
      {
        assetId: 'GOV-BLD-7007',
        assetName: 'Sub-Divisional Revenue & Citizen e-Seva Kendra Complex',
        category: 'Government Buildings & Infrastructure',
        assetType: 'Civic Administrative Complex',
        serialNumber: 'REVENUE-BLD-4010',
        organizationId: mcgmOrg._id,
        departmentId: deptPublicWorks._id,
        status: 'Active',
        location: 'Plot 42, Sector 15, Vashi Administrative Zone',
        district: 'Navi Mumbai',
        gpsCoordinates: '19.0771° N, 72.9986° E',
        cost: 110000000, // ₹11 Cr
        purchaseDate: new Date('2021-08-15'),
        warrantyExpiry: new Date('2031-08-15'),
        vendor: 'State Public Works Department (EPC Contractor)',
        sanctionOrderNo: 'REV/CAP-EX/2020/004',
        physicalCondition: 'Good',
        lastInspectionDate: new Date('2026-03-15'),
        nextInspectionDate: new Date('2026-10-15'),
        notes: 'Houses Taluka Revenue Registry, Aadhaar Seva, Land Records Archive, and E-Governance Portal.',
      },
      {
        assetId: 'GOV-WTR-8008',
        assetName: 'Decommissioned Diesel Water Tanker Truck (10,000 Liters)',
        category: 'Fleet & Public Transport Vehicles',
        assetType: 'Water Tanker Truck',
        serialNumber: 'MH-01-W-1988',
        organizationId: mcgmOrg._id,
        departmentId: deptWaterSanitation._id,
        status: 'Retired',
        location: 'Decommissioning & Scrap Yard, Deonar',
        district: 'Eastern Suburbs',
        gpsCoordinates: '19.0558° N, 72.9189° E',
        cost: 1200000,
        purchaseDate: new Date('2009-03-10'),
        warrantyExpiry: new Date('2014-03-10'),
        vendor: 'Ashok Leyland Limited',
        sanctionOrderNo: 'SCRAP-COMM/2026/02',
        physicalCondition: 'Condemned / Decommissioned',
        lastInspectionDate: new Date('2026-06-10'),
        notes: 'Exceeded 15-year statutory lifespan mandated by National Green Tribunal (NGT). Slated for e-auction.',
      },
    ];

    for (const a of rawGovernmentAssets) {
      const qrData = JSON.stringify({
        govAssetId: a.assetId,
        name: a.assetName,
        category: a.category,
        location: a.location,
        district: a.district,
        sanction: a.sanctionOrderNo,
      });
      const qrCodeUrl = await QRCode.toDataURL(qrData);
      await Asset.create({ ...a, qrCodeUrl });
    }

    const busAsset = await Asset.findOne({ assetId: 'GOV-FLT-1001' });
    const mriAsset = await Asset.findOne({ assetId: 'GOV-MED-2002' });
    const pumpAsset = await Asset.findOne({ assetId: 'GOV-WTR-4004' });
    const fireAsset = await Asset.findOne({ assetId: 'GOV-EMG-3003' });

    // 5. Public Sector Asset Handover & Custody Assignments
    if (busAsset) {
      await Assignment.create({
        assetId: busAsset._id,
        organizationId: mcgmOrg._id,
        userId: subEngineer._id,
        assignedBy: chiefEngineer._id,
        assignedDate: new Date('2025-02-15'),
        status: 'Active',
        purpose: 'Bus Rapid Transit Route #312 Deployment and Line Inspection',
        conditionOnAssign: 'Certified Roadworthy with ARAI Compliance Certificate',
      });
    }

    // 6. Government Scheduled AMC & Preventive Maintenance Records
    if (pumpAsset) {
      await Maintenance.create({
        assetId: pumpAsset._id,
        organizationId: mcgmOrg._id,
        title: 'Emergency Impeller Bearing Replacement & Alignment',
        maintenanceType: 'Corrective',
        status: 'In Progress',
        scheduledDate: new Date('2026-09-24'),
        cost: 285000,
        vendor: 'Kirloskar Brothers Heavy Service Wing',
        technicianName: 'S. N. Joshi (Lead Turbine Specialist)',
        serviceReport: 'High vibration alarm detected on bearing assembly #4. Rotor balancing currently in progress.',
        performedBy: chiefEngineer._id,
      });
    }

    if (mriAsset) {
      await Maintenance.create({
        assetId: mriAsset._id,
        organizationId: mcgmOrg._id,
        title: 'Quarterly Cryogen Helium Refill & Superconducting Magnet Calibration',
        maintenanceType: 'AMC',
        status: 'Scheduled',
        scheduledDate: new Date('2026-10-10'),
        cost: 450000,
        vendor: 'Siemens Healthineers Advanced Engineering Unit',
        technicianName: 'Dr. Anand Verma',
        performedBy: chiefEngineer._id,
      });
    }

    if (fireAsset) {
      await Maintenance.create({
        assetId: fireAsset._id,
        organizationId: mcgmOrg._id,
        title: 'Hydraulic Pressure Integrity Test & Aerial Platform Load Certification',
        maintenanceType: 'Preventive',
        status: 'Completed',
        scheduledDate: new Date('2026-08-20'),
        completedDate: new Date('2026-08-21'),
        cost: 175000,
        vendor: 'Brij Fire Engineers Ltd.',
        technicianName: 'Major K. K. Sharma (Retd.)',
        serviceReport: 'Hydraulic pressure sustained at 320 Bar for 45 minutes with zero leakage. Aerial turntable certified fit for fire rescue up to 55m.',
        performedBy: chiefEngineer._id,
      });
    }

    // 7. Civic & Public Infrastructure Incidents
    await Ticket.create({
      ticketNumber: 'GOV-INC-0001',
      title: 'Water Pressure Drop at Pump House 2 (Turbine Pump GOV-WTR-4004)',
      description: 'Discharge telemetry shows 15% reduction in flow velocity affecting water supply to Mulund East zone.',
      organizationId: mcgmOrg._id,
      assetId: pumpAsset ? pumpAsset._id : null,
      reportedBy: subEngineer._id,
      assignedTo: chiefEngineer._id,
      ticketType: 'Hardware Failure',
      priority: 'High',
      status: 'In Progress',
    });

    await Ticket.create({
      ticketNumber: 'GOV-INC-0002',
      title: 'Annual Statutory Inspection Clearance Required for MRI Magnetom Vida',
      description: 'AERB (Atomic Energy Regulatory Board) radiation safety renewal certificate pending before warranty expiry on 15 Oct 2026.',
      organizationId: mcgmOrg._id,
      assetId: mriAsset ? mriAsset._id : null,
      reportedBy: commissioner._id,
      assignedTo: chiefEngineer._id,
      ticketType: 'General Request',
      priority: 'Critical',
      status: 'Open',
    });

    // 8. Official Government SOP Documents & Guidelines (RAG Indexed)
    await Document.create({
      organizationId: mcgmOrg._id,
      title: 'GFR-2017 Rule 217: Physical Verification of Public Assets & Inventory Management',
      category: 'Compliance',
      content: `General Financial Rules (GFR 2017) - Rule 217 & Rule 218 for Government Physical Assets:
1. Annual Physical Verification: Physical verification of all fixed public assets (infrastructure, heavy machinery, and government vehicles) shall be conducted at least once every year by an independent Verification Officer.
2. Discrepancy Reporting: Shortages or damages shall be recorded on Form GFR-24 and submitted to the Chief Accounts Officer within 30 days.
3. Geo-tagging Mandate: All municipal machinery and public works must maintain verifiable GPS coordinates and physical QR barcode identification.
4. Transfer Protocols: Inter-departmental transfer of assets requires Form GFR-21 signed by the Competent Sanctioning Authority.`,
      tags: ['gfr', 'physical verification', 'compliance', 'cag', 'rules'],
      uploadedBy: commissioner._id,
    });

    await Document.create({
      organizationId: mcgmOrg._id,
      title: 'SOP-DIS-09: Condemnation and Disposal Protocol for Government Vehicles & Heavy Plant',
      category: 'SOP',
      content: `State Directorate of Transport - Asset Condemnation SOP:
1. Condemnation Board: A statutory condemnation committee comprising Executive Engineer (Mech), Regional Transport Officer (RTO), and Accounts Officer must physically inspect the asset.
2. Eligibility for Condemnation:
   - Vehicles: Completion of 15 years or 250,000 km (whichever is earlier), or certified uneconomical to repair by Government Workshop.
   - Medical & Radiology Units: Certified obsolete by State Health Bio-Medical Technical Evaluation Committee.
3. Disposal Mechanism: All condemned assets must be auctioned through the MSTC e-Auction Portal (Government of India Enterprise).
4. Proceeds & Write-off: Sale proceeds must be deposited into the State Consolidated Fund under Head '0075-Misc General Services'. Asset status updated to 'Disposed'.`,
      tags: ['condemnation', 'mstc', 'disposal', 'e-auction', 'rto', 'vehicles'],
      uploadedBy: commissioner._id,
    });

    await Document.create({
      organizationId: mcgmOrg._id,
      title: 'Health Directorate Policy: Bio-Medical Equipment AMC & Uptime Guarantee',
      category: 'Policy',
      content: `Public Healthcare Bio-Medical Equipment Maintenance Policy:
1. Mandatory Comprehensive AMC (CAMC): All critical medical assets valued above ₹25 Lakhs (MRI, CT, Ventilators) must operate under OEM CAMC with 95% guaranteed uptime.
2. Down-time Penalty: For downtime exceeding 48 hours without replacement backup, vendor is penalized at ₹15,000/day as per State Health Procurement Terms.
3. Periodic Quality Assurance: AERB and NABL calibration must be logged semi-annually.`,
      tags: ['mri', 'medical', 'camc', 'uptime', 'hospitals', 'siemens'],
      uploadedBy: commissioner._id,
    });

    // 9. Statutory CAG Compliance Audit Logs
    await AuditLog.create({
      organizationId: mcgmOrg._id,
      userId: superAdmin._id,
      userName: superAdmin.name,
      userEmail: superAdmin.email,
      userRole: superAdmin.role,
      action: 'Initialized State Physical Asset Infrastructure Registry (PWA-Portal v1.0)',
      category: 'SYSTEM',
      details: { organization: 'Municipal Corporation & Public Works Authority', compliance: 'GFR 2017' },
      timestamp: new Date(),
    });

    await AuditLog.create({
      organizationId: mcgmOrg._id,
      userId: cagAuditor._id,
      userName: cagAuditor.name,
      userEmail: cagAuditor.email,
      userRole: cagAuditor.role,
      action: 'CAG Statutory Audit Clearance issued for Financial Year Physical Asset Verification',
      category: 'ORGANIZATION',
      details: { auditedUnits: 'Transit Fleet, Bhandup Pumping Plant, KEM Radiology Block' },
      timestamp: new Date(Date.now() - 7200000),
    });

    // 10. Urgent Government Notifications & Alerts
    await Notification.create({
      organizationId: mcgmOrg._id,
      userId: null,
      title: '🚨 Critical Warranty & AERB Renewal: Siemens 3.0T MRI Scanner',
      message: 'Government District Hospital MRI Scanner warranty expires on 15 Oct 2026. Process CAMC file to avoid OPD diagnostic disruption.',
      type: 'WARRANTY',
    });

    await Notification.create({
      organizationId: mcgmOrg._id,
      userId: null,
      title: '⚙️ Urgent Pumping Turbine Maintenance in Progress',
      message: 'Bhandup 1,800 kW Pump GOV-WTR-4004 maintenance ongoing. Target restoration within 12 hours.',
      type: 'MAINTENANCE',
    });

    console.log('✅ Real-Life Government Physical Asset Ecosystem Seeded Successfully!');
  } catch (error) {
    console.error('Error during government seed:', error);
  }
};
