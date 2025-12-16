import React, { useState, useEffect } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import NotificationToast from './components/NotificationToast'; // Import Notification
import { Transaction } from './types';
import { getTransactions, saveTransaction, getStoredAnalysis, saveStoredAnalysis } from './services/storageService';
import { analyzeFinancials } from './services/geminiService';
import { LayoutDashboard, PlusCircle, History, Eye, Menu, Bell, Search } from 'lucide-react';

enum View {
  DASHBOARD = 'DASHBOARD',
  NEW_TRANSACTION = 'NEW_TRANSACTION',
  HISTORY = 'HISTORY'
}

type NotificationState = {
  message: string;
  type: 'success' | 'error' | 'ai';
} | null;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.NEW_TRANSACTION);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [notification, setNotification] = useState<NotificationState>(null);

  // Helper to show notifications
  const showNotification = (message: string, type: 'success' | 'error' | 'ai') => {
    setNotification({ message, type });
  };

  // Initial load
  useEffect(() => {
    // 1. Load Transactions
    const loadedTransactions = getTransactions();
    setTransactions(loadedTransactions);

    // 2. Load Saved Analysis (Instant load, no waiting)
    const savedAnalysis = getStoredAnalysis();
    if (savedAnalysis) {
      setAiAnalysis(savedAnalysis);
    } else if (loadedTransactions.length > 0) {
      // Only generate if we have data but no saved analysis
      handleRefreshAi(loadedTransactions, false); // false = don't notify on initial silent load
    }
  }, []);

  const handleTransactionAdded = async (t: Transaction) => {
    // 1. Save Transaction locally
    const updated = saveTransaction(t);
    setTransactions(updated);
    
    // 2. Move to Dashboard immediately for better UX
    setCurrentView(View.DASHBOARD);

    // 3. Trigger Automatic AI Analysis
    setLoadingAi(true);
    try {
      // Generate new analysis based on updated data
      const analysis = await analyzeFinancials(updated);
      
      // Update state
      setAiAnalysis(analysis);
      
      // Persist analysis so it is "kept" (garde la)
      saveStoredAnalysis(analysis);
      
      // Notify user
      showNotification("Nouvelle analyse comptable disponible.", "ai");
    } catch (error) {
      console.error("Auto-analysis failed", error);
      // We don't error toast here to avoid annoying user if background sync fails
    } finally {
      setLoadingAi(false);
    }
  };

  const handleRefreshAi = async (data: Transaction[] = transactions, notify: boolean = true) => {
    if (data.length === 0) return;
    setLoadingAi(true);
    try {
      const analysis = await analyzeFinancials(data);
      setAiAnalysis(analysis);
      saveStoredAnalysis(analysis); // Save on manual refresh too
      if (notify) {
        showNotification("Analyse mise à jour avec succès.", "ai");
      }
    } catch (error) {
      console.error(error);
      if (notify) {
        showNotification("Impossible de générer l'analyse.", "error");
      }
    } finally {
      setLoadingAi(false);
    }
  };

  const handleDelete = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('ivision_transactions_v1', JSON.stringify(updated));
    // Optional: Re-analyze after deletion to keep data accurate
    handleRefreshAi(updated, false);
  };

  return (
    <div className="min-h-screen bg-[#F2F4F8] flex flex-col md:flex-row font-sans text-slate-900 pb-24 md:pb-0">
      
      {/* Toast Notification Layer */}
      {notification && (
        <NotificationToast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* Desktop Sidebar Navigation (Hidden on Mobile) */}
      <aside className="hidden md:flex w-72 bg-[#0F172A] text-white flex-shrink-0 flex-col sticky top-0 h-screen z-50 shadow-2xl shadow-slate-900/50">
        <div className="p-8 flex items-center gap-4 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40"></div>
            <div className="relative bg-[#1E293B] p-3 rounded-2xl shadow-inner border border-white/10">
              <Eye size={28} className="text-white" strokeWidth={2} />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none">IVISION</h1>
            <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mt-1 uppercase">Books</p>
          </div>
        </div>
        
        <nav className="flex-1 px-6 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-2">Menu Principal</div>
          
          <button
            onClick={() => setCurrentView(View.NEW_TRANSACTION)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
              currentView === View.NEW_TRANSACTION 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/50 translate-x-1' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <PlusCircle size={22} className={currentView === View.NEW_TRANSACTION ? 'text-indigo-200' : 'group-hover:text-indigo-400 transition-colors'} />
            <span className="font-semibold tracking-wide">Nouvelle Opération</span>
          </button>

          <button
            onClick={() => setCurrentView(View.DASHBOARD)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
              currentView === View.DASHBOARD 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/50 translate-x-1' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <LayoutDashboard size={22} className={currentView === View.DASHBOARD ? 'text-indigo-200' : 'group-hover:text-indigo-400 transition-colors'} />
            <span className="font-semibold tracking-wide">Tableau de Bord</span>
          </button>

          <button
            onClick={() => setCurrentView(View.HISTORY)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
              currentView === View.HISTORY 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-900/50 translate-x-1' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <History size={22} className={currentView === View.HISTORY ? 'text-indigo-200' : 'group-hover:text-indigo-400 transition-colors'} />
            <span className="font-semibold tracking-wide">Historique</span>
          </button>
        </nav>

        <div className="p-6">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
                IV
              </div>
              <div>
                <div className="text-sm font-bold text-white">Agence Ivision</div>
                <div className="text-xs text-slate-400">Admin</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-6xl mx-auto h-screen relative">
        
        {/* Mobile Top Header - Redesigned to match request */}
        <header className="md:hidden mb-8 flex justify-between items-center sticky top-0 pt-4 pb-2 px-1 z-30 transition-all">
          {/* Blur Backdrop */}
          <div className="absolute inset-x-0 top-0 h-full bg-[#F2F4F8]/90 backdrop-blur-xl border-b border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)] -mx-4"></div>
          
          <div className="relative flex items-center gap-3 z-10">
             {/* Logo Icon Box */}
            <div className="h-[2.8rem] w-[2.8rem] bg-[#0F172A] rounded-[0.8rem] flex items-center justify-center text-white shadow-lg shadow-slate-200">
               <Eye size={22} strokeWidth={2.5} />
            </div>
            
             {/* Text Brand */}
            <div className="flex flex-col justify-center gap-[2px]">
               <h2 className="text-[1.35rem] font-black text-[#0F172A] tracking-tight leading-none">IVISION</h2>
               <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.25em] leading-none ml-0.5">BOOKS</span>
            </div>
          </div>
          
          <div className="relative flex items-center gap-2 z-10">
            {/* Profile Avatar */}
            <div className="h-[2.6rem] w-[2.6rem] rounded-full bg-slate-200 border-[3px] border-white shadow-sm overflow-hidden">
               <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="animate-fade-in h-full flex flex-col relative z-0">
          {currentView === View.NEW_TRANSACTION && (
            <div className="max-w-2xl mx-auto w-full h-full">
              <div className="hidden md:flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Paiement</h2>
                  <p className="text-slate-500 mt-2 font-medium">Enregistrez une nouvelle transaction pour l'agence.</p>
                </div>
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg shadow-slate-200 text-indigo-600">
                  <PlusCircle size={32} />
                </div>
              </div>
              <TransactionForm onTransactionAdded={handleTransactionAdded} />
            </div>
          )}

          {currentView === View.DASHBOARD && (
            <div className="pb-20 max-w-5xl mx-auto">
              <div className="hidden md:flex mb-8 justify-between items-center">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Tableau de Bord</h2>
                  <p className="text-slate-500 mt-2 font-medium">Vue d'ensemble de la santé financière.</p>
                </div>
              </div>
              <Dashboard 
                transactions={transactions} 
                aiAnalysis={aiAnalysis} 
                loadingAi={loadingAi} 
                onRefreshAi={() => handleRefreshAi(transactions)} 
              />
              <div className="mt-10">
                 <div className="flex items-center justify-between mb-6 px-1">
                   <h3 className="text-xl font-extrabold text-slate-900">Opérations Récentes</h3>
                   <button 
                     onClick={() => setCurrentView(View.HISTORY)}
                     className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                   >
                     Tout voir
                   </button>
                 </div>
                 <TransactionList transactions={transactions.slice(0, 5)} />
              </div>
            </div>
          )}

          {currentView === View.HISTORY && (
            <div className="pb-20 max-w-4xl mx-auto">
              <div className="hidden md:flex mb-8 justify-between items-center">
                 <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Historique</h2>
                  <p className="text-slate-500 mt-2 font-medium">Toutes les transactions passées.</p>
                </div>
              </div>
              
              {/* Search Bar Placeholder for History */}
              <div className="mb-6 relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                   <Search size={20} />
                 </div>
                 <input 
                   type="text" 
                   placeholder="Rechercher une transaction..." 
                   className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl shadow-sm border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 font-medium"
                 />
              </div>

              <TransactionList transactions={transactions} onDelete={handleDelete} />
            </div>
          )}
        </div>
      </main>

      {/* Modern Floating Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-[4.5rem] bg-[#0F172A]/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-900/40 z-40 border border-white/10 ring-1 ring-black/5">
        <div className="flex justify-between items-center h-full px-6">
          
          <button
            onClick={() => setCurrentView(View.DASHBOARD)}
            className={`relative flex flex-col items-center justify-center w-12 h-12 transition-all duration-300 ${
              currentView === View.DASHBOARD 
                ? 'text-white scale-110' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutDashboard size={26} strokeWidth={currentView === View.DASHBOARD ? 2.5 : 2} />
            {currentView === View.DASHBOARD && <span className="absolute -bottom-2 w-1 h-1 bg-indigo-400 rounded-full animate-pulse" />}
          </button>

          <button
            onClick={() => setCurrentView(View.NEW_TRANSACTION)}
            className="relative -top-8 group"
          >
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
               currentView === View.NEW_TRANSACTION 
                 ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-500/50 scale-110' 
                 : 'bg-white text-slate-900 shadow-slate-200'
            }`}>
              <PlusCircle size={32} strokeWidth={2} className="group-active:scale-90 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => setCurrentView(View.HISTORY)}
            className={`relative flex flex-col items-center justify-center w-12 h-12 transition-all duration-300 ${
              currentView === View.HISTORY 
                ? 'text-white scale-110' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <History size={26} strokeWidth={currentView === View.HISTORY ? 2.5 : 2} />
            {currentView === View.HISTORY && <span className="absolute -bottom-2 w-1 h-1 bg-indigo-400 rounded-full animate-pulse" />}
          </button>
        </div>
      </nav>

    </div>
  );
};

export default App;