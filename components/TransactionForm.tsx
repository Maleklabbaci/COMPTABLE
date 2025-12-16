import React, { useState } from 'react';
import { TransactionType, SERVICES, EXPENSE_CATEGORIES, Transaction } from '../types';
import { 
  ArrowLeft, Check, ChevronRight,
  Palette, Briefcase, 
  Monitor, Cpu, Home, Megaphone, Users, Package,
  Wallet, ShoppingBag, Video, ClipboardCheck, Globe, Target,
  X
} from 'lucide-react';

// Mapping strings to components for dynamic rendering
const ICON_MAP: Record<string, React.ElementType> = {
  Palette, Briefcase, 
  Monitor, Cpu, Home, Megaphone, Users, Package,
  Video, ClipboardCheck, Globe, Target
};

interface TransactionFormProps {
  onTransactionAdded: (t: Transaction) => void;
}

type Step = 'TYPE' | 'SELECTION' | 'DETAILS';

const TransactionForm: React.FC<TransactionFormProps> = ({ onTransactionAdded }) => {
  const [step, setStep] = useState<Step>('TYPE');
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form State
  const [amount, setAmount] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setStep('TYPE');
    setSelectedItem(null);
    setAmount('');
    setClientName('');
    setDescription('');
  };

  const handleTypeSelect = (selectedType: TransactionType) => {
    setType(selectedType);
    setStep('SELECTION');
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

  // --- STEP 1: SELECT TYPE (Modern Big Cards) ---
  if (step === 'TYPE') {
    return (
      <div className="flex flex-col gap-4 h-full pt-2 animate-slide-up" style={{ animationDelay: '0ms' }}>
        <button
          onClick={() => handleTypeSelect(TransactionType.INCOME)}
          className="group relative flex-1 overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-2xl shadow-slate-200 active:scale-[0.98] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-900 opacity-90 group-active:opacity-100 transition-opacity duration-500" />
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-5 p-8">
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-full shadow-inner ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-300">
              <Wallet size={48} className="text-white drop-shadow-md" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold tracking-tight">Encaissement</h3>
              <p className="text-emerald-100 font-medium mt-2 tracking-wide text-sm opacity-90">Client & Services</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleTypeSelect(TransactionType.EXPENSE)}
          className="group relative flex-1 overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-2xl shadow-slate-200 active:scale-[0.98] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-rose-900 opacity-90 group-active:opacity-100 transition-opacity duration-500" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-5 p-8">
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-full shadow-inner ring-1 ring-white/20 group-hover:scale-110 transition-transform duration-300">
              <ShoppingBag size={48} className="text-white drop-shadow-md" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-bold tracking-tight">Dépense</h3>
              <p className="text-rose-100 font-medium mt-2 tracking-wide text-sm opacity-90">Achats & Frais</p>
            </div>
          </div>
        </button>
      </div>
    );
  }

  // --- STEP 2: SELECT ITEM (Premium Column Style) ---
  if (step === 'SELECTION') {
    const items = type === TransactionType.INCOME ? SERVICES : EXPENSE_CATEGORIES;
    const isIncome = type === TransactionType.INCOME;

    return (
      <div className="flex flex-col h-full bg-[#F2F4F8] md:rounded-3xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#F2F4F8]/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setStep('TYPE')}
            className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
          >
            <ArrowLeft size={24} className="text-slate-800" />
          </button>
          <span className="font-extrabold text-xl text-slate-800 tracking-tight">
            {isIncome ? 'Choisir un Service' : 'Type de Dépense'}
          </span>
          <div className="w-12" />
        </div>

        {/* Premium List */}
        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-28 space-y-4">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleItemSelect(item)}
              style={{ animationDelay: `${index * 60}ms` }}
              className="animate-slide-up group relative w-full bg-white rounded-[2rem] p-4 flex items-center gap-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-transparent hover:border-slate-200 active:scale-[0.98] transition-all duration-300 overflow-hidden"
            >
              {/* Subtle background highlight on active */}
              <div className={`absolute inset-0 opacity-0 group-active:opacity-5 transition-opacity duration-300 ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />

              {/* Icon Container with Gradient */}
              <div className={`shrink-0 w-16 h-16 rounded-[1.2rem] flex items-center justify-center shadow-lg text-white transition-transform duration-300 group-hover:scale-105 group-active:scale-95 ${
                isIncome 
                  ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-200' 
                  : 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-200'
              }`}>
                {renderIcon(item.icon, "w-8 h-8 drop-shadow-sm")}
              </div>
              
              {/* Text Content */}
              <div className="flex-1 text-left z-10">
                <div className="font-bold text-slate-800 text-lg leading-tight group-hover:text-slate-900 transition-colors">
                  {item.name}
                </div>
                <div className={`text-xs font-bold mt-1 uppercase tracking-wider opacity-60 ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                  Sélectionner
                </div>
              </div>

              {/* Action Circle */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                 isIncome 
                 ? 'bg-emerald-50 text-emerald-500 group-active:bg-emerald-500 group-active:text-white' 
                 : 'bg-rose-50 text-rose-500 group-active:bg-rose-500 group-active:text-white'
              }`}>
                <ChevronRight size={20} strokeWidth={3} className="ml-0.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- STEP 3: DETAILS (Immersive Form) ---
  const isIncome = type === TransactionType.INCOME;
  const ThemeColor = isIncome ? 'text-emerald-600' : 'text-rose-600';
  const BgTheme = isIncome ? 'bg-emerald-600' : 'bg-rose-600';

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-slide-up" style={{ animationDuration: '0.4s' }}>
      
      {/* Top Bar */}
      <div className="px-6 py-6 flex items-center justify-between">
        <button 
          onClick={() => setStep('SELECTION')}
          className="w-12 h-12 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors active:scale-90"
        >
          <ArrowLeft size={24} className="text-slate-700" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">
            {isIncome ? 'NOUVELLE ENTRÉE' : 'NOUVELLE DÉPENSE'}
          </span>
          <span className="font-bold text-slate-900 text-lg">{selectedItem.name}</span>
        </div>
        <button 
          onClick={resetForm}
          className="w-12 h-12 rounded-full hover:bg-rose-50 text-slate-300 hover:text-rose-500 flex items-center justify-center transition-colors active:scale-90"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-6 pb-6">
        
        {/* Giant Amount Input */}
        <div className="flex-1 flex flex-col justify-center items-center py-4 min-h-[35vh]">
          <div className="relative w-full text-center group">
            <input
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full bg-transparent text-center text-7xl md:text-8xl font-black outline-none placeholder:text-slate-100 transition-all ${ThemeColor}`}
              placeholder="0"
              required
            />
            <div className="mt-4 text-slate-300 font-bold text-xl uppercase tracking-[0.2em]">Dinar Algérien</div>
          </div>
        </div>

        {/* Inputs Container */}
        <div className="space-y-6 bg-slate-50 p-6 rounded-[2.5rem] mb-4">
          {isIncome && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-6 tracking-wide">Client</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-white h-16 px-8 rounded-[1.5rem] text-xl font-semibold text-slate-800 shadow-sm border-2 border-transparent focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                placeholder="Nom du client"
                required={isIncome}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-6 tracking-wide">Détails</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full bg-white h-16 px-8 rounded-[1.5rem] text-xl font-semibold text-slate-800 shadow-sm border-2 border-transparent focus:ring-4 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal ${
                 isIncome ? 'focus:border-emerald-200 focus:ring-emerald-500/10' : 'focus:border-rose-200 focus:ring-rose-500/10'
              }`}
              placeholder="Note optionnelle"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="mt-auto pt-2">
          <button
            type="submit"
            className={`w-full h-20 rounded-[2rem] ${BgTheme} text-white font-bold text-xl shadow-xl shadow-slate-200 active:scale-[0.96] transition-all flex items-center justify-center gap-4 group`}
          >
            <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
              <Check size={28} strokeWidth={4} />
            </div>
            <span className="tracking-wide">VALIDER</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default TransactionForm;