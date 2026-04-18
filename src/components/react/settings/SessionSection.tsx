import React from "react";
import { Icon } from "@/components/react/shared/Icon";

interface User {
  id: number;
  username: string;
  role_id: number;
  created_at: string;
}

interface SessionSectionProps {
  user: User | null;
  isRevokingTokens: boolean;
  handleRevokeMyTokens: () => Promise<void>;
  handleRevokeUserTokens: (userId: number) => Promise<void>;
  revokeTargetUserId: string;
  setRevokeTargetUserId: (id: string) => void;
  revokeTargetUsername: string;
  setRevokeTargetUsername: (name: string) => void;
  setError: (err: string) => void;
  t: (key: string, params?: any) => string;
}

export const SessionSection: React.FC<SessionSectionProps> = ({
  user,
  isRevokingTokens,
  handleRevokeMyTokens,
  handleRevokeUserTokens,
  revokeTargetUserId,
  setRevokeTargetUserId,
  revokeTargetUsername,
  setRevokeTargetUsername,
  setError,
  t,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          {t("settings.sessions")}
        </h2>
        <p className="text-slate-400 text-sm">
          {t("settings.activeSessionsDesc")}
        </p>
      </div>

      <div className="bg-orange-500/[0.03] border border-orange-500/10 rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] -z-10 group-hover:bg-orange-500/10 transition-colors" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-orange-400 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                <Icon name="Activity" size={16} />
              </span>
              {t("settings.activeSessions")}
            </h3>
            
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                 <Icon name="MousePointer" size={20} />
               </div>
               <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{t("settings.currentSession")}</span>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] font-bold uppercase rounded-full border border-green-500/20">{t("settings.active")}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {user?.username} • {user?.created_at ? new Date(user.created_at).toLocaleString() : "---"}
                  </p>
               </div>
            </div>
          </div>

          <button
            onClick={handleRevokeMyTokens}
            disabled={isRevokingTokens}
            className="px-8 py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-xl transition-all font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isRevokingTokens ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Icon name="LogOut" size={20} />
            )}
            {t("settings.revokeAllSessions")}
          </button>
        </div>

        <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex gap-3 text-orange-200">
          <Icon name="AlertTriangle" size={20} className="shrink-0 mt-0.5" />
          <p className="text-xs">{t("settings.revokeAllNotice")}</p>
        </div>
      </div>

      {user?.role_id === 1 && (
        <div className="bg-red-500/[0.03] border border-red-500/10 rounded-3xl p-8 transition-colors">
          <h3 className="text-xl font-bold text-red-500 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
              <Icon name="Shield" size={16} />
            </span>
            {t("settings.adminRevokeTitle")}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-400 ml-1">{t("settings.userId")}</label>
              <input
                type="number"
                value={revokeTargetUserId}
                onChange={(e) => setRevokeTargetUserId(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                placeholder="123"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-400 ml-1">{t("settings.usernameLabel")}</label>
              <input
                type="text"
                value={revokeTargetUsername}
                onChange={(e) => setRevokeTargetUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 transition-all"
                placeholder="john_doe"
              />
            </div>
          </div>

          <button
            onClick={() => {
              if (!revokeTargetUserId) {
                setError(t("settings.enterValidUserId"));
                return;
              }
              handleRevokeUserTokens(parseInt(revokeTargetUserId, 10));
            }}
            disabled={isRevokingTokens || !revokeTargetUserId}
            className="w-full px-8 py-3 bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white rounded-xl transition-all font-bold shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
          >
            <Icon name="Zap" size={18} />
            {t("settings.revokeUserTokens")}
          </button>
        </div>
      )}

      {/* Info list */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8">
        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
          <Icon name="Info" size={20} className="text-cyan-400" />
          {t("settings.howRevocationWorks")}
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            t("settings.revocationStep1"),
            t("settings.revocationStep2"),
            t("settings.revocationStep3"),
            t("settings.revocationStep4"),
            t("settings.revocationStep5"),
          ].map((text, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-400 items-start">
              <span className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                {i + 1}
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
