import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieChartIcon, Moon, Sun } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  highlightNewData?: boolean;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#f59e0b', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ transactions, highlightNewData }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Theme Constants
  const theme = {
    cardBg: darkMode ? 'bg-[#1e293b]' : 'bg-white',
    cardBorder: darkMode ? 'border-slate-700/50' : 'border-slate-100',
    textMain: darkMode ? 'text-white' : 'text-slate-800',
    textSub: darkMode ? 'text-slate-400' : 'text-slate-400', // Keep subtext similar
    iconBg: (color: string) => darkMode ? `bg-opacity-10 bg-${color}-500` : `bg-${color}-50`,
    chartGrid: darkMode ? '#334155' : '#f1f5f9',
    axisText: darkMode ? '#94a3b8' : '#94a3b8',
    tooltipBg: darkMode ? 'bg-[#0f172a]' : 'bg-white',
    tooltipBorder: darkMode ? 'border-slate-700' : 'border-slate-100',
    tooltipText: darkMode ? 'text-slate-200' : 'text-slate-800',
  };
  
  // 1. Basic Stats
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

  // 2. Monthly Trend Data (Area Chart)
  const monthlyData = useMemo(() => {
    const grouped: Record<string, { name: string; income: number; expense: number; sortDate: number }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`; // Unique key per month
      const name = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }); // Display name
      
      if (!grouped[key]) {
        grouped[key] = { name, income: 0, expense: 0, sortDate: date.getTime() };
      }
      
      if (t.type === TransactionType.INCOME) {
        grouped[key].income += t.amount;
      } else {
        grouped[key].expense += t.amount;
      }
    });

    // Convert to array and sort chronologically
    return Object.values(grouped).sort((a, b) => a.sortDate - b.sortDate);
  }, [transactions]);

  // 3. Expense Category Breakdown (Pie Chart)
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const grouped: Record<string, number> = {};

    expenses.forEach(t => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort highest expenses first
  }, [transactions]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('fr-DZ');
  };

  // --- Custom Tooltips ---

  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${theme.tooltipBg} p-4 border ${theme.tooltipBorder} shadow-2xl rounded-2xl ring-1 ring-black/5 min-w-[180px]`}>
          <p className={`font-bold ${theme.tooltipText} mb-3 text-sm border-b ${darkMode ? 'border-slate-700' : 'border-slate-50'} pb-2`}>{label}</p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full ring-2 ring-white/10 shadow-sm" style={{ backgroundColor: entry.color }} />
                   <span className="text-slate-500 font-medium capitalize">{entry.name}</span>
                </div>
                <span className={`font-bold font-mono ${entry.name === 'Entrées' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {formatCurrency(entry.value)} <span className="text-[10px] opacity-60">DA</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const total = stats.expense;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';

      return (
        <div className={`${theme.tooltipBg} p-4 border ${theme.tooltipBorder} shadow-2xl rounded-2xl ring-1 ring-black/5 min-w-[160px]`}>
          <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: data.payload.fill || data.fill || COLORS[0] }}></div>
            <p className={`font-bold ${theme.tooltipText} text-sm`}>{data.name}</p>
          </div>
          <div className="space-y-2">
             <div className="flex justify-between items-baseline gap-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Montant</span>
                <span className={`font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'} font-mono text-sm`}>{formatCurrency(data.value)} <span className="text-[10px] text-slate-500">DA</span></span>
             </div>
             <div className="flex justify-between items-center gap-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Part</span>
                <span className="font-bold text-xs text-white bg-slate-900 px-2 py-1 rounded-lg shadow-sm">{percentage}%</span>
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Theme Toggle & Header Controls */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            darkMode 
              ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-lg shadow-indigo-900/20' 
              : 'bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50'
          }`}
        >
          {darkMode ? <Moon size={16} /> : <Sun size={16} />}
          <span>{darkMode ? 'Mode Sombre' : 'Mode Clair'}</span>
        </button>
      </div>

      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card - The main KPI to highlight */}
        <div className={`${theme.cardBg} p-6 rounded-3xl shadow-sm border ${theme.cardBorder} flex items-center gap-5 relative overflow-hidden transition-all duration-700 ease-out ${highlightNewData ? 'ring-4 ring-indigo-500/30 scale-[1.02] shadow-xl shadow-indigo-200' : ''}`}>
          <div className="absolute right-0 top-0 p-4 opacity-5">
            <Wallet size={100} className={darkMode ? 'text-white' : 'text-black'} />
          </div>
          <div className={`p-4 rounded-2xl ${darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'} transition-transform duration-700 ${highlightNewData ? 'scale-110 rotate-3' : ''}`}>
            <Wallet size={28} />
          </div>
          <div className="relative z-10">
            <p className={`${theme.textSub} text-xs font-bold uppercase tracking-wider mb-1`}>Solde Net</p>
            <h3 className={`text-2xl font-black ${stats.balance >= 0 ? theme.textMain : 'text-rose-500'} transition-all duration-500`}>
              {formatCurrency(stats.balance)} <span className="text-sm font-bold text-slate-500">DA</span>
            </h3>
          </div>
        </div>

        {/* Income Card */}
        <div className={`${theme.cardBg} p-6 rounded-3xl shadow-sm border ${theme.cardBorder} flex items-center gap-5 transition-all duration-700 ease-out ${highlightNewData ? 'ring-4 ring-emerald-500/30 scale-[1.02] shadow-xl shadow-emerald-200 delay-75' : ''}`}>
          <div className={`p-4 rounded-2xl ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'} transition-transform duration-700 ${highlightNewData ? 'scale-110' : ''}`}>
            <TrendingUp size={28} />
          </div>
          <div>
            <p className={`${theme.textSub} text-xs font-bold uppercase tracking-wider mb-1`}>Revenus</p>
            <h3 className={`text-2xl font-black ${theme.textMain}`}>
              {formatCurrency(stats.income)} <span className="text-sm font-bold text-slate-500">DA</span>
            </h3>
          </div>
        </div>

        {/* Expense Card */}
        <div className={`${theme.cardBg} p-6 rounded-3xl shadow-sm border ${theme.cardBorder} flex items-center gap-5 transition-all duration-700 ease-out ${highlightNewData ? 'ring-4 ring-rose-500/30 scale-[1.02] shadow-xl shadow-rose-200 delay-100' : ''}`}>
          <div className={`p-4 rounded-2xl ${darkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600'} transition-transform duration-700 ${highlightNewData ? 'scale-110' : ''}`}>
            <TrendingDown size={28} />
          </div>
          <div>
            <p className={`${theme.textSub} text-xs font-bold uppercase tracking-wider mb-1`}>Dépenses</p>
            <h3 className={`text-2xl font-black ${theme.textMain}`}>
              {formatCurrency(stats.expense)} <span className="text-sm font-bold text-slate-500">DA</span>
            </h3>
          </div>
        </div>
      </div>

      {/* --- Monthly Trend Chart --- */}
      <div className={`${theme.cardBg} p-6 md:p-8 rounded-3xl shadow-sm border ${theme.cardBorder} transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className={`text-lg font-bold ${theme.textMain}`}>Évolution Mensuelle</h3>
            <p className={`${theme.textSub} text-sm`}>Comparatif Entrées vs Sorties</p>
          </div>
        </div>
        <div className="h-72 w-full">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.chartGrid} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: theme.axisText, fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: theme.axisText, fontSize: 12 }}
                  tickFormatter={(val) => `${val / 1000}k`} 
                />
                <Tooltip content={<CustomAreaTooltip />} cursor={{ stroke: theme.chartGrid, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  name="Entrées"
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  name="Sorties"
                  stroke="#f43f5e" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <p>Pas assez de données pour afficher le graphique</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* --- Expense Category Breakdown --- */}
        <div className={`${theme.cardBg} p-6 md:p-8 rounded-3xl shadow-sm border ${theme.cardBorder} flex flex-col transition-colors duration-300`}>
          <div className="flex items-center gap-3 mb-6">
             <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
               <PieChartIcon size={20} />
             </div>
             <div>
               <h3 className={`text-lg font-bold ${theme.textMain}`}>Répartition des Dépenses</h3>
               <p className={`${theme.textSub} text-sm`}>Par catégorie</p>
             </div>
          </div>
          
          <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: darkMode ? '#94a3b8' : '#475569' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex flex-col items-center text-slate-400">
                 <div className={`w-20 h-20 rounded-full border-4 ${darkMode ? 'border-slate-700' : 'border-slate-100'} mb-2`}></div>
                 <p className="text-sm">Aucune dépense enregistrée</p>
               </div>
            )}
            {/* Center Text for Donut */}
            {categoryData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pr-24 lg:pr-28">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total</span>
                <span className={`text-xl font-black ${theme.textMain}`}>{formatCurrency(stats.expense)}</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;