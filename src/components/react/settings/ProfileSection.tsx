import React from "react";
import { Icon } from "@/components/react/shared/Icon";

interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  is_active: boolean;
  created_at: string;
}

interface UserSubscription {
  id: number;
  user_id: number;
  pricing_plan_id: number;
  status: "active" | "canceled" | "past_due" | "trial";
  plan?: {
    name: string;
    description: string;
  };
}

interface ProfileSectionProps {
  user: User | null;
  subscription: UserSubscription | null;
  emailForm: { email: string };
  setEmailForm: (form: { email: string }) => void;
  isUpdating: boolean;
  handleEmailUpdate: (e: React.FormEvent) => Promise<void>;
  t: (key: string, params?: any) => string;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  subscription,
  emailForm,
  setEmailForm,
  isUpdating,
  handleEmailUpdate,
  t,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          {t("settings.profileInfo")}
        </h2>
        <p className="text-slate-400 text-sm">
          {t("settings.profileDesc") || "Manage your account details and subscription."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Details Cards */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Icon name="User" size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("settings.username")}
              </p>
              <p className="text-white font-medium text-lg">{user?.username}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <Icon name="Mail" size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("settings.emailAddress")}
              </p>
              <p className="text-white font-medium text-lg">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Icon name="CreditCard" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("settings.subscription")}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-white font-medium text-lg">
                  {subscription?.plan?.name || "Free"}
                </p>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    subscription?.status === "active"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : subscription?.status === "trial"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {subscription?.status || "Free"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] transition-all duration-300 group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Icon name="Calendar" size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("settings.memberSince")}
              </p>
              <p className="text-white font-medium text-lg">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "---"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Update Email Form */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] -z-10 group-hover:bg-cyan-500/10 transition-colors" />
        
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Icon name="RefreshCw" size={16} />
          </span>
          {t("settings.updateEmail")}
        </h3>

        <form onSubmit={handleEmailUpdate} className="max-w-md space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-400 ml-1">
              {t("settings.newEmail")}
            </label>
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-cyan-500 transition-colors">
                <Icon name="Mail" size={18} />
              </div>
              <input
                id="email"
                type="email"
                value={emailForm.email}
                onChange={(e) => setEmailForm({ email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-white/[0.03] border border-white/[0.1] rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                placeholder="your.email@example.com"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full sm:w-auto px-8 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 rounded-xl transition-all font-bold shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
          >
            {isUpdating ? t("settings.updating") : t("settings.updateButton")}
          </button>
        </form>
      </div>
    </div>
  );
};
