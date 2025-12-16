export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  clientName?: string; // Only for income
  date: string; // ISO string
  timestamp: number;
}

export const SERVICES = [
  { id: 'reels_video', name: 'Réels & Vidéos', icon: 'Video', price: 40000 },
  { id: 'graphic_design', name: 'Graphic Design', icon: 'Palette', price: 25000 },
  { id: 'sponsors', name: 'Sponsors & Suivis', icon: 'Megaphone', price: 60000 },
  { id: 'audit', name: 'Audit & Stratégie', icon: 'ClipboardCheck', price: 35000 },
  { id: 'website', name: 'Website & Store Site', icon: 'Globe', price: 150000 },
];

export const EXPENSE_CATEGORIES = [
  { id: 'material', name: 'Matériel', icon: 'Monitor' },
  { id: 'software', name: 'Logiciels', icon: 'Cpu' },
  { id: 'rent', name: 'Loyer', icon: 'Home' },
  { id: 'marketing', name: 'Marketing', icon: 'Target' },
  { id: 'freelance', name: 'Freelancers', icon: 'Users' },
  { id: 'other', name: 'Autre', icon: 'Package' }
];