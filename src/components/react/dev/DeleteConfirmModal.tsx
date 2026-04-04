interface DeleteConfirmModalProps {
  isOpen: boolean;
  rowId: string | number | null;
  rowData: Record<string, unknown> | null;
  tableName: string | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  rowId,
  rowData,
  tableName,
  loading,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#06080f]/70 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onCancel}
      />
      
      {/* Modal Container */}
      <div className="relative bg-[#0b0e14]/95 border border-rose-500/20 rounded-[2.5rem] shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header Highlight - centered and faded at edges */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[2px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent"></div>
        
        {/* Background Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 blur-[60px] rounded-full pointer-events-none opacity-50"></div>

        <div className="p-10 font-sans">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20 shadow-lg shadow-rose-500/5">
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </div>

          <h2 className="text-3xl font-bold text-white tracking-tight font-display mb-3">Confirm Deletion</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            You are about to permanently delete a record from <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-rose-500/10">{tableName}</span>. This action is irreversible.
          </p>

          {rowData && Object.keys(rowData).length > 0 && (
            <div className="bg-slate-950/40 border border-white/5 rounded-[2rem] p-6 space-y-3 mb-10 max-h-48 overflow-y-auto no-scrollbar relative shadow-inner">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-4">Record Snapshot</p>
              {Object.entries(rowData).slice(0, 5).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-4 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <span className="text-[11px] font-mono text-slate-500 truncate w-1/3">{key}</span>
                  <span className="text-[11px] font-mono text-rose-300 font-bold truncate text-right w-2/3">
                    {value === null ? "null" : String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4">
             <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 text-slate-500 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 btn-primary !py-3 shadow-xl shadow-rose-500/20 !bg-gradient-to-r !from-rose-600 !to-red-700 !rounded-2xl"
            >
               {loading ? (
                <span className="flex items-center justify-center gap-2">
                   <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                   Deleting...
                </span>
               ) : "Delete Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
