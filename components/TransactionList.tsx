import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { ArrowDownLeft, ArrowUpRight, Clock, Trash2, AlertTriangle, X } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId && onDelete) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const transactionToDelete = transactions.find(t => t.id === deleteId);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-[3rem] shadow-sm border border-slate-100 w-full min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-[10px] ring-slate-50/60">
           <Clock size={42} className="text-slate-300" strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-3">Aucune transaction</h3>
        <p className="text-slate-400 font-medium text-lg max-w-lg leading-relaxed">
          Les opérations apparaîtront ici une fois enregistrées.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 pb-4">
        {transactions.map((t) => (
          <div 
            key={t.id} 
            className="group relative bg-white rounded-[1.5rem] p-4 flex items-center justify-between active:scale-[0.98] transition-all duration-200 shadow-sm border border-slate-100 hover:border-slate-200"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              {/* Icon Box */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                t.type === TransactionType.INCOME 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'bg-rose-50 text-rose-600'
              }`}>
                {t.type === TransactionType.INCOME 
                  ? <ArrowDownLeft size={20} strokeWidth={2.5} /> 
                  : <ArrowUpRight size={20} strokeWidth={2.5} />
                }
              </div>

              {/* Content */}
              <div className="min-w-0 flex flex-col justify-center">
                <h4 className="font-bold text-slate-800 text-sm md:text-base truncate leading-tight">
                  {t.category}
                </h4>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                   <span>{new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                   {t.clientName && (
                     <>
                       <span className="w-1 h-1 rounded-full bg-slate-300" />
                       <span className="truncate max-w-[100px] font-medium text-slate-500">{t.clientName}</span>
                     </>
                   )}
                </div>
              </div>
            </div>

            {/* Amount & Action */}
            <div className="flex flex-col items-end justify-center">
              <span className={`font-bold whitespace-nowrap text-base ${
                t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-slate-900'
              }`}>
                {t.type === TransactionType.INCOME ? '+' : '-'} {t.amount.toLocaleString('fr-DZ')} <span className="text-xs opacity-60">DA</span>
              </span>
              
              {onDelete && (
                <button 
                  onClick={(e) => handleDeleteClick(e, t.id)}
                  className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-white to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-end pr-4 transition-opacity focus:opacity-100"
                  aria-label="Supprimer"
                >
                  <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition-colors shadow-sm flex items-center justify-center">
                     <Trash2 size={18} />
                  </div>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Improved Confirmation Modal */}
      {deleteId && transactionToDelete && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all" onClick={cancelDelete}>
          <div 
            className="bg-white rounded-[2.5rem] p-6 shadow-2xl max-w-sm w-full animate-slide-up relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Background Decorative Gradient */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-rose-50 to-transparent pointer-events-none" />
            
            <div className="relative flex flex-col items-center text-center">
              {/* Animated Warning Icon */}
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-rose-100 ring-4 ring-rose-50 relative">
                <div className="absolute inset-0 rounded-full border border-rose-100 animate-ping opacity-20" />
                <AlertTriangle size={36} className="text-rose-500" strokeWidth={2} />
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Supprimer ?</h3>
              <p className="text-slate-500 mb-6 font-medium text-sm px-4 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer cette transaction ? <br/>Cette action est irréversible.
              </p>
              
              {/* Transaction Context Card */}
              <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-8 flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                   transactionToDelete.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                 }`}>
                    {transactionToDelete.type === TransactionType.INCOME 
                      ? <ArrowDownLeft size={24} /> 
                      : <ArrowUpRight size={24} />
                    }
                 </div>
                 <div className="text-left overflow-hidden">
                    <div className="font-bold text-slate-900 truncate">{transactionToDelete.category}</div>
                    <div className="font-mono text-sm text-slate-500 font-bold">
                      {transactionToDelete.amount.toLocaleString('fr-DZ')} DA
                    </div>
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-4 rounded-2xl font-bold text-lg text-white bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  <Trash2 size={20} className="group-hover:rotate-12 transition-transform" />
                  <span>Oui, supprimer</span>
                </button>
                <button 
                  onClick={cancelDelete}
                  className="w-full py-4 rounded-2xl font-bold text-slate-600 bg-white border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 active:scale-[0.98] transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionList;