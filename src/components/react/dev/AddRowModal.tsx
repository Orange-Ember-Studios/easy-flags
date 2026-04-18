import { useState } from "react";
import type { ColumnInfo } from "./types";
import { Icon } from "../shared/Icon";

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
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-[#0b0e14]/80 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-3xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-500 overflow-hidden">
        {/* Internal Aurora Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -z-10" />

        {/* Header Highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[2px] bg-linear-to-r from-transparent via-emerald-500/50 to-transparent"></div>

        <div className="shrink-0 p-12 flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-4">
              New <span className="bg-linear-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">Record</span>
            </h2>
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
              <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              Table: <span className="text-white font-mono">{selectedTable}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all hover:bg-white/10 active:scale-95 border border-white/5"
            aria-label="Close"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-12 py-2 custom-scrollbar space-y-10 pb-12">
          {schema
            .filter((col) => !col.pk)
            .map((col) => {
              const isPasswordField = col.name
                .toLowerCase()
                .includes("password");

              return (
                <div
                  key={col.name}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                      {col.name}
                      {!!col.notnull && (
                        <span className="text-rose-500 ml-1.5">*</span>
                      )}
                    </label>
                    <span className="text-[9px] font-black text-slate-600 bg-white/5 px-2.5 py-1 rounded-lg uppercase border border-white/5 tracking-widest leading-none">
                      {col.type}
                    </span>
                  </div>

                  {isPasswordField ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[28px] p-6 space-y-5 relative group ring-1 ring-emerald-500/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Icon name="Lock" size={16} />
                        </div>
                        <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-[0.2em]">
                          Encrypted Data Stream (Bcrypt)
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={
                            visiblePasswords[col.name] ? "text" : "password"
                          }
                          value={formData[col.name] || ""}
                          onChange={(e) =>
                            onFormChange(col.name, e.target.value)
                          }
                          placeholder="Plain text will be securely hashed..."
                          className="w-full px-6 py-4.5 pr-14 bg-slate-950/60 border border-emerald-500/20 rounded-2xl text-white placeholder-emerald-950/30 focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-xs shadow-2xl"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(col.name)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-950/40 hover:text-emerald-400 transition-colors"
                        >
                          {visiblePasswords[col.name] ? (
                            <Icon name="EyeOff" size={18} />
                          ) : (
                            <Icon name="Eye" size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : col.type.toLowerCase().includes("text") ||
                    col.type.toLowerCase().includes("varchar") ? (
                    <textarea
                      value={formData[col.name] || ""}
                      onChange={(e) => onFormChange(col.name, e.target.value)}
                      placeholder={`Enter ${col.name.toLowerCase()} value...`}
                      className="w-full h-40 px-6 py-4.5 bg-slate-950/40 border border-white/5 rounded-[24px] text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/40 transition-all font-mono text-xs leading-relaxed resize-none shadow-inner"
                    />
                  ) : (
                    <input
                      type={
                        col.type.toLowerCase().includes("int") ||
                        col.type.toLowerCase().includes("real")
                          ? "number"
                          : "text"
                      }
                      step={
                        col.type.toLowerCase().includes("real")
                          ? "0.01"
                          : undefined
                      }
                      value={formData[col.name] || ""}
                      onChange={(e) => onFormChange(col.name, e.target.value)}
                      placeholder={`Value for ${col.name.toLowerCase()}...`}
                      className="w-full px-6 py-4.5 bg-slate-950/40 border border-white/5 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/40 transition-all font-mono text-xs shadow-inner"
                    />
                  )}
                </div>
              );
            })}
        </div>

        <div className="shrink-0 p-12 bg-white/[0.01] border-t border-white/5 flex gap-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-4.5 text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] hover:text-white transition-colors border border-transparent hover:bg-white/5 rounded-2xl"
          >
            Go Back
          </button>
          <button
            onClick={onAddRow}
            disabled={loading}
            className="flex-[1.5] py-4.5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] text-slate-950 bg-linear-to-r from-emerald-400 to-cyan-500 shadow-2xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-3.5 h-3.5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
                Synchronizing...
              </span>
            ) : (
              "Register Object"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
