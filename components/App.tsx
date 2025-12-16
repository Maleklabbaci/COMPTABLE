import React, { useState, useEffect } from 'react';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Dashboard from './components/Dashboard';
import NotificationToast from './components/NotificationToast'; // Import Notification
import { Transaction } from './types';
import { getTransactions, saveTransaction } from './services/storageService';
import { LayoutDashboard, PlusCircle, History, Eye, Search, ArrowRight, ChevronDown, LayoutGrid } from 'lucide-react';

enum View {
  DASHBOARD = 'DASHBOARD',
  NEW_TRANSACTION = 'NEW_TRANSACTION',
  HISTORY = 'HISTORY'
}

type NotificationState = {
  message: string;
  type: 'success' | 'error';
} | null;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.NEW_TRANSACTION);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notification, setNotification] = useState<NotificationState>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(true);

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  
  // State to trigger animation on dashboard
  const [highlightDashboard, setHighlightDashboard] = useState(false);

  // Helper to show notifications
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  // Initial load
  useEffect(() => {
    // 1. Load Transactions
    const loadedTransactions = getTransactions();
    setTransactions(loadedTransactions);

    // 2. Manage Splash Screen Logic
    // Wait 2.5s before fading out
    const fadeTimer = setTimeout(() => {
      setSplashFading(true);
    }, 2500);

    // Remove from DOM after transition (2.5s + 0.7s transition)
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const handleTransactionAdded = async (t: Transaction) => {
    // 1. Save Transaction locally
    const updated = saveTransaction(t);
    setTransactions(updated);
    
    // 2. Move to Dashboard immediately for better UX
    setCurrentView(View.DASHBOARD);
    
    // 3. Trigger Dashboard Animation
    setHighlightDashboard(true);
    setTimeout(() => setHighlightDashboard(false), 2000); // Reset animation state after 2s

    // 4. Notify user
    showNotification("Transaction enregistrée avec succès.", "success");
  };

  const handleDelete = (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('ivision_transactions_v1', JSON.stringify(updated));
    showNotification("Transaction supprimée.", "success");
  };

  // Filter transactions for History view
  const filteredTransactions = transactions.filter(t => 
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.clientName && t.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      {/* Splash Screen Overlay */}
      {showSplash && (
        <div 
          className={`fixed inset-0 z-[9999] bg-white w-screen h-screen flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
            splashFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          <div className="flex flex-col items-center p-6 text-center animate-slide-down">
            {/* Logo Icon */}
            <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-900/20 mb-6 rotate-3">
               <Eye size={48} className="text-white" strokeWidth={2} />
            </div>
            
            {/* Brand Name */}
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-2 text-center leading-none">
              IVISION <span className="text-blue-600 block md:inline">AGENCY</span>
            </h1>
            
            {/* Loading Indicator */}
            <div className="mt-8 flex gap-3">
              <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-3 h-3 bg-slate-900 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      )}

      {/* Main Application */}
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
        <aside className="hidden md:flex w-80 bg-[#0F172A] text-white flex-shrink-0 flex-col sticky top-0 h-screen z-50 shadow-2xl shadow-slate-900/50 border-r border-white/5">
          <div className="p-8 flex items-center gap-4 mb-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative bg-[#1E293B] p-3 rounded-2xl shadow-inner border border-white/10 group-hover:scale-105 transition-transform">
                <Eye size={28} className="text-white" strokeWidth={2} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">IVISION</h1>
              <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mt-1 uppercase">Books</p>
            </div>
          </div>
          
          <nav className="flex-1 px-6 space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Menu Principal</div>
            
            {/* Card Button: Nouvelle Opération */}
            <button
              onClick={() => setCurrentView(View.NEW_TRANSACTION)}
              className={`w-full group relative p-4 rounded-[1.5rem] border transition-all duration-300 text-left overflow-hidden ${
                currentView === View.NEW_TRANSACTION 
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-600 border-transparent shadow-xl shadow-indigo-900/50 scale-[1.02]' 
                  : 'bg-[#1E293B] border-white/5 hover:border-white/10 hover:bg-[#273548]'
              }`}
            >
              {/* Active Glow Effect */}
              {currentView === View.NEW_TRANSACTION && (
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              )}

              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                  currentView === View.NEW_TRANSACTION ? 'bg-white/20 text-white shadow-inner' : 'bg-[#0F172A] text-indigo-400 group-hover:text-white group-hover:bg-indigo-500/20'
                }`}>
                  <PlusCircle size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <div className={`font-bold text-sm mb-0.5 ${currentView === View.NEW_TRANSACTION ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                    Nouvelle Opération
                  </div>
                  <div className={`text-xs font-medium ${currentView === View.NEW_TRANSACTION ? 'text-indigo-100' : 'text-slate-500'}`}>
                    Saisir encaissement ou dépense
                  </div>
                </div>
                {currentView === View.NEW_TRANSACTION && <ArrowRight size={16} className="text-white/70" />}
              </div>
            </button>

            {/* Card Button: Tableau de Bord */}
            <button
              onClick={() => setCurrentView(View.DASHBOARD)}
              className={`w-full group relative p-4 rounded-[1.5rem] border transition-all duration-300 text-left overflow-hidden ${
                currentView === View.DASHBOARD 
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-600 border-transparent shadow-xl shadow-indigo-900/50 scale-[1.02]' 
                  : 'bg-[#1E293B] border-white/5 hover:border-white/10 hover:bg-[#273548]'
              }`}
            >
              {/* Active Glow Effect */}
              {currentView === View.DASHBOARD && (
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              )}

              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                  currentView === View.DASHBOARD ? 'bg-white/20 text-white shadow-inner' : 'bg-[#0F172A] text-slate-400 group-hover:text-white group-hover:bg-indigo-500/20'
                }`}>
                  <LayoutDashboard size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <div className={`font-bold text-sm mb-0.5 ${currentView === View.DASHBOARD ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                    Tableau de Bord
                  </div>
                  <div className={`text-xs font-medium ${currentView === View.DASHBOARD ? 'text-indigo-100' : 'text-slate-500'}`}>
                    Statistiques & solde global
                  </div>
                </div>
                {currentView === View.DASHBOARD && <ArrowRight size={16} className="text-white/70" />}
              </div>
            </button>

            {/* Card Button: Historique */}
            <button
              onClick={() => setCurrentView(View.HISTORY)}
              className={`w-full group relative p-4 rounded-[1.5rem] border transition-all duration-300 text-left overflow-hidden ${
                currentView === View.HISTORY 
                  ? 'bg-gradient-to-br from-indigo-600 to-violet-600 border-transparent shadow-xl shadow-indigo-900/50 scale-[1.02]' 
                  : 'bg-[#1E293B] border-white/5 hover:border-white/10 hover:bg-[#273548]'
              }`}
            >
              {/* Active Glow Effect */}
              {currentView === View.HISTORY && (
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              )}

              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                  currentView === View.HISTORY ? 'bg-white/20 text-white shadow-inner' : 'bg-[#0F172A] text-slate-400 group-hover:text-white group-hover:bg-indigo-500/20'
                }`}>
                  <History size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <div className={`font-bold text-sm mb-0.5 ${currentView === View.HISTORY ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                    Historique
                  </div>
                  <div className={`text-xs font-medium ${currentView === View.HISTORY ? 'text-indigo-100' : 'text-slate-500'}`}>
                    Journal des transactions
                  </div>
                </div>
                {currentView === View.HISTORY && <ArrowRight size={16} className="text-white/70" />}
              </div>
            </button>
          </nav>

          <div className="p-6">
            <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/5 flex items-center gap-3 shadow-lg">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                IV
              </div>
              <div>
                <div className="text-sm font-bold text-white">Agence Ivision</div>
                <div className="text-xs text-indigo-400 font-medium">Mode Comptable</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-6xl mx-auto h-screen relative scroll-smooth">
          
          {/* Mobile Top Header - Sticky */}
          <header className="md:hidden flex justify-between items-center sticky top-0 pt-4 pb-4 px-1 z-30 transition-all bg-[#F2F4F8]/95 backdrop-blur-xl -mx-4 px-5 border-b border-slate-200/50">
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
                  highlightNewData={highlightDashboard}
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
                
                {/* Search Bar - Sticky on Mobile */}
                <div className="sticky md:static top-[4.5rem] md:top-0 z-20 bg-[#F2F4F8] md:bg-transparent pb-4 pt-2 md:py-0 -mx-4 px-4 md:mx-0 md:px-0 mb-4 md:mb-6">
                   <div className="relative">
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                       <Search size={20} />
                     </div>
                     <input 
                       type="text" 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       placeholder="Rechercher une transaction..." 
                       className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl shadow-sm border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 font-medium transition-shadow focus:shadow-md"
                     />
                   </div>
                </div>

                <TransactionList transactions={filteredTransactions} onDelete={handleDelete} />
              </div>
            )}
          </div>
        </main>

        {/* Show Floating Menu Button if Nav is Hidden */}
        {!isMobileNavOpen && (
          <button 
            onClick={() => setIsMobileNavOpen(true)}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#0F172A] text-white rounded-full shadow-2xl shadow-slate-900/40 z-50 flex items-center justify-center active:scale-90 transition-transform animate-slide-up"
          >
            <LayoutGrid size={24} />
          </button>
        )}

        {/* Modern Floating Bottom Navigation Bar */}
        {isMobileNavOpen && (
          <div className="md:hidden fixed bottom-6 left-6 right-6 z-40 animate-slide-up">
             {/* Minimize Handle Button */}
             <div className="absolute -top-12 right-0 flex justify-end pb-2">
               <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-slate-500 flex items-center justify-center border border-white/50 active:scale-90 transition-transform"
               >
                  <ChevronDown size={20} />
               </button>
             </div>
             
             <nav className="h-[4.5rem] bg-[#0F172A]/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-900/40 border border-white/10 ring-1 ring-black/5">
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
        )}

      </div>
    </>
  );
};

export default App;