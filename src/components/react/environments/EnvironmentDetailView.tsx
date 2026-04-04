import { useEffect, useState } from "react";
import PageContainer from "@/components/react/shared/PageContainer";
import { Modal } from "@/components/react/shared/Modals";
import { useTranslate } from "@/infrastructure/i18n/context";
import type { AvailableLanguages } from "@/infrastructure/i18n/locales";

interface EnvironmentDetailViewProps {
  spaceId: string | undefined;
  envId: string | undefined;
  envName: string;
  envDescription?: string;
  apiKey: string;
  createdAt?: string;
  initialLocale?: AvailableLanguages;
}

const Icons = {
  Key: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4.1a1 1 0 0 0-1.4 0l-1.1 1.1a2.5 2.5 0 0 0 0 3.5Z"/><path d="m15.5 7.5-3 3a4.5 4.5 0 1 1-5.5 5.5l-3.5 3.5a1 1 0 0 1-1.4 0l-1.1-1.1a1 1 0 0 1 0-1.4L4.5 13.5a4.5 4.5 0 0 1 5.5-5.5l3-3"/><path d="M15 7h.01"/><path d="m11 11 .01.01"/><path d="m11 11-2-2"/></svg>
  ),
  Rocket: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4.5c1.1-1.1 3-1.5 3-1.5"/><path d="M12 15v5s3.03-.55 4.5-2c1.1-1.1 1.5-3 1.5-3"/></svg>
  ),
  Info: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  ),
  Copy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
  ),
  Refresh: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
  ),
  Eye: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
  )
};

export default function EnvironmentDetailView({
  spaceId,
  envId,
  envName,
  envDescription,
  apiKey,
  createdAt,
  initialLocale,
}: EnvironmentDetailViewProps) {
  const t = useTranslate(initialLocale);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [spaceName, setSpaceName] = useState("Space");
  const [currentApiKey, setCurrentApiKey] = useState(apiKey);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    fetchEnvironmentData();
  }, [envId, spaceId]);

  const fetchEnvironmentData = async () => {
    if (!envId || !spaceId) return;

    try {
      setIsLoading(true);
      const spaceResponse = await fetch(`/api/spaces/${spaceId}`, {
        credentials: "include",
      });
      if (spaceResponse.ok) {
        const spaceData = await spaceResponse.json();
        setSpaceName(spaceData.name || "Space");
      }
    } catch (error) {
      console.error("Failed to fetch environment data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateKey = async () => {
    if (!envId || !spaceId) return;

    try {
      setIsRegenerating(true);
      const response = await fetch(
        `/api/spaces/${spaceId}/environments/${envId}/regenerate-key`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (response.ok) {
        const updatedEnv = await response.json();
        setCurrentApiKey(updatedEnv.api_key);
      } else {
        console.error("Failed to regenerate API key");
      }
    } catch (error) {
      console.error("Error regenerating API key:", error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(currentApiKey).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-white/5 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          {t('environmentDetail.syncing')}
        </p>
      </div>
    );
  }

  return (
    <>
      <PageContainer
        spaceId={spaceId}
        spaceName={spaceName}
        currentTab="environments"
        subPage={{ name: envName, path: `/spaces/${spaceId}/environments` }}
      >
        {/* Header Section */}
        <div className="mb-16 mt-8 animate-in slide-in-from-top-4 duration-500 delay-100">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              {t('environmentDetail.stage', { name: envName })}
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              {envDescription ||
                t('environmentDetail.description')}
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* API Configuration */}
            <div className="group relative bg-[#0b0e14]/50 border border-white/5 rounded-3xl p-10 transition-all duration-500 hover:border-white/10 shadow-2xl backdrop-blur-sm">
              <div
                className="absolute -top-12 -right-12 w-24 h-24 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none opacity-50"
              ></div>
              
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3.5 rounded-2xl bg-white/5 text-cyan-400 border border-white/5">
                  <Icons.Key />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white tracking-tight">
                    {t('environmentDetail.apiConfig')}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 opacity-60">
                    {t('environmentDetail.authKeys')}
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">
                    {t('environmentDetail.envLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={envName}
                      readOnly
                      className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-5 py-4 text-white font-medium cursor-default opacity-80"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">
                    {t('environmentDetail.apiSecretKey')}
                  </label>
                  {currentApiKey ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1 group/input">
                        <input
                          type="password"
                          value={currentApiKey}
                          readOnly
                          className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-5 py-4 text-white font-mono text-sm group-hover/input:border-white/10 transition-colors"
                        />
                         <div className="absolute inset-y-0 right-4 flex items-center">
                            <span className="text-slate-600 font-mono text-xs select-none">••••••••••••••••</span>
                         </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowApiKeyModal(true)}
                          className="flex items-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 border border-white/5"
                        >
                          <Icons.Eye />
                          {t('environmentDetail.reveal')}
                        </button>
                        <button
                          onClick={handleRegenerateKey}
                          disabled={isRegenerating}
                          className="flex items-center gap-2 px-6 py-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 border border-orange-500/20 disabled:opacity-50"
                        >
                          <Icons.Refresh />
                          {isRegenerating ? t('environmentDetail.wait') : t('environmentDetail.refresh')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleRegenerateKey}
                      disabled={isRegenerating}
                      className="w-full btn-primary py-4! shadow-xl shadow-cyan-500/20"
                    >
                      {isRegenerating ? t('environmentDetail.generating') : t('environmentDetail.generateApiKey')}
                    </button>
                  )}
                  <p className="text-[10px] font-bold bg-slate-50/5 text-slate-500 rounded-lg px-3 py-2 mt-4 inline-block uppercase tracking-wider">
                    ⚠️ {t('environmentDetail.securityWarning')}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 px-1">
                    {t('environmentDetail.systemAccessPoint')}
                  </label>
                  <div className="relative group/input">
                    <input
                      type="text"
                      value={`https://api.easyflags.io/v1/envs/${envId}`}
                      readOnly
                      className="w-full bg-slate-950/40 border border-white/5 rounded-2xl px-5 py-4 text-cyan-500/80 font-mono text-sm group-hover/input:border-white/10 transition-colors"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`https://api.easyflags.io/v1/envs/${envId}`);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-white transition-colors"
                      title="Copy URL"
                    >
                      <Icons.Copy />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Deployed Features */}
            <div className="group relative bg-[#0b0e14]/50 border border-white/5 rounded-3xl p-10 transition-all duration-500 hover:border-white/10 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3.5 rounded-2xl bg-white/5 text-purple-400 border border-white/5">
                  <Icons.Rocket />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    {t('environmentDetail.activeDeployments')}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 opacity-60">
                    {t('environmentDetail.liveFeatures')}
                  </p>
                </div>
              </div>

              <div className="text-center py-20 bg-slate-950/20 border border-dashed border-white/5 rounded-3xl">
                <div className="text-4xl mb-4 grayscale opacity-20">🛰️</div>
                <p className="text-slate-500 text-sm font-medium">
                  {t('environmentDetail.noFeatures')}
                </p>
                <div className="mt-6">
                  <a href={`/spaces/${spaceId}/features`} className="text-xs font-bold uppercase tracking-widest text-cyan-400 hover:underline underline-offset-8 transition-all">
                    {t('environmentDetail.initializeFeature')}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-8 animate-in slide-in-from-right-4 duration-700 delay-300">
            {/* Environment Info */}
            <div className="group relative bg-[#0b0e14]/50 border border-white/5 rounded-3xl p-8 transition-all duration-500 hover:border-white/10 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-white/5 text-slate-400 border border-white/5">
                  <Icons.Info />
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">{t('environmentDetail.systemInfo')}</h3>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl">
                  <p className="text-[9px] font-extrabold text-slate-600 uppercase tracking-[0.2em] mb-2 leading-none">
                    {t('environmentDetail.digitalFingerprint')}
                  </p>
                  <p className="text-slate-300 font-mono text-xs break-all leading-relaxed whitespace-pre-wrap">{envId}</p>
                </div>

                <div className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl">
                  <p className="text-[9px] font-extrabold text-slate-600 uppercase tracking-[0.2em] mb-2 leading-none">
                    {t('environmentDetail.originDate')}
                  </p>
                  <p className="text-slate-300 font-bold text-sm tracking-tight">
                    {createdAt
                      ? new Date(createdAt).toLocaleDateString(t === undefined ? "en-US" : (initialLocale || "en-US"), {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </p>
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('environmentDetail.stageStatus')}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                    {t('environmentDetail.activeTrafficDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions / Integration */}
            <div className="p-8 bg-linear-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-500/10 rounded-3xl shadow-xl">
              <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">{t('environmentDetail.connectSdk')}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                {t('environmentDetail.readyIntegrate')}
              </p>
              <a href="/docs" className="block text-center w-full bg-white text-black py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">
                {t('environmentDetail.readIntegrationDocs')}
              </a>
            </div>
          </div>
        </div>
      </PageContainer>

      {/* API Key Reveal Modal */}
      <Modal
        id="reveal-key-modal"
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        title={t('environmentDetail.accessPointSecret')}
      >
        <div className="space-y-8">
          <div className="text-center p-6 bg-slate-950/40 border border-white/5 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-4">{t('environmentDetail.yourApiKey')}</p>
            
            <div className="relative group/key">
              <div className="p-5 bg-black border border-white/5 rounded-2xl font-mono text-sm break-all text-cyan-400 pr-14 leading-relaxed">
                {currentApiKey}
              </div>
              <button
                onClick={handleCopyApiKey}
                className={`absolute top-1/2 -translate-y-1/2 right-3 p-3 rounded-xl transition-all ${
                  isCopied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title="Copy to clipboard"
              >
                {isCopied ? <Icons.Check /> : <Icons.Copy />}
              </button>
            </div>
          </div>

          <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-4 flex gap-4 items-start">
            <div className="mt-1 text-orange-500"><Icons.Info /></div>
            <div>
              <p className="text-orange-400 font-bold text-xs uppercase tracking-widest mb-1">{t('environmentDetail.securityNotice')}</p>
              <p className="text-[10px] text-orange-500/80 leading-relaxed font-medium">
                {t('environmentDetail.securityNoticeDesc')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowApiKeyModal(false)}
            className="w-full btn-primary py-4! shadow-xl shadow-cyan-500/20"
          >
            {t('environmentDetail.copied')}
          </button>
        </div>
      </Modal>
    </>
  );
}
