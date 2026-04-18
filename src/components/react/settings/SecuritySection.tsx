import React from "react";
import { Icon } from "@/components/react/shared/Icon";

interface SecuritySectionProps {
  passwordForm: {
    currentPassword: "";
    newPassword: "";
    confirmPassword: "";
  };
  setPasswordForm: (form: any) => void;
  isUpdating: boolean;
  handlePasswordUpdate: (e: React.FormEvent) => Promise<void>;
  t: (key: string, params?: any) => string;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
  passwordForm,
  setPasswordForm,
  isUpdating,
  handlePasswordUpdate,
  t,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          {t("settings.security")}
        </h2>
        <p className="text-slate-400 text-sm">
          {t("settings.securityDesc") || "Update your password and manage account security settings."}
        </p>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10 group-hover:bg-indigo-500/10 transition-colors" />
        
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Icon name="Lock" size={16} />
          </span>
          {t("settings.changePassword")}
        </h3>

        <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="currentPassword" className="text-sm font-medium text-slate-400 ml-1">
              {t("settings.currentPassword")}
            </label>
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-indigo-500 transition-colors">
                <Icon name="Key" size={18} />
              </div>
              <input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-mono"
                placeholder={t("settings.currentPasswordPlaceholder")}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/[0.05]">
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="text-sm font-medium text-slate-400 ml-1">
                {t("settings.newPassword")}
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-indigo-500 transition-colors">
                  <Icon name="Shield" size={18} />
                </div>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-mono"
                  placeholder={t("settings.newPasswordPlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-400 ml-1">
                {t("settings.confirmPassword")}
              </label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-indigo-500 transition-colors">
                  <Icon name="Check" size={18} />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-mono"
                  placeholder={t("settings.confirmPasswordPlaceholder")}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white rounded-xl transition-all font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
          >
            {isUpdating ? t("settings.updating") : t("settings.changePasswordButton")}
          </button>
        </form>
      </div>
    </div>
  );
};
