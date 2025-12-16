import { Transaction } from '../types';

const STORAGE_KEY = 'ivision_transactions_v1';
const ANALYSIS_KEY = 'ivision_ai_analysis_v1';

export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveTransaction = (transaction: Transaction): Transaction[] => {
  const current = getTransactions();
  const updated = [transaction, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const clearTransactions = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ANALYSIS_KEY);
};

// --- AI Analysis Persistence ---

export const getStoredAnalysis = (): string | null => {
  return localStorage.getItem(ANALYSIS_KEY);
};

export const saveStoredAnalysis = (analysis: string): void => {
  localStorage.setItem(ANALYSIS_KEY, analysis);
};