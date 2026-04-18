import React, { useState } from "react";
import { Icon } from "@/components/react/shared/Icon";

interface ApiKey {
  id: number;
  key: string;
  last_used?: string;
  created_at: string;
}

interface ApiKeySectionProps {
  apiKeys: ApiKey[];
  showNewApiKeyForm: boolean;
  setShowNewApiKeyForm: (show: boolean) => void;
  isUpdating: boolean;
  handleCreateApiKey: (e: React.FormEvent) => Promise<void>;
  handleDeleteApiKey: (keyId: number) => Promise<void>;
  t: (key: string, params?: any) => string;
}

export const ApiKeySection: React.FC<ApiKeySectionProps> = ({
  apiKeys,
  showNewApiKeyForm,
  setShowNewApiKeyForm,
  isUpdating,
  handleCreateApiKey,
  handleDeleteApiKey,
  t,
}) => {
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);

  const copyToClipboard = (key: string, id: number) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {t("settings.apiKeysTitle")}
          </h2>
          <p className="text-slate-400 text-sm max-w-xl">
            {t("settings.apiKeysDesc")}
          </p>
        </div>
        {!showNewApiKeyForm && (
          <button
            onClick={() => setShowNewApiKeyForm(true)}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl transition-all font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2 active:scale-[0.98]"
          >
            <Icon name="Plus" size={18} />
            {t("common.create")}
          </button>
        )}
      </div>

      {showNewApiKeyForm && (
        <div className="bg-cyan-500/[0.03] border border-cyan-500/20 rounded-3xl p-8 animate-in zoom-in-95 duration-300">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">
            {t("settings.createNewApiKey")}
          </h3>
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl mb-6 flex gap-3 text-cyan-200">
            <Icon name="AlertCircle" size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm">{t("settings.apiKeySecurityNotice")}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateApiKey}
              disabled={isUpdating}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 rounded-xl transition-all font-bold shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
            >
              {isUpdating ? t("common.loading") : t("settings.generateKey")}
            </button>
            <button
              onClick={() => setShowNewApiKeyForm(false)}
              className="px-8 py-3 bg-white/[0.05] hover:bg-white/[0.1] text-white rounded-xl transition-all font-bold border border-white/[0.1] active:scale-[0.98]"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {apiKeys.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-16 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 mb-6">
            <Icon name="Key" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t("settings.noApiKeys")}</h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            {t("settings.noApiKeysDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] rounded-2xl p-5 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between gap-4 relative z-10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                      <Icon name="Key" size={16} />
                    </span>
                    <code className="text-sm font-mono text-cyan-400 bg-cyan-500/5 px-3 py-1 rounded-md border border-cyan-500/10 truncate block max-w-full">
                      {key.key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(key.key, key.id)}
                      className="text-slate-500 hover:text-cyan-400 transition-colors p-1"
                      title="Copy to clipboard"
                    >
                      <Icon name={copiedKeyId === key.id ? "Check" : "Copy"} size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Icon name="Calendar" size={14} />
                      {t("settings.createdLabel")}: {new Date(key.created_at).toLocaleDateString()}
                    </div>
                    {key.last_used && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Icon name="Activity" size={14} className="text-green-500" />
                        {t("settings.lastUsedLabel")}: {new Date(key.last_used).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteApiKey(key.id)}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all font-bold border border-red-500/20 text-sm shrink-0"
                >
                  <Icon name="Trash" size={16} />
                </button>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
