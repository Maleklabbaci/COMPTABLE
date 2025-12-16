import { Transaction } from '../types';

// Service disabled as per request to remove AI features.
export const analyzeFinancials = async (transactions: Transaction[]): Promise<string> => {
  return "Analyse désactivée.";
};