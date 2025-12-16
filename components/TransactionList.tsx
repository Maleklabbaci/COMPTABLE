import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { ArrowDownLeft, ArrowUpRight, Clock, Trash2, AlertCircle } from 'lucide-react';

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

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-[2rem] border border-slate-100 border-dashed mx-1">
        <div className="p-4 bg-slate-50 rounded-full mb-4">
           <Clock size={32} className="text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">Aucune transaction.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 pb-4">
        {transactions.map((t) => (
          <div 
            key={t.id} 
            className="group relative bg-white rounded-[1.25rem] p-4 flex items-center justify-between active:scale-[0.98] transition-all duration-200 shadow-sm border border-slate-100 hover:border-slate-200"
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
                  className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-end pr-4 transition-opacity"
                >
                  <div className="p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition-colors">
                     <Trash2 size={16} />
                  </div>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={cancelDelete}>
          <div 
            className="bg-white rounded-[2rem] p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200 border border-white/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-rose-100 text-rose-500">
                <Trash2 size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Supprimer l'opération ?</h3>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm px-4">
                Cette action effacera définitivement cette transaction de votre historique.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={cancelDelete}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors active:scale-95"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 rounded-2xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-200 transition-all active:scale-95"
                >
                  Supprimer
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