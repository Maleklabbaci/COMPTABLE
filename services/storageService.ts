import { Transaction } from '../types';

const STORAGE_KEY = 'ivision_transactions_v1';

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
};