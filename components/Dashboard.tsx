import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  aiAnalysis: string | null;
  loadingAi: boolean;
  onRefreshAi: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, aiAnalysis, loadingAi, onRefreshAi }) => {
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense,
      count: transactions.length
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    // Group by day (last 7 days logic simplified for demo)
    const data = [
      { name: 'Entrées', value: stats.income, color: '#10b981' }, // emerald-500
      { name: 'Sorties', value: stats.expense, color: '#f43f5e' }, // rose-500
    ];
    return data;
  }, [stats]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('fr-DZ') + ' DA';
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Solde Actuel</p>
            <h3 className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
              {formatCurrency(stats.balance)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Revenus Totaux</p>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.income)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-full">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Dépenses Totales</p>
            <h3 className="text-2xl font-bold text-slate-800">{formatCurrency(stats.expense)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Aperçu Financier</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value.toLocaleString('fr-DZ')} DA`, 'Montant']}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl shadow-lg text-white flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
             <Activity size={120} />
          </div>
          
          <div className="flex justify-between items-start mb-4 z-10">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="bg-indigo-500/30 p-1 rounded">AI</span>
                Comptable Intelligent
              </h3>
              <p className="text-indigo-200 text-sm">Analyse Gemini pour Ivision</p>
            </div>
            <button 
              onClick={onRefreshAi}
              disabled={loadingAi}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
            >
              {loadingAi ? 'Analyse...' : 'Actualiser'}
            </button>
          </div>

          <div className="flex-1 z-10">
            {aiAnalysis ? (
              <div className="prose prose-invert prose-sm">
                <p className="whitespace-pre-line leading-relaxed text-indigo-100">
                  {aiAnalysis}
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-indigo-300 opacity-60">
                <Activity size={32} className="mb-2" />
                <p>En attente d'analyse...</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;