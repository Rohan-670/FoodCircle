/**
 * Static mock data for UI design-system previews.
 * Backend APIs are not connected in this phase.
 */

export const MOCK_DONATIONS = [
  {
    id: 'mock-don-101',
    title: 'Vegetable Pulao & Lentil Curry Trays',
    category: 'Cooked Meals',
    quantity: 65,
    unit: 'servings',
    preparedAt: 'Today, 12:30 PM',
    expiresAt: 'Today, 05:30 PM',
    urgency: 'CRITICAL',
    hoursRemaining: 2.5,
    distanceKm: 1.8,
    pickupAddress: '42 Residency Road, Central Ward',
    donorName: 'Saffron Courtyard Kitchen',
    donorVerified: true,
    packagingInfo: 'Sealed food-grade aluminum hotel pans with tamper tape',
    allergenInfo: 'Contains ghee (dairy); prepared in a kitchen handling cashews',
    storageRequirements: 'Keep hot above 60°C in insulated thermal carriers',
    status: 'AVAILABLE',
    safetyChecklist: [
      { label: 'Sealed in clean food-grade containers', confirmed: true },
      { label: 'Maintained at safe holding temperature', confirmed: true },
      { label: 'Within safe-consumption window', confirmed: true },
      { label: 'No signs of spoilage or cross-contamination', confirmed: true },
    ],
    safetyWarnings: [
      'Perishable cooked batch — distribute within 2.5 hours.',
      'Allergen notice: Contains dairy (ghee) and possible nut traces.',
      'Disclaimer: Food safety details are donor-reported. Platform listings or photos do not certify food safety.',
    ],
  },
  {
    id: 'mock-don-102',
    title: 'Whole-Grain Artisan Loaves & Rolls',
    category: 'Bakery & Bread',
    quantity: 40,
    unit: 'loaves',
    preparedAt: 'Today, 07:00 AM',
    expiresAt: 'Tomorrow, 09:00 AM',
    urgency: 'MEDIUM',
    hoursRemaining: 18,
    distanceKm: 4.2,
    pickupAddress: '19 Maple Avenue, North Market',
    donorName: 'Hearthstone Bakehouse',
    donorVerified: true,
    packagingInfo: 'Individually bagged in kraft paper sleeves',
    allergenInfo: 'Contains wheat (gluten) and sesame seeds',
    storageRequirements: 'Store in cool, dry crates away from direct sunlight',
    status: 'REQUESTED',
    safetyChecklist: [
      { label: 'Sealed in clean food-grade containers', confirmed: true },
      { label: 'Maintained at safe holding temperature', confirmed: true },
      { label: 'Within safe-consumption window', confirmed: true },
      { label: 'No signs of spoilage or cross-contamination', confirmed: true },
    ],
    safetyWarnings: [
      'Allergen notice: Contains gluten and sesame.',
      'Disclaimer: Food safety details are donor-reported. Platform listings or photos do not certify food safety.',
    ],
  },
  {
    id: 'mock-don-103',
    title: 'Seasonal Crate: Tomatoes, Spinach & Apples',
    category: 'Fresh Produce',
    quantity: 32,
    unit: 'kg',
    preparedAt: 'Today, 08:15 AM',
    expiresAt: 'In 2 days',
    urgency: 'LOW',
    hoursRemaining: 36,
    distanceKm: 6.4,
    pickupAddress: '88 Cooperative Market Yard, West Zone',
    donorName: 'Greenfield Grocers Co-op',
    donorVerified: false,
    packagingInfo: 'Ventilated reusable produce crates',
    allergenInfo: 'None known',
    storageRequirements: 'Refrigerate leafy greens at 4°C; keep apples cool',
    status: 'AVAILABLE',
    safetyChecklist: [
      { label: 'Sealed in clean food-grade containers', confirmed: true },
      { label: 'Maintained at safe holding temperature', confirmed: true },
      { label: 'Within safe-consumption window', confirmed: true },
      { label: 'No signs of spoilage or cross-contamination', confirmed: true },
    ],
    safetyWarnings: [
      'Rinse fresh produce prior to meal preparation.',
      'Disclaimer: Food safety details are donor-reported. Platform listings or photos do not certify food safety.',
    ],
  },
  {
    id: 'mock-don-104',
    title: 'Packaged UHT Milk & Yogurt Cups',
    category: 'Dairy & Beverages',
    quantity: 80,
    unit: 'packs',
    preparedAt: 'Factory Sealed',
    expiresAt: 'Today, 09:00 PM',
    urgency: 'HIGH',
    hoursRemaining: 6,
    distanceKm: 3.1,
    pickupAddress: '112 Ring Road, East District',
    donorName: 'Metro Fresh Mart',
    donorVerified: true,
    packagingInfo: 'Unopened retail cartons in chilled totes',
    allergenInfo: 'Contains dairy',
    storageRequirements: 'Strict cold-chain below 5°C required',
    status: 'ACCEPTED',
    safetyChecklist: [
      { label: 'Sealed in clean food-grade containers', confirmed: true },
      { label: 'Maintained at safe holding temperature', confirmed: true },
      { label: 'Within safe-consumption window', confirmed: true },
      { label: 'No signs of spoilage or cross-contamination', confirmed: true },
    ],
    safetyWarnings: [
      'Perishable dairy — maintain cold-chain during transit.',
      'Disclaimer: Food safety details are donor-reported. Platform listings or photos do not certify food safety.',
    ],
  },
];

export const MOCK_NGO_RECOMMENDATIONS = [
  {
    id: 'rec-1',
    donation: MOCK_DONATIONS[0],
    score: 94,
    distanceKm: 1.8,
    breakdown: { distance: 96, category: 100, quantity: 100, urgency: 100, capacity: 85 },
    reasons: [
      '1.8 km from your Central Ward distribution hub',
      'Matches preferred category: Cooked Meals',
      'Covers 100% of your 60-serving evening requirement',
      'Critical urgency (2.5h remaining)',
    ],
  },
  {
    id: 'rec-2',
    donation: MOCK_DONATIONS[1],
    score: 79,
    distanceKm: 4.2,
    breakdown: { distance: 84, category: 100, quantity: 70, urgency: 60, capacity: 100 },
    reasons: [
      '4.2 km away in North Market',
      'Matches preferred category: Bakery & Bread',
      'Fits within your 120-unit storage capacity',
    ],
  },
];

export const MOCK_VOLUNTEER_TASKS = [
  {
    id: 'task-201',
    title: 'Vegetable Pulao & Lentil Curry Trays',
    pickupAddress: '42 Residency Road, Central Ward',
    deliveryAddress: '15 Hope Shelter Lane, Central Ward',
    distanceKm: 2.3,
    etaMinutes: 11,
    status: 'VOLUNTEER_ASSIGNED',
    timelineStep: 2,
  },
  {
    id: 'task-202',
    title: 'Packaged UHT Milk & Yogurt Cups',
    pickupAddress: '112 Ring Road, East District',
    deliveryAddress: '74 Community Kitchen, East District',
    distanceKm: 3.5,
    etaMinutes: 16,
    status: 'PENDING_VOLUNTEER',
    timelineStep: 1,
  },
];

export const MOCK_ADMIN_VERIFICATIONS = [
  {
    id: 'ver-1',
    organization: 'Mercy Community Kitchen',
    type: 'NGO',
    registrationNo: 'NGO-2026-4418',
    serviceArea: 'South & Central Wards',
    submittedAt: '2 hours ago',
    status: 'PENDING',
  },
  {
    id: 'ver-2',
    organization: 'Greenfield Grocers Co-op',
    type: 'DONOR',
    registrationNo: 'FSSAI-882910',
    serviceArea: 'West Zone',
    submittedAt: '1 day ago',
    status: 'PENDING',
  },
];

export const MOCK_ADMIN_REPORTS = [
  {
    id: 'rep-1',
    donationTitle: 'Event Buffet Surplus Batch #14',
    reportedBy: 'St. Jude Community Pantry (NGO)',
    reason: 'Temperature control concern',
    notes: 'Insulated lid was loose upon arrival; awaiting admin review.',
    status: 'OPEN',
  },
];

export const MOCK_AUDIT_LOGS = [
  {
    id: 'aud-1',
    action: 'NGO_VERIFIED',
    target: 'Central Ward Relief Trust',
    admin: 'System Administrator',
    timestamp: 'Today, 10:14 AM',
  },
  {
    id: 'aud-2',
    action: 'ACCOUNT_SUSPENDED',
    target: 'unverified-caterer@example.com',
    admin: 'System Administrator',
    timestamp: 'Yesterday, 06:42 PM',
  },
];
