// ── Dashboard Stats ──
export const mockStats = {
  totalAssets: 342,
  assignedAssets: 256,
  availableAssets: 54,
  maintenanceAssets: 18,
  openTickets: 23,
  pendingApprovals: 7,
  slaCompliance: 94,
  totalEmployees: 186,
  activeEmployees: 172,
};

export const mockTicketTrends = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const key = date.toISOString().split('T')[0];
  return {
    date: key,
    opened: Math.floor(Math.random() * 8) + 1,
    resolved: Math.floor(Math.random() * 6) + 1,
  };
});

export const mockAssetsByCategory = [
  { name: 'LAPTOP', value: 128 },
  { name: 'DESKTOP', value: 64 },
  { name: 'MONITOR', value: 52 },
  { name: 'PHONE', value: 34 },
  { name: 'HEADSET', value: 28 },
  { name: 'SOFTWARE_LICENSE', value: 24 },
  { name: 'OTHER', value: 12 },
];

export const mockAssetsByStatus = [
  { name: 'AVAILABLE', value: 54 },
  { name: 'ASSIGNED', value: 256 },
  { name: 'IN_MAINTENANCE', value: 18 },
  { name: 'RETIRED', value: 10 },
  { name: 'LOST', value: 4 },
];

export const mockTicketsByStatus = [
  { name: 'OPEN', value: 12 },
  { name: 'ASSIGNED', value: 5 },
  { name: 'IN_PROGRESS', value: 6 },
  { name: 'ON_HOLD', value: 3 },
  { name: 'RESOLVED', value: 45 },
  { name: 'CLOSED', value: 89 },
  { name: 'ESCALATED', value: 2 },
];

export const mockRecentActivity = [
  { id: '1', action: 'CREATE' as const, entityType: 'Ticket', entityId: 'TK-1042', user: 'Priya Sharma', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
  { id: '2', action: 'ASSIGN' as const, entityType: 'Asset', entityId: 'AST-0387', user: 'Ravi Kumar', timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString() },
  { id: '3', action: 'UPDATE' as const, entityType: 'Ticket', entityId: 'TK-1039', user: 'Anita Desai', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { id: '4', action: 'APPROVE' as const, entityType: 'Ticket', entityId: 'TK-0998', user: 'James Wilson', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: '5', action: 'CREATE' as const, entityType: 'Asset', entityId: 'AST-0392', user: 'System', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: '6', action: 'DELETE' as const, entityType: 'Asset', entityId: 'AST-0201', user: 'Ravi Kumar', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: '7', action: 'UPDATE' as const, entityType: 'User', entityId: 'USR-0098', user: 'Priya Sharma', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
  { id: '8', action: 'ASSIGN' as const, entityType: 'Ticket', entityId: 'TK-1038', user: 'James Wilson', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
  { id: '9', action: 'CREATE' as const, entityType: 'Ticket', entityId: 'TK-1037', user: 'Anita Desai', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
  { id: '10', action: 'CREATE' as const, entityType: 'Ticket', entityId: 'TK-1036', user: 'James Wilson', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString() },
];

// ── Assets ──
export interface MockAsset {
  id: string;
  name: string;
  assetTag: string;
  category: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'IN_MAINTENANCE' | 'RETIRED' | 'LOST';
  assignee: string | null;
  assigneeId: string | null;
  department: string;
  location: string;
  purchaseDate: string;
  warrantyExpiry: string;
  serialNumber: string;
  notes: string;
}

export const mockAssets: MockAsset[] = [
  { id: '1', name: 'MacBook Pro 16"', assetTag: 'AST-0001', category: 'LAPTOP', status: 'ASSIGNED', assignee: 'Priya Sharma', assigneeId: '1', department: 'Engineering', location: 'Chennai Office', purchaseDate: '2024-03-15', warrantyExpiry: '2027-03-15', serialNumber: 'C02Z19XXXXXX', notes: 'M3 Max, 64GB RAM, 1TB SSD' },
  { id: '2', name: 'Dell UltraSharp 27"', assetTag: 'AST-0002', category: 'MONITOR', status: 'ASSIGNED', assignee: 'Ravi Kumar', assigneeId: '2', department: 'Design', location: 'Chennai Office', purchaseDate: '2024-01-10', warrantyExpiry: '2027-01-10', serialNumber: 'DL4K27XXXXXX', notes: '4K IPS Display' },
  { id: '3', name: 'ThinkPad X1 Carbon', assetTag: 'AST-0003', category: 'LAPTOP', status: 'AVAILABLE', assignee: null, assigneeId: null, department: 'IT', location: 'Storage Room A', purchaseDate: '2024-06-20', warrantyExpiry: '2027-06-20', serialNumber: 'LN-X1C-XXXXXX', notes: 'i7, 32GB RAM, 512GB SSD' },
  { id: '4', name: 'iPhone 15 Pro', assetTag: 'AST-0004', category: 'PHONE', status: 'ASSIGNED', assignee: 'Anita Desai', assigneeId: '3', department: 'Sales', location: 'Bangalore Office', purchaseDate: '2024-09-22', warrantyExpiry: '2025-09-22', serialNumber: 'AP-IP15-XXXXXX', notes: 'Company phone for client calls' },
  { id: '5', name: 'HP LaserJet Pro', assetTag: 'AST-0005', category: 'OTHER', status: 'IN_MAINTENANCE', assignee: null, assigneeId: null, department: 'Operations', location: 'Chennai Office', purchaseDate: '2023-04-10', warrantyExpiry: '2026-04-10', serialNumber: 'HP-LJ-XXXXXX', notes: 'Shared printer, toner replacement needed' },
  { id: '6', name: 'Jabra Evolve2 85', assetTag: 'AST-0006', category: 'HEADSET', status: 'ASSIGNED', assignee: 'James Wilson', assigneeId: '4', department: 'Support', location: 'Remote', purchaseDate: '2024-02-15', warrantyExpiry: '2026-02-15', serialNumber: 'JB-E285-XXXXXX', notes: 'ANC headset for remote work' },
  { id: '7', name: 'Microsoft Office 365', assetTag: 'AST-0007', category: 'SOFTWARE_LICENSE', status: 'ASSIGNED', assignee: 'All Staff', assigneeId: null, department: 'IT', location: 'Cloud', purchaseDate: '2024-01-01', warrantyExpiry: '2025-12-31', serialNumber: 'MS-365-ENT-001', notes: 'Enterprise license, 200 seats' },
  { id: '8', name: 'Dell OptiPlex 7090', assetTag: 'AST-0008', category: 'DESKTOP', status: 'RETIRED', assignee: null, assigneeId: null, department: 'IT', location: 'Storage Room B', purchaseDate: '2020-05-15', warrantyExpiry: '2023-05-15', serialNumber: 'DL-OP-XXXXXX', notes: 'End of life, scheduled for disposal' },
  { id: '9', name: 'Samsung Galaxy Tab S9', assetTag: 'AST-0009', category: 'OTHER', status: 'ASSIGNED', assignee: 'Priya Sharma', assigneeId: '1', department: 'Engineering', location: 'Chennai Office', purchaseDate: '2024-08-01', warrantyExpiry: '2026-08-01', serialNumber: 'SM-TS9-XXXXXX', notes: 'Testing device for mobile QA' },
  { id: '10', name: 'LG 34" UltraWide', assetTag: 'AST-0010', category: 'MONITOR', status: 'AVAILABLE', assignee: null, assigneeId: null, department: 'IT', location: 'Storage Room A', purchaseDate: '2024-11-05', warrantyExpiry: '2027-11-05', serialNumber: 'LG-UW34-XXXXXX', notes: 'Curved ultrawide for new hire' },
];

// ── Employees ──
export interface MockEmployee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  location: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  joinDate: string;
  phone: string;
  avatarInitials: string;
  assignedAssets: number;
  openTickets: number;
}

export const mockEmployees: MockEmployee[] = [
  { id: '1', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@techjays.com', department: 'Engineering', designation: 'Senior Developer', location: 'Chennai Office', status: 'ACTIVE', joinDate: '2022-03-15', phone: '+91 98765 43210', avatarInitials: 'PS', assignedAssets: 3, openTickets: 1 },
  { id: '2', firstName: 'Ravi', lastName: 'Kumar', email: 'ravi.kumar@techjays.com', department: 'Design', designation: 'UI/UX Lead', location: 'Chennai Office', status: 'ACTIVE', joinDate: '2021-07-01', phone: '+91 98765 43211', avatarInitials: 'RK', assignedAssets: 2, openTickets: 0 },
  { id: '3', firstName: 'Anita', lastName: 'Desai', email: 'anita.desai@techjays.com', department: 'Sales', designation: 'Account Manager', location: 'Bangalore Office', status: 'ACTIVE', joinDate: '2023-01-10', phone: '+91 98765 43212', avatarInitials: 'AD', assignedAssets: 2, openTickets: 2 },
  { id: '4', firstName: 'James', lastName: 'Wilson', email: 'james.wilson@techjays.com', department: 'Support', designation: 'IT Support Lead', location: 'Remote', status: 'ACTIVE', joinDate: '2022-09-05', phone: '+1 555 123 4567', avatarInitials: 'JW', assignedAssets: 1, openTickets: 5 },
  { id: '5', firstName: 'Meera', lastName: 'Patel', email: 'meera.patel@techjays.com', department: 'HR', designation: 'HR Manager', location: 'Chennai Office', status: 'ACTIVE', joinDate: '2021-03-20', phone: '+91 98765 43213', avatarInitials: 'MP', assignedAssets: 1, openTickets: 0 },
  { id: '6', firstName: 'Arjun', lastName: 'Nair', email: 'arjun.nair@techjays.com', department: 'Engineering', designation: 'DevOps Engineer', location: 'Chennai Office', status: 'ON_LEAVE', joinDate: '2023-06-15', phone: '+91 98765 43214', avatarInitials: 'AN', assignedAssets: 2, openTickets: 1 },
  { id: '7', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@techjays.com', department: 'Marketing', designation: 'Content Lead', location: 'Remote', status: 'ACTIVE', joinDate: '2023-10-01', phone: '+1 555 234 5678', avatarInitials: 'SJ', assignedAssets: 1, openTickets: 0 },
  { id: '8', firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@techjays.com', department: 'Engineering', designation: 'Junior Developer', location: 'Chennai Office', status: 'ACTIVE', joinDate: '2024-01-15', phone: '+91 98765 43215', avatarInitials: 'VS', assignedAssets: 2, openTickets: 1 },
  { id: '9', firstName: 'Lisa', lastName: 'Chen', email: 'lisa.chen@techjays.com', department: 'Finance', designation: 'Finance Analyst', location: 'Bangalore Office', status: 'INACTIVE', joinDate: '2022-05-10', phone: '+91 98765 43216', avatarInitials: 'LC', assignedAssets: 0, openTickets: 0 },
  { id: '10', firstName: 'Deepak', lastName: 'Reddy', email: 'deepak.reddy@techjays.com', department: 'Engineering', designation: 'Tech Lead', location: 'Chennai Office', status: 'ACTIVE', joinDate: '2020-11-01', phone: '+91 98765 43217', avatarInitials: 'DR', assignedAssets: 3, openTickets: 2 },
];

// ── Tickets ──
export type TicketCategory = 'Hardware' | 'Software' | 'Network' | 'Access Request' | 'Security' | 'General IT' | 'Other';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';

export interface MockTicket {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  createdById: string;
  assignee: string | null;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  comments: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: string;
  }>;
}

export const mockTickets: MockTicket[] = [
  {
    id: '1', ticketId: 'TK-1042', title: 'Laptop screen flickering intermittently', description: 'My MacBook Pro screen has been flickering intermittently for the past two days. It happens mainly when I connect to an external monitor. Already tried restarting and resetting NVRAM.', category: 'Hardware', priority: 'HIGH', status: 'OPEN',
    createdBy: 'Priya Sharma', createdById: '1', assignee: 'James Wilson', assigneeId: '4',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    comments: [
      { id: 'c1', author: 'James Wilson', content: 'I will look into this. Can you try connecting with a different cable first?', createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
    ],
  },
  {
    id: '2', ticketId: 'TK-1041', title: 'VPN connection drops frequently', description: 'VPN disconnects every 15-20 minutes when working from home. Using the recommended client version 4.2.1.', category: 'Network', priority: 'MEDIUM', status: 'IN_PROGRESS',
    createdBy: 'Sarah Johnson', createdById: '7', assignee: 'Arjun Nair', assigneeId: '6',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    comments: [
      { id: 'c2', author: 'Arjun Nair', content: 'Checking the VPN server logs. Could be related to the recent firewall update.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: 'c3', author: 'Sarah Johnson', content: 'It seems to happen more during peak hours (10am-12pm).', createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    ],
  },
  {
    id: '3', ticketId: 'TK-1040', title: 'Need Adobe Creative Cloud license', description: 'Requesting Adobe Creative Cloud license for the new design project starting next week. Need Photoshop, Illustrator, and XD.', category: 'Software', priority: 'MEDIUM', status: 'ASSIGNED',
    createdBy: 'Ravi Kumar', createdById: '2', assignee: 'James Wilson', assigneeId: '4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    comments: [],
  },
  {
    id: '4', ticketId: 'TK-1039', title: 'Printer on 3rd floor not working', description: 'The HP LaserJet on the 3rd floor is showing "Paper Jam" error but there is no paper jam. Already tried power cycling.', category: 'Hardware', priority: 'LOW', status: 'RESOLVED',
    createdBy: 'Meera Patel', createdById: '5', assignee: 'James Wilson', assigneeId: '4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    comments: [
      { id: 'c4', author: 'James Wilson', content: 'Fixed the issue. The paper tray sensor was misaligned. Adjusted and tested - working fine now.', createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
    ],
  },
  {
    id: '5', ticketId: 'TK-1038', title: 'Email not syncing on mobile', description: 'Outlook mobile app stopped syncing emails since yesterday morning. Already tried removing and re-adding the account.', category: 'Software', priority: 'HIGH', status: 'IN_PROGRESS',
    createdBy: 'Anita Desai', createdById: '3', assignee: 'James Wilson', assigneeId: '4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    comments: [
      { id: 'c5', author: 'James Wilson', content: 'This might be related to the recent Exchange server update. Investigating.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() },
    ],
  },
  {
    id: '6', ticketId: 'TK-1037', title: 'Request for dual monitor setup', description: 'Requesting a second monitor for my workstation to improve productivity. Currently working with a single 24" monitor.', category: 'Hardware', priority: 'LOW', status: 'OPEN',
    createdBy: 'Vikram Singh', createdById: '8', assignee: null, assigneeId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    comments: [],
  },
  {
    id: '7', ticketId: 'TK-1036', title: 'Suspicious email received', description: 'Received a suspicious email claiming to be from IT department asking for password reset. Forwarded to security team. Email subject: "Urgent: Password Reset Required".', category: 'Security', priority: 'CRITICAL', status: 'ESCALATED',
    createdBy: 'Deepak Reddy', createdById: '10', assignee: 'James Wilson', assigneeId: '4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    comments: [
      { id: 'c6', author: 'James Wilson', content: 'Escalated to security team. This appears to be a phishing attempt. Sending company-wide alert.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString() },
    ],
  },
  {
    id: '8', ticketId: 'TK-1035', title: 'Wi-Fi slow in conference room B', description: 'Wi-Fi speed in Conference Room B is consistently below 10 Mbps. Makes video calls very difficult.', category: 'Network', priority: 'MEDIUM', status: 'CLOSED',
    createdBy: 'Anita Desai', createdById: '3', assignee: 'Arjun Nair', assigneeId: '6',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    comments: [
      { id: 'c7', author: 'Arjun Nair', content: 'Added a new access point in Conference Room B. Speed now consistently above 100 Mbps.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString() },
      { id: 'c8', author: 'Anita Desai', content: 'Confirmed - much better now. Thank you!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString() },
    ],
  },
];

// ── Knowledge Base ──
export interface MockArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export const mockArticles: MockArticle[] = [
  {
    id: '1', title: 'How to Connect to VPN', category: 'Network',
    content: `# How to Connect to VPN\n\n## Prerequisites\n- VPN client v4.2.1 or later installed\n- Active company credentials\n\n## Steps\n1. Open the VPN client application\n2. Enter the server address: **vpn.techjays.com**\n3. Enter your company email and password\n4. Click **Connect**\n5. Wait for the connection to establish (usually 5-10 seconds)\n\n## Troubleshooting\n- If connection fails, try switching to **Protocol: IKEv2**\n- Ensure your internet connection is stable\n- Contact IT Support if issues persist`,
    author: 'Arjun Nair', createdAt: '2024-06-15T10:00:00Z', updatedAt: '2025-01-10T14:30:00Z', tags: ['vpn', 'network', 'remote-work'],
  },
  {
    id: '2', title: 'Setting Up Your New Laptop', category: 'Hardware',
    content: `# Setting Up Your New Laptop\n\n## Initial Setup\n1. Power on the laptop\n2. Connect to **TechJays-Corp** Wi-Fi network\n3. Sign in with your company Microsoft account\n4. Run Windows/macOS updates\n\n## Required Software\n- Microsoft Office 365 (auto-installs via Intune)\n- Slack Desktop App\n- VPN Client\n- Company Security Suite\n\n## Configuration\n- Enable FileVault/BitLocker encryption\n- Set up automatic backups to OneDrive\n- Configure email in Outlook`,
    author: 'James Wilson', createdAt: '2024-03-10T09:00:00Z', updatedAt: '2025-02-05T11:00:00Z', tags: ['laptop', 'setup', 'onboarding'],
  },
  {
    id: '3', title: 'Password Policy and Best Practices', category: 'Security',
    content: `# Password Policy\n\n## Requirements\n- Minimum 12 characters\n- Must include uppercase, lowercase, numbers, and special characters\n- Cannot reuse last 10 passwords\n- Must change every 90 days\n\n## Best Practices\n- Use a password manager (1Password is company-provided)\n- Never share passwords via email or chat\n- Enable MFA on all accounts\n- Report suspicious login attempts immediately`,
    author: 'James Wilson', createdAt: '2024-01-20T08:00:00Z', updatedAt: '2024-12-01T10:00:00Z', tags: ['security', 'password', 'mfa'],
  },
  {
    id: '4', title: 'Requesting Software Licenses', category: 'Software',
    content: `# How to Request Software Licenses\n\n## Process\n1. Create a new ticket in Service Hub\n2. Select category: **Software**\n3. Specify the software name and version needed\n4. Provide business justification\n5. Get manager approval (auto-routed)\n\n## Turnaround Time\n- Standard software: 1-2 business days\n- Specialized software: 3-5 business days\n- Enterprise licenses: 5-10 business days\n\n## Pre-approved Software\nThe following software can be installed without a ticket:\n- VS Code, Slack, Chrome, Firefox, Zoom`,
    author: 'Meera Patel', createdAt: '2024-05-05T13:00:00Z', updatedAt: '2025-01-15T09:00:00Z', tags: ['software', 'licenses', 'requests'],
  },
  {
    id: '5', title: 'IT Support Escalation Matrix', category: 'General IT',
    content: `# IT Support Escalation Matrix\n\n## Tier 1 - Help Desk\n- Password resets\n- Basic software issues\n- Hardware setup\n- Response time: 1 hour\n\n## Tier 2 - Technical Support\n- Network issues\n- Server access\n- Complex software problems\n- Response time: 4 hours\n\n## Tier 3 - Engineering\n- Infrastructure issues\n- Security incidents\n- Data recovery\n- Response time: Based on severity`,
    author: 'James Wilson', createdAt: '2024-02-28T15:00:00Z', updatedAt: '2024-11-20T12:00:00Z', tags: ['support', 'escalation', 'sla'],
  },
];

// ── Audit Trail ──
export interface MockAuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  user: string;
  userId: string;
  ipAddress: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export const mockAuditEntries: MockAuditEntry[] = [
  { id: '1', action: 'CREATE', entityType: 'Ticket', entityId: 'TK-1042', description: 'Created ticket: Laptop screen flickering', user: 'Priya Sharma', userId: '1', ipAddress: '192.168.1.105', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
  { id: '2', action: 'ASSIGN', entityType: 'Asset', entityId: 'AST-0387', description: 'Assigned MacBook Pro to Ravi Kumar', user: 'James Wilson', userId: '4', ipAddress: '10.0.0.52', timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString() },
  { id: '3', action: 'UPDATE', entityType: 'Ticket', entityId: 'TK-1039', description: 'Updated ticket status to Resolved', user: 'James Wilson', userId: '4', ipAddress: '10.0.0.52', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { id: '4', action: 'LOGIN', entityType: 'User', entityId: 'USR-0001', description: 'User logged in successfully', user: 'Priya Sharma', userId: '1', ipAddress: '192.168.1.105', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: '5', action: 'CREATE', entityType: 'Asset', entityId: 'AST-0392', description: 'Created asset: Samsung Galaxy Tab S9', user: 'System', userId: 'system', ipAddress: '10.0.0.1', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: '6', action: 'DELETE', entityType: 'Asset', entityId: 'AST-0201', description: 'Retired asset: Dell OptiPlex 5060', user: 'Ravi Kumar', userId: '2', ipAddress: '192.168.1.110', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: '7', action: 'UPDATE', entityType: 'User', entityId: 'USR-0098', description: 'Updated user profile: department changed', user: 'Meera Patel', userId: '5', ipAddress: '192.168.1.120', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
  { id: '8', action: 'ESCALATE', entityType: 'Ticket', entityId: 'TK-1036', description: 'Escalated ticket: Suspicious email (security)', user: 'James Wilson', userId: '4', ipAddress: '10.0.0.52', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
  { id: '9', action: 'CREATE', entityType: 'Ticket', entityId: 'TK-1037', description: 'Created ticket: Request for dual monitor setup', user: 'Vikram Singh', userId: '8', ipAddress: '192.168.1.130', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
  { id: '10', action: 'LOGIN', entityType: 'User', entityId: 'USR-0004', description: 'User logged in from new device', user: 'Sarah Johnson', userId: '7', ipAddress: '76.23.45.112', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString() },
  { id: '11', action: 'UPDATE', entityType: 'Asset', entityId: 'AST-0005', description: 'Changed asset status to IN_MAINTENANCE', user: 'James Wilson', userId: '4', ipAddress: '10.0.0.52', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: '12', action: 'CREATE', entityType: 'User', entityId: 'USR-0120', description: 'New user account created: Vikram Singh', user: 'Meera Patel', userId: '5', ipAddress: '192.168.1.120', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString() },
];
