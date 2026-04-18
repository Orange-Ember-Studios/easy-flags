import { useState } from "react";
import { useTranslate } from "@/infrastructure/i18n/context";
import type { AvailableLanguages } from "@/infrastructure/i18n/locales";
import { Icon } from "@/components/react/shared/Icon";

interface HeaderDropdownProps {
  username: string;
  isSuperUser?: boolean;
  initialLocale?: AvailableLanguages;
}

export default function HeaderDropdown({
  username,
  isSuperUser = false,
  initialLocale,
}: HeaderDropdownProps) {
  const t = useTranslate(initialLocale);
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        console.error("Logout failed with status:", response.status);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative group/dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 text-slate-300 hover:text-white transition-all duration-300 group"
      >
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-cyan-400/20 to-blue-600/20 border border-white/10 flex items-center justify-center text-cyan-400 font-black text-xs shadow-inner group-hover:scale-110 transition-transform">
           {username.charAt(0).toUpperCase()}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">{username}</span>
        <Icon 
          name="ChevronDown" 
          size={14} 
          className={`transition-transform duration-500 text-slate-500 group-hover:text-cyan-400 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-4 w-64 bg-[#0b0e14]/90 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-1">Account</p>
               <p className="text-sm font-bold text-white truncate">{username}</p>
            </div>
            <div className="py-3">
              {isSuperUser && (
                <a
                  href="/admin/db-inspector"
                  className="flex items-center gap-3 px-5 py-3 text-[11px] font-bold text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all group/item uppercase tracking-widest"
                >
                  <Icon name="Database" size={16} className="text-slate-500 group-hover/item:text-cyan-400 transition-colors" />
                  <span>{t('admin.dbInspector')}</span>
                  <span className="ml-auto text-[8px] font-black uppercase tracking-tighter bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    S-USER
                  </span>
                </a>
              )}
              <a
                href="/billing"
                className="flex items-center gap-3 px-5 py-3 text-[11px] font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all group/item uppercase tracking-widest"
              >
                <Icon name="CreditCard" size={16} className="text-slate-500 group-hover/item:text-white transition-colors" />
                <span>{t('navigation.billing')}</span>
              </a>
              <a
                href="/settings"
                className="flex items-center gap-3 px-5 py-3 text-[11px] font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all group/item uppercase tracking-widest"
              >
                <Icon name="Settings" size={16} className="text-slate-500 group-hover/item:text-white transition-colors" />
                <span>{t('auth.accountSettings')}</span>
              </a>
            </div>
            <div className="p-3 bg-white/[0.01] border-t border-white/5">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-[11px] font-black text-rose-500/80 hover:bg-rose-500/10 hover:text-rose-500 transition-all rounded-xl uppercase tracking-[0.25em]"
              >
                <Icon name="LogOut" size={16} />
                <span>{t('auth.logout')}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
