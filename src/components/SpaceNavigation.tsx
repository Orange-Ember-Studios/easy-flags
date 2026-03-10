import React from "react";

interface SpaceNavigationProps {
  spaceId: string | undefined;
  spaceName?: string;
  currentTab?:
    | "overview"
    | "environments"
    | "features"
    | "permissions";
}

export default function SpaceNavigation({
  spaceId,
  spaceName,
  currentTab = "overview",
}: SpaceNavigationProps) {
  const isActive = (tab: string) =>
    currentTab === tab ? "border-b-2 border-cyan-400 text-cyan-300" : "";

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <a href="/spaces" className="text-cyan-400 hover:text-cyan-300 text-sm mb-2 inline-block">
            ← Back to Spaces
          </a>
          <h1 className="text-3xl font-bold text-gradient">
            {spaceName || `Space ${spaceId}`}
          </h1>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-700">
        <nav className="flex gap-8">
          <a
            href={`/spaces/${spaceId}`}
            className={`pb-3 text-slate-300 hover:text-cyan-300 transition ${isActive("overview")}`}
          >
            Overview
          </a>
          <a
            href={`/spaces/${spaceId}/environments`}
            className={`pb-3 text-slate-300 hover:text-cyan-300 transition ${isActive("environments")}`}
          >
            Environments
          </a>
          <a
            href={`/spaces/${spaceId}/features`}
            className={`pb-3 text-slate-300 hover:text-cyan-300 transition ${isActive("features")}`}
          >
            Features
          </a>
          <a
            href={`/spaces/${spaceId}/permissions`}
            className={`pb-3 text-slate-300 hover:text-cyan-300 transition ${isActive("permissions")}`}
          >
            Team & Permissions
          </a>
        </nav>
      </div>
    </div>
  );
}
