import { GoogleGenAI } from "@google/genai";
import { Transaction, TransactionType } from '../types';

const getAiInstance = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing from environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeFinancials = async (transactions: Transaction[]): Promise<string> => {
  const ai = getAiInstance();
  if (!ai) return "Clé API manquante. Impossible de générer l'analyse.";

  // Prepare a summary for the prompt to save tokens and improve relevance
  const income = transactions.filter(t => t.type === TransactionType.INCOME);
  const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
  
  const totalIncome = income.reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = expenses.reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  // We take the last 15 transactions for detailed context
  const recentHistory = transactions.slice(0, 15).map(t => 
    `- ${t.date.split('T')[0]}: ${t.type} de ${t.amount} DA (${t.category})`
  ).join('\n');

  const prompt = `
    Agis en tant qu'expert comptable senior pour l'agence "Ivision".
    Voici les données financières actuelles (Devise: Dinar Algérien - DA):
    - Total Revenus: ${totalIncome} DA
    - Total Dépenses: ${totalExpenses} DA
    - Solde: ${balance} DA
    - Nombre de transactions: ${transactions.length}

    Historique récent:
    ${recentHistory}

    Fournis une analyse concise en français (max 100 mots).
    1. Commente la santé financière actuelle.
    2. Donne un conseil stratégique pour améliorer la rentabilité.
    Utilise un ton professionnel et encourageant.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Aucune analyse générée.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Le service d'analyse est temporairement indisponible.";
  }
};