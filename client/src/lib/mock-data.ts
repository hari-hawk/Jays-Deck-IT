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
  {
    id: '1',
    action: 'CREATE' as const,
    entityType: 'Ticket',
    entityId: 'TK-1042',
    user: 'Priya Sharma',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: '2',
    action: 'ASSIGN' as const,
    entityType: 'Asset',
    entityId: 'AST-0387',
    user: 'Ravi Kumar',
    timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
  },
  {
    id: '3',
    action: 'UPDATE' as const,
    entityType: 'Ticket',
    entityId: 'TK-1039',
    user: 'Anita Desai',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: '4',
    action: 'APPROVE' as const,
    entityType: 'AccessRequest',
    entityId: 'AR-0215',
    user: 'James Wilson',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '5',
    action: 'CREATE' as const,
    entityType: 'Asset',
    entityId: 'AST-0392',
    user: 'System',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: '6',
    action: 'DELETE' as const,
    entityType: 'Asset',
    entityId: 'AST-0201',
    user: 'Ravi Kumar',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: '7',
    action: 'UPDATE' as const,
    entityType: 'User',
    entityId: 'USR-0098',
    user: 'Priya Sharma',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: '8',
    action: 'ASSIGN' as const,
    entityType: 'Ticket',
    entityId: 'TK-1038',
    user: 'James Wilson',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: '9',
    action: 'CREATE' as const,
    entityType: 'Ticket',
    entityId: 'TK-1037',
    user: 'Anita Desai',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: '10',
    action: 'APPROVE' as const,
    entityType: 'AccessRequest',
    entityId: 'AR-0214',
    user: 'James Wilson',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
];
