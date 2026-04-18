import React from "react";
import { Icon } from "@/components/react/shared/Icon";

interface UserPreferences {
  id: number;
  user_id: number;
  email_notifications: boolean;
  security_alerts: boolean;
}

interface PreferenceSectionProps {
  preferences: UserPreferences | null;
  togglingPreference: string | null;
  handleTogglePreference: (key: any, value: boolean) => Promise<void>;
  initialLocale?: string;
  t: (key: string, params?: any) => string;
}

const Toggle = ({
  checked,
  onChange,
  disabled = false,
  loading = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
}) => (
  <button
    type="button"
    onClick={() => !disabled && !loading && onChange(!checked)}
    disabled={disabled || loading}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${
      checked
        ? "bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        : "bg-white/10"
    } ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
  >
    <span
      className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )}
  </button>
);

export const PreferenceSection: React.FC<PreferenceSectionProps> = ({
  preferences,
  togglingPreference,
  handleTogglePreference,
  initialLocale,
  t,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          {t("settings.preferences")}
        </h2>
        <p className="text-slate-400 text-sm">
          {t("settings.preferencesDesc")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Language Selection */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 hover:bg-white/[0.04] transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -z-10" />
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                <Icon name="Globe" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{t("settings.language")}</h3>
                <p className="text-sm text-slate-400 mt-1">{t("settings.languageDesc")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/[0.05]">
              {(["en", "es", "fr"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    const currentPath = window.location.pathname + window.location.search + window.location.hash;
                    window.location.href = `/api/i18n/set-language?lang=${lang}&redirect=${encodeURIComponent(currentPath)}`;
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    (initialLocale || "en") === lang
                      ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                      : "text-slate-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications Group */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] ml-2">
            Notifications
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[24px] p-6 flex items-center justify-between group hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="Mail" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{t("settings.emailNotifications")}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{t("settings.emailNotificationsDesc")}</p>
                </div>
              </div>
              <Toggle
                checked={preferences?.email_notifications ?? false}
                onChange={(val) => handleTogglePreference("email_notifications", val)}
                loading={togglingPreference === "email_notifications"}
              />
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[24px] p-6 flex items-center justify-between group hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                  <Icon name="Lock" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{t("settings.securityAlerts")}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{t("settings.securityAlertsDesc")}</p>
                </div>
              </div>
              <Toggle
                checked={preferences?.security_alerts ?? false}
                onChange={(val) => handleTogglePreference("security_alerts", val)}
                loading={togglingPreference === "security_alerts"}
              />
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-white/[0.01] border border-white/[0.03] border-dashed rounded-3xl p-6 relative group grayscale opacity-50">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">{t("settings.comingSoon")}</h3>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-xs text-slate-400">
              <Icon name="Lock" size={14} /> 2FA
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-xs text-slate-400">
              <Icon name="Activity" size={14} /> Dark Mode Sync
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
