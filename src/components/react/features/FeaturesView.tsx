import { useEffect, useState } from "react";
import PageContainer from "@/components/react/shared/PageContainer";
import { Modal } from "@/components/react/shared/Modals";
import { Icon, type IconName } from "@/components/react/shared/Icon";
import { useTranslate } from "@/infrastructure/i18n/context";
import type { AvailableLanguages } from "@/infrastructure/i18n/locales";

interface FeatureEnvironmentConfig {
  environmentId: number;
  environmentName: string;
  enabled: boolean;
  rolloutPercentage?: number;
}

interface Feature {
  id: number;
  key: string;
  name: string;
  description?: string;
  type: "boolean" | "string" | "json";
  environments: FeatureEnvironmentConfig[];
  created_at: string;
}

interface Environment {
  id: number;
  name: string;
  type: string;
}

interface FeaturesViewProps {
  spaceId: string | undefined;
  spaceName?: string;
  initialLocale?: AvailableLanguages;
}

const getEnvironmentColor = (type: string) => {
  switch (type) {
    case "production":
      return "red";
    case "staging":
      return "yellow";
    case "development":
      return "blue";
    default:
      return "cyan";
  }
};

const getEnvironmentEmoji = (type: string) => {
  switch (type) {
    case "production":
      return "🔴";
    case "staging":
      return "🟡";
    case "development":
      return "🔵";
    default:
      return "⚪";
  }
};

const getEnvironmentDefaultDescription = (type: string) => {
  switch (type) {
    case "production":
      return "Live environment";
    case "staging":
      return "Pre-production testing";
    case "development":
      return "Local development";
    default:
      return "Custom environment";
  }
};

const typeColors: Record<string, { bg: string; text: string }> = {
  boolean: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400" },
  string: {
    bg: "bg-purple-500/10 border-purple-500/20",
    text: "text-purple-400",
  },
  json: { bg: "bg-green-500/10 border-green-500/20", text: "text-green-400" },
};

const getEnvironmentGradient = (color: string) => {
  switch (color) {
    case "red":
      return "from-red-500/10 via-red-500/5 to-transparent border-red-500/20";
    case "yellow":
      return "from-yellow-500/10 via-yellow-500/5 to-transparent border-yellow-500/20";
    case "blue":
      return "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20";
    default:
      return "from-cyan-500/10 via-cyan-500/5 to-transparent border-cyan-500/20";
  }
};

export default function FeaturesView({
  spaceId,
  spaceName,
  initialLocale,
}: FeaturesViewProps) {
  const t = useTranslate(initialLocale);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);

  // Form states
  const [newFeatureKey, setNewFeatureKey] = useState("");
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureDescription, setNewFeatureDescription] = useState("");
  const [newFeatureType, setNewFeatureType] = useState<
    "boolean" | "string" | "json"
  >("boolean");
  const [limits, setLimits] = useState<{
    max_flags: number | null;
    max_environments: number | null;
  } | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [spaceId]);

  const fetchInitialData = async () => {
    if (!spaceId) return;
    try {
      setIsLoading(true);
      await Promise.all([fetchEnvironments(), fetchFeatures(), fetchLimits()]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLimits = async () => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}/limits`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setLimits(data.limits);
      }
    } catch (error) {
      console.error("Failed to fetch limits:", error);
    }
  };

  const fetchEnvironments = async () => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}/environments`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setEnvironments(data);
        return data;
      }
    } catch (error) {
      console.error("Failed to fetch environments:", error);
    }
    return [];
  };

  const fetchFeatures = async () => {
    if (!spaceId) return;
    try {
      const response = await fetch(`/api/spaces/${spaceId}/features`, {
        credentials: "include",
      });

      const envResponse = await fetch(`/api/spaces/${spaceId}/environments`, {
        credentials: "include",
      });
      const currentEnvs: Environment[] = envResponse.ok
        ? await envResponse.json()
        : [];

      if (response.ok) {
        const data = await response.json();
        const transformedFeatures = data.map((feature: any) => ({
          ...feature,
          environments: currentEnvs.map((env) => ({
            environmentId: env.id,
            environmentName: env.name,
            enabled: false,
          })),
        }));
        setFeatures(transformedFeatures);

        // Update limit status
        if (limits && limits.max_flags !== null && limits.max_flags !== -1) {
          setIsLimitReached(transformedFeatures.length >= limits.max_flags);
        }
      }
    } catch (error) {
      console.error("Failed to fetch features:", error);
    }
  };

  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureKey.trim() || !newFeatureName.trim() || !spaceId) return;

    try {
      const response = await fetch(`/api/spaces/${spaceId}/features`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          key: newFeatureKey,
          name: newFeatureName,
          description: newFeatureDescription,
          type: newFeatureType,
          default_value: newFeatureType === "boolean" ? "false" : "",
        }),
      });

      if (response.ok) {
        resetForm();
        setShowCreateModal(false);
        await fetchFeatures();
      }
    } catch (error) {
      console.error("Failed to create feature:", error);
    }
  };

  const handleEditFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature || !newFeatureKey.trim() || !newFeatureName.trim())
      return;

    try {
      const response = await fetch(
        `/api/spaces/${spaceId}/features/${editingFeature.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: newFeatureKey,
            name: newFeatureName,
            description: newFeatureDescription,
            type: newFeatureType,
          }),
        },
      );

      if (response.ok) {
        resetForm();
        setShowEditModal(false);
        await fetchFeatures();
      }
    } catch (error) {
      console.error("Failed to edit feature:", error);
    }
  };

  const resetForm = () => {
    setEditingFeature(null);
    setNewFeatureKey("");
    setNewFeatureName("");
    setNewFeatureDescription("");
    setNewFeatureType("boolean");
  };

  const startEditingFeature = (feature: Feature) => {
    setEditingFeature(feature);
    setNewFeatureKey(feature.key);
    setNewFeatureName(feature.name);
    setNewFeatureDescription(feature.description || "");
    setNewFeatureType(feature.type);
    setShowEditModal(true);
  };

  const deleteFeature = async (id: number) => {
    if (
      !confirm("Are you sure you want to delete this feature flag?") ||
      !spaceId
    )
      return;

    try {
      const response = await fetch(`/api/spaces/${spaceId}/features/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await fetchFeatures();
      }
    } catch (error) {
      console.error("Failed to delete feature:", error);
    }
  };

  const toggleEnvironmentFlag = (featureId: number, environmentId: number) => {
    setFeatures(
      features.map((f) =>
        f.id === featureId
          ? {
              ...f,
              environments: f.environments.map((env) =>
                env.environmentId === environmentId
                  ? { ...env, enabled: !env.enabled }
                  : env,
              ),
            }
          : f,
      ),
    );
  };

  return (
    <PageContainer
      spaceId={spaceId}
      spaceName={spaceName}
      currentTab="features"
    >
      <div className="space-y-12">
        {/* Header Section */}
        <div className="relative group overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-[40px] p-8 md:p-14 transition-all hover:bg-white/[0.04] hover:border-white/10">
          <div className="absolute top-0 right-0 w-full h-full bg-linear-to-br from-cyan-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                Feature Hub
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                {t("navigation.flags")}
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed font-medium">
                Create once, deploy everywhere. Configure your flags
                independently across environments with a single click.
              </p>
            </div>
            <button
              onClick={() => {
                if (isLimitReached) return;
                resetForm();
                setShowCreateModal(true);
              }}
              disabled={isLimitReached}
              className={`w-full lg:w-auto btn-primary flex items-center justify-center gap-3 px-10! py-5! shadow-2xl shadow-cyan-500/25 ${isLimitReached ? "opacity-50 cursor-not-allowed grayscale" : "hover:scale-105 active:scale-95 transition-all"}`}
              title={
                isLimitReached
                  ? `Limit of ${limits?.max_flags} flags reached`
                  : ""
              }
            >
              <Icon
                name={isLimitReached ? "Lock" : "Plus"}
                size={20}
                className={
                  !isLimitReached
                    ? "group-hover:rotate-90 transition-transform duration-300"
                    : ""
                }
              />
              <span className="font-bold">
                {isLimitReached ? "Limit Reached" : "Create Flag"}
              </span>
            </button>
          </div>
        </div>

        {/* Environment Legend */}
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                {environments.map((env) => (
                  <div
                    key={env.id}
                    className="flex items-center gap-5 bg-white/[0.02] backdrop-blur-md border border-white/5 px-6 py-5 rounded-3xl hover:bg-white/[0.05] hover:border-white/10 transition-all group overflow-hidden relative"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-500 shadow-inner relative z-10">
                      {getEnvironmentEmoji(env.type)}
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xs font-bold text-white tracking-tight mb-0.5">
                        {env.name}
                      </h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {getEnvironmentDefaultDescription(env.type)}
                      </p>
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white/[0.02] rounded-full blur-xl group-hover:bg-white/[0.05] transition-all"></div>
                  </div>
                ))}
                {environments.length === 0 && (
                  <div className="col-span-full py-8 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[32px]">
                    <p className="text-sm text-slate-500 italic">
                      No environments configured yet
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Features List */}
        <section className="space-y-6 animate-in fade-in duration-700 delay-200">
          {isLoading ? (
            Array(2)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="card h-64 animate-pulse bg-white/5"
                ></div>
              ))
          ) : features.length === 0 ? (
            <div className="text-center py-24 card flex flex-col items-center justify-center border-dashed border-white/10">
              <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6">
                <Icon name="Flag" size={40} className="text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                No feature flags found
              </h2>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                Start by creating your first feature flag to manage your
                application's behavior.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-secondary"
              >
                Create your first flag
              </button>
            </div>
          ) : (
            features.map((feature) => (
              <div
                key={feature.id}
                className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-[40px] p-8 md:p-12 transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10 group overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-full h-full bg-linear-to-br from-cyan-500/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                {/* Feature Header */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10 relative z-10">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      <h3 className="text-3xl font-extrabold text-white tracking-tight group-hover:text-cyan-400 transition-colors drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                        {feature.name}
                      </h3>
                      <div
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-inner ${typeColors[feature.type].bg} ${typeColors[feature.type].text}`}
                      >
                        {feature.type}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-6">
                      <code className="bg-slate-950/60 text-cyan-400 px-4 py-2 rounded-xl font-mono text-xs border border-white/5 shadow-2xl tracking-tight">
                        {feature.key}
                      </code>
                    </div>
                    {feature.description && (
                      <p className="text-slate-400 text-base leading-relaxed max-w-3xl font-medium">
                        {feature.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3 shrink-0 relative z-20">
                    <button
                      onClick={() => startEditingFeature(feature)}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 border border-white/5 transition-all shadow-inner"
                      title="Edit feature flag"
                    >
                      <Icon name="Edit" size={20} />
                    </button>
                    <button
                      onClick={() => deleteFeature(feature.id)}
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-white/5 transition-all shadow-inner"
                      title="Delete feature flag"
                    >
                      <Icon name="Trash" size={20} />
                    </button>
                  </div>
                </div>

                {/* Environment Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-10 border-t border-white/5 relative z-10">
                  {feature.environments.map((envConfig) => {
                    const env = environments.find(
                      (e) => e.id === envConfig.environmentId,
                    );
                    if (!env) return null;

                    return (
                      <div
                        key={envConfig.environmentId}
                        className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex items-center justify-between transition-all duration-300 hover:bg-white/[0.06] hover:border-white/10 group/toggle"
                      >
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-lg">
                              {getEnvironmentEmoji(env.type)}
                            </span>
                            <p className="font-bold text-white text-xs tracking-tight truncate">
                              {env.name}
                            </p>
                          </div>
                          <p
                            className={`text-[9px] font-black uppercase tracking-[0.2em] ${envConfig.enabled ? "text-cyan-400" : "text-slate-600"}`}
                          >
                            {envConfig.enabled ? "Active" : "Disabled"}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            toggleEnvironmentFlag(
                              feature.id,
                              envConfig.environmentId,
                            )
                          }
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 ${
                            envConfig.enabled
                              ? "bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                              : "bg-slate-800"
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xl transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
                              envConfig.enabled
                                ? "translate-x-6 scale-110"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Card Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-10 pt-8 border-t border-white/5 relative z-10">
                  <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-[0.25em]">
                    <Icon name="Clock" size={12} />
                    Created{" "}
                    {new Date(feature.created_at).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </div>
                  <a
                    href={`/spaces/${spaceId}/features/${feature.id}`}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 rounded-2xl text-cyan-400 text-xs font-black uppercase tracking-widest group/link transition-all"
                  >
                    Advanced Config
                    <Icon
                      name="ArrowRight"
                      size={14}
                      className="group-hover/link:translate-x-1 transition-transform"
                    />
                  </a>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {/* Feature Modal */}
      <Modal
        id="feature-modal"
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetForm();
        }}
        title={editingFeature ? "Edit Feature Flag" : "New Feature Flag"}
      >
        <form
          onSubmit={editingFeature ? handleEditFeature : handleCreateFeature}
          className="space-y-8 py-2 font-sans"
        >
          <div className="space-y-6">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 px-1">
                Feature Key
              </label>
              <input
                type="text"
                value={newFeatureKey}
                onChange={(e) =>
                  setNewFeatureKey(
                    e.target.value.toLowerCase().replace(/\s+/g, "_"),
                  )
                }
                placeholder="e.g., NEW_DASHBOARD"
                className="w-full bg-slate-950/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 transition-all font-mono text-xs shadow-inner"
                required
                disabled={!!editingFeature}
              />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 px-1">
                Display Name
              </label>
              <input
                type="text"
                value={newFeatureName}
                onChange={(e) => setNewFeatureName(e.target.value)}
                placeholder="e.g., New Dashboard"
                className="w-full bg-slate-950/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 transition-all font-bold text-xs shadow-inner"
                required
              />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 px-1">
                Description
              </label>
              <textarea
                value={newFeatureDescription}
                onChange={(e) => setNewFeatureDescription(e.target.value)}
                placeholder="What does this feature flag do?"
                className="w-full bg-slate-950/40 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 transition-all h-24 resize-none text-xs font-medium leading-relaxed shadow-inner"
              />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 px-1">
                Flag Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["boolean", "string", "json"] as const).map((type) => {
                  const isActive = newFeatureType === type;
                  const icons = {
                    boolean: "Zap",
                    string: "Type",
                    json: "Code",
                  } as const;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewFeatureType(type)}
                      className={`group/type flex flex-col items-center justify-center gap-2 py-3 rounded-2xl font-black transition-all border ${
                        isActive
                          ? "text-cyan-400 border-cyan-500/30 bg-white/[0.03] shadow-xl shadow-white/5 ring-1 ring-white/5"
                          : "bg-slate-950/40 border-transparent text-slate-600 hover:text-slate-400 hover:bg-white/[0.01]"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-white/5 shadow-inner"
                            : "bg-white/[0.02]"
                        }`}
                      >
                        <Icon
                          name={icons[type] as IconName}
                          size={16}
                          className={
                            isActive
                              ? "text-cyan-400"
                              : "text-slate-700 group-hover/type:text-slate-500"
                          }
                        />
                      </div>
                      <span className="text-[8px] uppercase tracking-[0.1em] font-black">
                        {type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 mt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                resetForm();
              }}
              className="flex-1 py-4 text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] hover:text-white transition-colors border border-transparent hover:bg-white/5 rounded-2xl"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="flex-[1.5] py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] text-slate-950 bg-linear-to-r from-cyan-400 to-blue-500 shadow-2xl shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {editingFeature ? t("common.save") : "Create Flag"}
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 animate-pulse">
      <div className="w-16 h-4 bg-white/10 rounded mb-4"></div>
      <div className="w-full h-8 bg-white/5 rounded"></div>
    </div>
  );
}
