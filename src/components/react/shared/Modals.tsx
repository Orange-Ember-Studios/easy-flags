import { useState } from "react";
import { useTranslate } from "@/infrastructure/i18n/context";
import type { AvailableLanguages } from "@/infrastructure/i18n/locales";
import { Icon } from "./Icon";

interface ModalsProps {
  initialLocale?: AvailableLanguages;
}

export default function Modals({ initialLocale }: ModalsProps) {
  const t = useTranslate(initialLocale);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <>
      {/* Create Environment Modal */}
      <Modal
        id="create-environment-modal"
        isOpen={activeModal === "environment"}
        onClose={closeModal}
        title={t('environments.createTitle')}
        initialLocale={initialLocale}
      >
        <form className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">
              {t('environments.nameLabel')}
            </label>
            <input
              type="text"
              className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all font-medium"
              placeholder={t('environments.namePlaceholder')}
            />
          </div>
          <div className="flex gap-4 justify-end pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-3 text-slate-500 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary py-3! shadow-lg shadow-cyan-500/20"
            >
              {t('common.create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Feature Modal */}
      <Modal
        id="create-feature-modal"
        isOpen={activeModal === "feature"}
        onClose={closeModal}
        title={t('features.createTitle')}
        initialLocale={initialLocale}
      >
        <form className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">
              {t('features.keyLabel')}
            </label>
            <input
              type="text"
              className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all font-mono text-sm"
              placeholder={t('features.keyPlaceholder')}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-1">
              {t('features.descLabel')}
            </label>
            <textarea
              className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500/50 transition-all h-32 resize-none text-sm leading-relaxed"
              placeholder={t('features.descPlaceholder')}
            />
          </div>
          <div className="flex gap-4 justify-end pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-3 text-slate-500 font-bold uppercase tracking-widest text-xs hover:text-white transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary py-3! shadow-lg shadow-cyan-500/20"
            >
              {t('common.create')}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function Modal({
  id,
  isOpen,
  onClose,
  title,
  children,
  initialLocale,
}: {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  initialLocale?: AvailableLanguages;
}) {
  const t = useTranslate(initialLocale);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto outline-none focus:outline-none scroll-smooth">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-[#0b0e14]/80 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-3xl max-w-lg w-full animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col my-auto">
        {/* Internal Aurora Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -z-10" />

        {/* Header Highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[2px] bg-linear-to-r from-transparent via-cyan-500/50 to-transparent"></div>
        
        <div className="p-12 font-sans overflow-y-auto max-h-[85vh] custom-scrollbar flex flex-col">
          <div className="flex justify-between items-start mb-10 shrink-0">
            <h2 className="text-3xl font-black tracking-tight text-white leading-none">
              {title.split(' ').map((word, i) => (
                i === title.split(' ').length - 1 ? (
                  <span key={i} className="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent ml-2">{word}</span>
                ) : <span key={i}>{word} </span>
              ))}
            </h2>
            <button
              onClick={onClose}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 border border-white/5"
              aria-label={t('common.close')}
            >
              <Icon name="X" size={20} />
            </button>
          </div>
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
