import { useState } from "react";
import type { ColumnInfo } from "./types";

interface AddRowModalProps {
  isOpen: boolean;
  selectedTable: string | null;
  schema: ColumnInfo[];
  formData: Record<string, string>;
  loading: boolean;
  onFormChange: (column: string, value: string) => void;
  onAddRow: () => void;
  onClose: () => void;
}

export function AddRowModal({
  isOpen,
  selectedTable,
  schema,
  formData,
  loading,
  onFormChange,
  onAddRow,
  onClose,
}: AddRowModalProps) {
  const [visiblePasswords, setVisiblePasswords] = useState<
    Record<string, boolean>
  >({});

  const togglePasswordVisibility = (fieldName: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#06080f]/70 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-[#0b0e14]/95 border border-white/10 rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header Highlight - centered and faded at edges */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
        
        <div className="flex-shrink-0 p-10 flex justify-between items-start">
          <div className="pt-2">
            <h2 className="text-3xl font-bold text-white tracking-tight font-display mb-1">
              Add New Record
            </h2>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
               <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
               DATABASE / {selectedTable}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-slate-500 hover:text-white transition-all hover:bg-white/10 active:scale-90"
            aria-label="Close"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-10 py-2 no-scrollbar space-y-8 pb-10 font-sans">
          {schema
            .filter((col) => !col.pk)
            .map((col) => {
              const isPasswordField = col.name.toLowerCase().includes("password");

              return (
                <div key={col.name} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                      {col.name}
                      {col.notnull && <span className="text-rose-500 ml-1 font-bold">*</span>}
                    </label>
                    <span className="text-[9px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-full uppercase border border-white/5">{col.type}</span>
                  </div>

                  {isPasswordField ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-5 space-y-4 relative group">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest px-1">
                          Secured Field (Bcrypt)
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={visiblePasswords[col.name] ? "text" : "password"}
                          value={formData[col.name] || ""}
                          onChange={(e) => onFormChange(col.name, e.target.value)}
                          placeholder="Plain text will be securely hashed..."
                          className="w-full px-5 py-4 pr-12 bg-slate-950/40 border border-emerald-500/30 rounded-2xl text-white placeholder-emerald-950/30 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-mono text-sm transition-all shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(col.name)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-950/40 hover:text-emerald-400 transition-colors"
                        >
                          {visiblePasswords[col.name] ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88 3 3"/><path d="M2 12s3-7 10-7a10 10 0 0 1 5 1.43"/><path d="m16.62 16.62 4.38 4.38"/><path d="M19 12s-3 7-10 7a10 10 0 0 1-5-1.43"/><circle cx="12" cy="12" r="3"/><path d="m14.12 14.12 4.38 4.38"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.349a12.24 12.24 0 0 1 0-0.698 12.24 12.24 0 0 1 19.876 0c.113.111.238.239.362.349a12.24 12.24 0 0 1-19.876 0Z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : col.type.toLowerCase().includes("text") || col.type.toLowerCase().includes("varchar") ? (
                    <textarea
                      value={formData[col.name] || ""}
                      onChange={(e) => onFormChange(col.name, e.target.value)}
                      placeholder={`Enter ${col.name.toLowerCase()} content...`}
                      className="w-full h-32 px-5 py-4 bg-slate-950/40 border border-white/5 rounded-[2rem] text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 font-mono text-sm leading-relaxed transition-all resize-none shadow-inner"
                    />
                  ) : (
                    <input
                      type={ col.type.toLowerCase().includes("int") || col.type.toLowerCase().includes("real") ? "number" : "text" }
                      step={ col.type.toLowerCase().includes("real") ? "0.01" : undefined }
                      value={formData[col.name] || ""}
                      onChange={(e) => onFormChange(col.name, e.target.value)}
                      placeholder={`Value for ${col.name.toLowerCase()}`}
                      className="w-full px-5 py-4 bg-slate-950/40 border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 font-mono text-sm transition-all shadow-inner"
                    />
                  )}
                </div>
              );
            })}
        </div>

        <div className="flex-shrink-0 p-10 border-t border-white/5 flex gap-4 mt-auto">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-4 text-slate-500 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={onAddRow}
            disabled={loading}
            className="flex-1 btn-primary !py-4 shadow-xl shadow-emerald-500/20 !bg-gradient-to-r !from-emerald-500 !to-teal-600"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                 <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                 Adding...
              </span>
            ) : "Save Record"}
          </button>
        </div>
      </div>
    </div>
  );
}
