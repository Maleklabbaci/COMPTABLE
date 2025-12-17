import React, { useState, useEffect } from 'react';
import { TransactionType, SERVICES, EXPENSE_CATEGORIES, Transaction } from '../types';
import { 
  ArrowLeft, Check, ChevronRight,
  Palette, Briefcase, 
  Monitor, Cpu, Home, Megaphone, Users, Package,
  Video, ClipboardCheck, Globe, Target,
  X, Plus, Minus
} from 'lucide-react';

// Mapping strings to components for dynamic rendering
const ICON_MAP: Record<string, React.ElementType> = {
  Palette, Briefcase, 
  Monitor, Cpu, Home, Megaphone, Users, Package,
  Video, ClipboardCheck, Globe, Target
};

interface TransactionFormProps {
  onTransactionAdded: (t: Transaction) => void;
  initialType?: TransactionType;
}

type Step = 'SELECTION' | 'DETAILS';

const TransactionForm: React.FC<TransactionFormProps> = ({ onTransactionAdded, initialType }) => {
  // Default to SELECTION step and initialType (or INCOME) for immediate access
  const [step, setStep] = useState<Step>('SELECTION');
  const [type, setType] = useState<TransactionType>(initialType || TransactionType.INCOME);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form State
  const [amount, setAmount] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');

  // Sync state when prop changes (e.g. clicking Nav buttons while form is open)
  useEffect(() => {
    if (initialType) {
      setType(initialType);
      // Reset selection when switching modes to prevent stale data
      setStep('SELECTION');
      setSelectedItem(null);
      setAmount('');
      setClientName('');
      setDescription('');
    }
  }, [initialType]);

  const resetForm = () => {
    setStep('SELECTION');
    setSelectedItem(null);
    setAmount('');
    setClientName('');
    setDescription('');
    // Reset to initial type if provided, otherwise Income
    setType(initialType || TransactionType.INCOME);
  };

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
    if (type === TransactionType.INCOME && item.price) {
      setAmount(item.price.toString());
    } else {
      setAmount('');
    }
    setStep('DETAILS');
  };

  const adjustAmount = (delta: number) => {
    const current = amount === '' ? 0 : parseInt(amount, 10);
    const safeCurrent = isNaN(current) ? 0 : current;
    const next = Math.max(0, safeCurrent + delta);
    setAmount(next.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount: Number(amount),
      category: selectedItem?.name || 'Autre',
      description: description || (type === TransactionType.INCOME ? `${selectedItem?.name} - ${clientName}` : `${selectedItem?.name}`),
      clientName: type === TransactionType.INCOME ? clientName : undefined,
      date: new Date().toISOString(),
      timestamp: Date.now(),
    };

    onTransactionAdded(newTransaction);
    resetForm();
  };

  const renderIcon = (iconName: string, className?: string) => {
    const Icon = ICON_MAP[iconName] || Package;
    return <Icon className={className} />;
  };

  // --- STEP 1: SELECT ITEM (Direct Access) ---
  if (step === 'SELECTION') {
    const items = type === TransactionType.INCOME ? SERVICES : EXPENSE_CATEGORIES;
    const isIncome = type === TransactionType.INCOME;

    return (
      <div className="flex flex-col h-full bg-[#F2F4F8] md:rounded-3xl animate-slide-up">
        {/* Toggle Switcher Header */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex gap-2 mb-6">
          <button
            onClick={() => setType(TransactionType.INCOME)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              type === TransactionType.INCOME 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Encaissement
          </button>
          <button
            onClick={() => setType(TransactionType.EXPENSE)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              type === TransactionType.EXPENSE 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Dépense
          </button>
        </div>

        {/* Premium List */}
        <div className="flex-1 overflow-y-auto px-1 pb-24 space-y-3">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleItemSelect(item)}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-slide-up group relative w-full bg-white rounded-[1.8rem] p-3 flex items-center gap-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-transparent hover:border-slate-200 active:scale-[0.98] transition-all duration-200 overflow-hidden"
            >
              <div className={`absolute inset-0 opacity-0 group-active:opacity-5 transition-opacity duration-300 ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />

              <div className={`shrink-0 w-14 h-14 rounded-[1rem] flex items-center justify-center shadow-md text-white transition-transform duration-300 group-hover:scale-105 ${
                isIncome 
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-100' 
                  : 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-100'
              }`}>
                {renderIcon(item.icon, "w-7 h-7")}
              </div>
              
              <div className="flex-1 text-left z-10">
                <div className="font-bold text-slate-800 text-base leading-tight">
                  {item.name}
                </div>
                {isIncome && (item as any).price && (
                   <div className="text-emerald-600/70 text-xs font-bold mt-1">
                      {(item as any).price.toLocaleString('fr-DZ')} DA
                   </div>
                )}
              </div>

              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                 isIncome 
                 ? 'bg-emerald-50 text-emerald-500' 
                 : 'bg-rose-50 text-rose-500'
              }`}>
                <ChevronRight size={18} strokeWidth={3} />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- STEP 2: DETAILS (Inline Form) ---
  const isIncome = type === TransactionType.INCOME;
  const ThemeColor = isIncome ? 'text-emerald-600' : 'text-rose-600';
  const BgTheme = isIncome ? 'bg-emerald-600' : 'bg-rose-600';

  return (
    <div className="flex flex-col h-full animate-slide-up" style={{ animationDuration: '0.4s' }}>
      
      {/* Top Bar: Back & Selected Service */}
      <div className="flex items-center justify-between mb-4 pt-1">
        {/* Back Button */}
        <button 
          onClick={() => setStep('SELECTION')}
          className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 hover:bg-slate-50 active:scale-95 transition-all"
        >
           <ArrowLeft size={20} />
        </button>

        {/* Selected Service Display */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-100 shadow-sm">
           <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
             isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
           }`}>
              {renderIcon(selectedItem.icon, "w-3 h-3")}
           </div>
           <span className="font-bold text-slate-800 text-sm">{selectedItem.name}</span>
        </div>

        {/* Cancel Button */}
        <button 
          onClick={resetForm}
          className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 active:scale-95 transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        
        {/* Amount Section */}
        <div className="flex-1 flex flex-col justify-center items-center py-6">
          <div className="flex items-center justify-center gap-4 w-full">
            
            {/* Decrease */}
            <button
              type="button"
              onClick={() => adjustAmount(-1000)}
              className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Minus size={20} strokeWidth={3} />
            </button>

            {/* Input */}
            <div className="relative text-center max-w-[280px]">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full bg-transparent text-center text-5xl font-black outline-none placeholder:text-slate-200 transition-all ${ThemeColor}`}
                placeholder="0"
                required
              />
              <div className="mt-2 text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Dinar Algérien</div>
            </div>

             {/* Increase */}
             <button
              type="button"
              onClick={() => adjustAmount(1000)}
              className={`w-12 h-12 rounded-full border-2 bg-white flex items-center justify-center active:scale-90 transition-transform ${
                isIncome 
                  ? 'border-emerald-100 text-emerald-500' 
                  : 'border-rose-100 text-rose-500'
              }`}
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 mb-6">
          {isIncome && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-wide">Client</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-50 h-14 px-6 rounded-2xl text-lg font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-slate-300 placeholder:font-medium"
                placeholder="Nom du client"
                required={isIncome}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 tracking-wide">Détails</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full bg-slate-50 h-14 px-6 rounded-2xl text-lg font-bold text-slate-800 focus:bg-white outline-none transition-all placeholder:text-slate-300 placeholder:font-medium ${
                 isIncome ? 'focus:ring-2 focus:ring-emerald-100' : 'focus:ring-2 focus:ring-rose-100'
              }`}
              placeholder="Note optionnelle"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="mt-auto">
          <button
            type="submit"
            className={`w-full h-16 rounded-[1.5rem] ${BgTheme} text-white font-bold text-lg shadow-lg shadow-indigo-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3`}
          >
            <Check size={24} strokeWidth={3} />
            <span>VALIDER</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default TransactionForm;