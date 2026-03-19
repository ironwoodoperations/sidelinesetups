export interface Event {
  id: string;
  name: string;
  eventType: 'tournament' | 'league';
  sport: 'softball' | 'baseball' | 'soccer';
  startDate: string;
  endDate: string;
  parkIds: string[];
  packageIds: string[];
  isActive: boolean;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  perGameUsd: number;
  perDayUsd: number;
  fullWeekendUsd: number;
  baseItems: { equipmentId: string; qty: number }[];
  addOnIds: string[];
  features: string[];
  showForTournament: boolean;
  showForLeague: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface Park {
  id: string;
  name: string;
  parkType: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
}

export interface Field {
  id: string;
  parkId: string;
  name: string;
  imageUrl: string;
  maxLeagueSpots: number;
}

export interface Spot {
  id: string;
  fieldId: string;
  label: string;
  x: number;
  y: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'tent' | 'chair' | 'cooler' | 'sidewall' | 'fan' | 'lighting' | 'audio' | 'misc';
  totalQty: number;
  availableQty: number;
  rentedQty: number;
  maintenanceQty: number;
  damagedQty: number;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  equipmentId: string;
  perGameUsd: number;
  perDayUsd: number;
  fullWeekendUsd: number;
  isActive: boolean;
  displayOrder: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
}

export interface BookingFormData {
  packageId: string;
  packageMode: 'per_game' | 'day' | 'weekend';
  addOns: { addOnId: string; qty: number }[];
  eventId: string;
  date: string;
  gameTimes: string[];
  parkId: string;
  fieldId: string;
  spotId: string;
  fullName: string;
  email: string;
  phone: string;
  teamName: string;
  coachName: string;
  notes: string;
  agreedToTerms: boolean;
  smsConsent: boolean;
  discountCode: string;
}

export type BookingStatus = 'pending' | 'paid' | 'photo_uploaded' | 'setup' | 'checked_in' | 'leaving' | 'picked_up' | 'closed' | 'cancelled';
