import React, { useState, useEffect } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import { Transaction } from './types';
import { getTransactions, saveTransaction } from './services/storageService';
import { analyzeFinancials } from './services/geminiService';
import { LayoutDashboard, PlusCircle, History, Eye, Menu } from 'lucide-react';

enum View {
  DASHBOARD = 'DASHBOARD',
  NEW_TRANSACTION = 'NEW_TRANSACTION',
  HISTORY = 'HISTORY'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.NEW_TRANSACTION);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Initial load
  useEffect(() => {
    const loaded = getTransactions();
    setTransactions(loaded);
    if(loaded.length > 0) {
      handleRefreshAi(loaded);
    }
  }, []);

  const handleTransactionAdded = (t: Transaction) => {
    const updated = saveTransaction(t);
    setTransactions(updated);
    // Switch to dashboard to see result
    setCurrentView(View.DASHBOARD);
  };

  const handleRefreshAi = async (data: Transaction[] = transactions) => {
    if (data.length === 0) return;
    setLoadingAi(true);
    const analysis = await analyzeFinancials(data);
    setAiAnalysis(analysis);
    setLoadingAi(false);
  };

  const handleDelete = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('ivision_transactions_v1', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#F2F4F8] flex flex-col md:flex-row font-sans text-slate-900 pb-24 md:pb-0">
      
      {/* Desktop Sidebar Navigation (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-shrink-0 flex-col sticky top-0 h-screen z-50">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Eye size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">IVISION</h1>
            <p className="text-xs text-slate-400">Agence & Comptabilité</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setCurrentView(View.NEW_TRANSACTION)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === View.NEW_TRANSACTION 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <PlusCircle size={20} />
            <span className="font-medium">Nouvelle Opération</span>
          </button>

          <button
            onClick={() => setCurrentView(View.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === View.DASHBOARD 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Tableau de Bord</span>
          </button>

          <button
            onClick={() => setCurrentView(View.HISTORY)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === View.HISTORY 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <History size={20} />
            <span className="font-medium">Historique</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-5xl mx-auto h-screen">
        
        {/* Mobile Top Header */}
        <header className="md:hidden mb-6 flex justify-between items-center sticky top-0 bg-[#F2F4F8]/90 backdrop-blur-sm z-30 py-2">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-xl shadow-sm">
              <Eye size={20} className="text-white" />
            </div>
            <div>
               <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">IVISION</h2>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Books</span>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
        </header>

        {/* Dynamic Content */}
        <div className="animate-fade-in h-full flex flex-col">
          {currentView === View.NEW_TRANSACTION && (
            <div className="max-w-xl mx-auto w-full h-full">
              <div className="hidden md:block mb-6">
                <h2 className="text-3xl font-bold text-slate-800">Interface de Paiement</h2>
                <p className="text-slate-500">Enregistrez une vente ou une dépense.</p>
              </div>
              <TransactionForm onTransactionAdded={handleTransactionAdded} />
            </div>
          )}

          {currentView === View.DASHBOARD && (
            <div className="pb-20">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Tableau de Bord</h2>
              </div>
              <Dashboard 
                transactions={transactions} 
                aiAnalysis={aiAnalysis} 
                loadingAi={loadingAi} 
                onRefreshAi={() => handleRefreshAi(transactions)} 
              />
              <div className="mt-8">
                 <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Opérations Récentes</h3>
                 <TransactionList transactions={transactions.slice(0, 5)} />
              </div>
            </div>
          )}

          {currentView === View.HISTORY && (
            <div className="pb-20">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Historique</h2>
              </div>
              <TransactionList transactions={transactions} onDelete={handleDelete} />
            </div>
          )}
        </div>
      </main>

      {/* Modern Floating Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 h-16 bg-slate-900/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-400/30 z-40 border border-white/10">
        <div className="flex justify-around items-center h-full px-2">
          
          <button
            onClick={() => setCurrentView(View.DASHBOARD)}
            className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
              currentView === View.DASHBOARD 
                ? 'bg-white/10 text-white translate-y-[-4px]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={24} strokeWidth={2} />
            {currentView === View.DASHBOARD && <span className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full" />}
          </button>

          <button
            onClick={() => setCurrentView(View.NEW_TRANSACTION)}
            className="relative -top-6 group"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
               currentView === View.NEW_TRANSACTION 
                 ? 'bg-indigo-500 text-white shadow-indigo-500/40 scale-110' 
                 : 'bg-white text-slate-900 shadow-slate-200'
            }`}>
              <PlusCircle size={32} strokeWidth={1.5} className="group-active:scale-90 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => setCurrentView(View.HISTORY)}
            className={`relative flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
              currentView === View.HISTORY 
                ? 'bg-white/10 text-white translate-y-[-4px]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History size={24} strokeWidth={2} />
            {currentView === View.HISTORY && <span className="absolute -bottom-1 w-1 h-1 bg-indigo-400 rounded-full" />}
          </button>
        </div>
      </nav>

    </div>
  );
};

export default App;