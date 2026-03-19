import { Event, Package, Park, Field, Spot, Equipment, AddOn, FaqItem } from '@/types';
import fieldDiagram1 from '@/assets/field-diagram-1.jpg';
import fieldDiagram2 from '@/assets/field-diagram-2.jpg';

export const mockEvents: Event[] = [
  {
    id: 'evt-1',
    name: 'East Texas Spring Showcase',
    eventType: 'tournament',
    sport: 'softball',
    startDate: '2026-04-04',
    endDate: '2026-04-05',
    parkIds: ['park-1'],
    packageIds: ['pkg-1', 'pkg-2', 'pkg-3'],
    isActive: true,
  },
  {
    id: 'evt-2',
    name: 'Tyler Youth Baseball Classic',
    eventType: 'tournament',
    sport: 'baseball',
    startDate: '2026-04-11',
    endDate: '2026-04-12',
    parkIds: ['park-1'],
    packageIds: ['pkg-1', 'pkg-2', 'pkg-3'],
    isActive: true,
  },
  {
    id: 'evt-3',
    name: 'Spring Soccer League',
    eventType: 'league',
    sport: 'soccer',
    startDate: '2026-03-15',
    endDate: '2026-05-30',
    parkIds: ['park-2'],
    packageIds: ['pkg-1', 'pkg-2'],
    isActive: true,
  },
  {
    id: 'evt-4',
    name: 'Memorial Day Softball Bash',
    eventType: 'tournament',
    sport: 'softball',
    startDate: '2026-05-23',
    endDate: '2026-05-25',
    parkIds: ['park-1', 'park-2'],
    packageIds: ['pkg-1', 'pkg-2', 'pkg-3'],
    isActive: true,
  },
  {
    id: 'evt-5',
    name: 'Summer Baseball League',
    eventType: 'league',
    sport: 'baseball',
    startDate: '2026-06-01',
    endDate: '2026-07-31',
    parkIds: ['park-1'],
    packageIds: ['pkg-1', 'pkg-2'],
    isActive: true,
  },
];

export const mockPackages: Package[] = [
  {
    id: 'pkg-1',
    name: 'The Essentials',
    description: '10×10 shade tent with 4 chairs — perfect for a family who just wants to stay cool.',
    perGameUsd: 35,
    perDayUsd: 65,
    fullWeekendUsd: 110,
    baseItems: [
      { equipmentId: 'eq-1', qty: 1 },
      { equipmentId: 'eq-2', qty: 4 },
    ],
    addOnIds: ['ao-1', 'ao-2', 'ao-3'],
    features: ['10×10 pop-up shade tent', '4 padded chairs', 'Setup & teardown included'],
    showForTournament: true,
    showForLeague: true,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'pkg-2',
    name: 'The Comfort Zone',
    description: 'Everything in Essentials plus a cooler with ice and a misting fan to beat the Texas heat.',
    perGameUsd: 55,
    perDayUsd: 95,
    fullWeekendUsd: 165,
    baseItems: [
      { equipmentId: 'eq-1', qty: 1 },
      { equipmentId: 'eq-2', qty: 6 },
      { equipmentId: 'eq-3', qty: 1 },
      { equipmentId: 'eq-5', qty: 1 },
    ],
    addOnIds: ['ao-1', 'ao-2', 'ao-3', 'ao-4'],
    features: [
      '10×10 pop-up shade tent',
      '6 padded chairs',
      'Cooler with ice',
      'Misting fan',
      'Setup & teardown included',
    ],
    showForTournament: true,
    showForLeague: true,
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'pkg-3',
    name: 'The VIP Suite',
    description: 'The full sideline experience — tent with sidewalls, 8 chairs, cooler, two fans, and a Bluetooth speaker.',
    perGameUsd: 85,
    perDayUsd: 145,
    fullWeekendUsd: 250,
    baseItems: [
      { equipmentId: 'eq-1', qty: 1 },
      { equipmentId: 'eq-2', qty: 8 },
      { equipmentId: 'eq-3', qty: 1 },
      { equipmentId: 'eq-4', qty: 2 },
      { equipmentId: 'eq-5', qty: 2 },
      { equipmentId: 'eq-7', qty: 1 },
    ],
    addOnIds: ['ao-1', 'ao-2', 'ao-3', 'ao-4'],
    features: [
      '10×10 pop-up shade tent',
      '2 sidewalls for extra shade',
      '8 padded chairs',
      'Cooler with ice',
      '2 misting fans',
      'Bluetooth speaker',
      'Setup & teardown included',
    ],
    showForTournament: true,
    showForLeague: false,
    displayOrder: 3,
    isActive: true,
  },
];

export const mockParks: Park[] = [
  {
    id: 'park-1',
    name: 'Lindsey Park',
    parkType: 'tournament',
    streetAddress: '12225 County Rd 167',
    city: 'Tyler',
    state: 'TX',
    zip: '75703',
    notes: 'Main tournament complex — 8 fields',
  },
  {
    id: 'park-2',
    name: 'Faulkner Park',
    parkType: 'league',
    streetAddress: '410 W Cumberland Rd',
    city: 'Tyler',
    state: 'TX',
    zip: '75703',
    notes: 'League games on weeknights',
  },
];

export const mockFields: Field[] = [
  { id: 'field-1', parkId: 'park-1', name: 'Field 1', imageUrl: '', maxLeagueSpots: 4 },
  { id: 'field-2', parkId: 'park-1', name: 'Field 2', imageUrl: '', maxLeagueSpots: 4 },
  { id: 'field-3', parkId: 'park-1', name: 'Field 3', imageUrl: '', maxLeagueSpots: 4 },
  { id: 'field-4', parkId: 'park-2', name: 'Field A', imageUrl: '', maxLeagueSpots: 2 },
];

export const mockSpots: Spot[] = [
  { id: 'spot-1', fieldId: 'field-1', label: 'A1', x: 20, y: 25 },
  { id: 'spot-2', fieldId: 'field-1', label: 'A2', x: 50, y: 25 },
  { id: 'spot-3', fieldId: 'field-1', label: 'A3', x: 80, y: 25 },
  { id: 'spot-4', fieldId: 'field-1', label: 'B1', x: 20, y: 75 },
  { id: 'spot-5', fieldId: 'field-1', label: 'B2', x: 50, y: 75 },
  { id: 'spot-6', fieldId: 'field-1', label: 'B3', x: 80, y: 75 },
  { id: 'spot-7', fieldId: 'field-2', label: 'A1', x: 25, y: 30 },
  { id: 'spot-8', fieldId: 'field-2', label: 'A2', x: 75, y: 30 },
  { id: 'spot-9', fieldId: 'field-2', label: 'B1', x: 25, y: 70 },
  { id: 'spot-10', fieldId: 'field-2', label: 'B2', x: 75, y: 70 },
  { id: 'spot-11', fieldId: 'field-3', label: '1', x: 30, y: 50 },
  { id: 'spot-12', fieldId: 'field-3', label: '2', x: 70, y: 50 },
  { id: 'spot-13', fieldId: 'field-4', label: 'L1', x: 35, y: 40 },
  { id: 'spot-14', fieldId: 'field-4', label: 'L2', x: 65, y: 60 },
];

export const mockEquipment: Equipment[] = [
  { id: 'eq-1', name: '10×10 Pop-Up Tent', type: 'tent', totalQty: 20, availableQty: 14, rentedQty: 5, maintenanceQty: 1, damagedQty: 0 },
  { id: 'eq-2', name: 'Padded Folding Chair', type: 'chair', totalQty: 120, availableQty: 88, rentedQty: 30, maintenanceQty: 2, damagedQty: 0 },
  { id: 'eq-3', name: '54-Qt Cooler with Ice', type: 'cooler', totalQty: 15, availableQty: 10, rentedQty: 4, maintenanceQty: 1, damagedQty: 0 },
  { id: 'eq-4', name: 'Sidewall Panel', type: 'sidewall', totalQty: 30, availableQty: 22, rentedQty: 8, maintenanceQty: 0, damagedQty: 0 },
  { id: 'eq-5', name: 'Misting Fan', type: 'fan', totalQty: 12, availableQty: 8, rentedQty: 3, maintenanceQty: 1, damagedQty: 0 },
  { id: 'eq-6', name: 'LED Light Strip', type: 'lighting', totalQty: 10, availableQty: 8, rentedQty: 2, maintenanceQty: 0, damagedQty: 0 },
  { id: 'eq-7', name: 'Bluetooth Speaker', type: 'audio', totalQty: 8, availableQty: 6, rentedQty: 2, maintenanceQty: 0, damagedQty: 0 },
];

export const mockAddOns: AddOn[] = [
  { id: 'ao-1', name: 'Extra Chair', description: 'Additional padded folding chair', equipmentId: 'eq-2', perGameUsd: 5, perDayUsd: 8, fullWeekendUsd: 12, isActive: true, displayOrder: 1 },
  { id: 'ao-2', name: 'Sidewall', description: 'Add a sidewall panel for extra shade or wind block', equipmentId: 'eq-4', perGameUsd: 8, perDayUsd: 12, fullWeekendUsd: 18, isActive: true, displayOrder: 2 },
  { id: 'ao-3', name: 'LED Lights', description: 'LED light strip for evening games', equipmentId: 'eq-6', perGameUsd: 10, perDayUsd: 15, fullWeekendUsd: 22, isActive: true, displayOrder: 3 },
  { id: 'ao-4', name: 'Bluetooth Speaker', description: 'Portable speaker with Bluetooth', equipmentId: 'eq-7', perGameUsd: 10, perDayUsd: 15, fullWeekendUsd: 22, isActive: true, displayOrder: 4 },
];

export const mockFaqItems: FaqItem[] = [
  { id: 'faq-1', question: 'How does Sideline Setups work?', answer: 'Just book your package online, pick your spot, and show up on game day. Our crew arrives early, sets up your tent, chairs, cooler, and fans. When you\'re done, we tear it all down. You literally just walk away!', displayOrder: 1, isActive: true },
  { id: 'faq-2', question: 'What if it rains?', answer: 'Our tents are waterproof and rated for moderate wind. If there\'s severe weather, we\'ll coordinate with you. We also offer sidewalls as add-ons for extra protection.', displayOrder: 2, isActive: true },
  { id: 'faq-3', question: 'Can I move to a different spot?', answer: 'Once booked, your spot is reserved. If you need to change spots, reach out to us and we\'ll accommodate if availability allows — no guarantees, but we try!', displayOrder: 3, isActive: true },
  { id: 'faq-4', question: 'Do you serve areas outside East Texas?', answer: 'Currently we focus on Tyler, Longview, and surrounding East Texas communities. We\'re expanding — contact us if you want Sideline Setups at your park!', displayOrder: 4, isActive: true },
  { id: 'faq-5', question: 'What\'s included in the cooler?', answer: 'Packages with a cooler include a 54-quart cooler filled with ice. You bring your own drinks and snacks — we keep \'em cold!', displayOrder: 5, isActive: true },
  { id: 'faq-6', question: 'How far in advance should I book?', answer: 'We recommend booking at least 48 hours in advance for the best spot selection. Same-day bookings are available if equipment is available.', displayOrder: 6, isActive: true },
  { id: 'faq-7', question: 'Can I cancel my booking?', answer: 'Yes! Cancellations made 24+ hours before your event receive a full refund. Cancellations within 24 hours are subject to a 50% fee.', displayOrder: 7, isActive: true },
];

export const takenSpotIds = ['spot-4', 'spot-9']; // simulate some spots being taken

export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function getPackagePrice(pkg: Package, mode: 'per_game' | 'day' | 'weekend'): number {
  switch (mode) {
    case 'per_game': return Math.round(pkg.perGameUsd * 100);
    case 'day': return Math.round(pkg.perDayUsd * 100);
    case 'weekend': return Math.round(pkg.fullWeekendUsd * 100);
  }
}

export function getAddOnPrice(addOn: AddOn, mode: 'per_game' | 'day' | 'weekend'): number {
  switch (mode) {
    case 'per_game': return Math.round(addOn.perGameUsd * 100);
    case 'day': return Math.round(addOn.perDayUsd * 100);
    case 'weekend': return Math.round(addOn.fullWeekendUsd * 100);
  }
}
