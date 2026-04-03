import React, { useEffect, useState } from "react";

interface Space {
  id: number;
  name: string;
  slug: string;
  description?: string;
  owner_id: number;
  members_count?: number;
  created_at: string;
}

export default function SpacesDashboard() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [newSpaceDescription, setNewSpaceDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const response = await fetch("/api/spaces");
      if (response.ok) {
        const data = await response.json();
        setSpaces(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch spaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newSpaceName,
          description: newSpaceDescription,
        }),
      });

      if (response.ok) {
        setNewSpaceName("");
        setNewSpaceDescription("");
        setShowCreateModal(false);
        await fetchSpaces();
      }
    } catch (error) {
      console.error("Failed to create space:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-cyan-400">Loading spaces...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2">Spaces</h1>
          <p className="text-slate-400 max-w-2xl text-sm sm:text-base">
            Spaces represent your organizations or projects. Each space contains
            features, and features exist in environments (Production, Staging,
            Development, etc.)
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search spaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary w-full sm:w-auto !py-2.5 text-sm"
          >
            + Create Space
          </button>
        </div>
      </div>

      {/* Hierarchy visualization */}
      <div className="bg-slate-800/30 border border-cyan-500/10 rounded-xl p-4 sm:p-5">
        <p className="text-sm text-slate-400 mb-3">
          <span className="text-cyan-300 font-semibold">Hierarchy:</span>
        </p>
        <div className="text-xs sm:text-sm text-slate-300 font-mono ml-2 sm:ml-4 space-y-2 overflow-x-auto pb-2">
          <div className="whitespace-nowrap">📦 Space: "Acme Corp"</div>
          <div className="ml-4 whitespace-nowrap">├─ 🌍 Environment: Production</div>
          <div className="ml-4 whitespace-nowrap">├─ 🌍 Environment: Staging</div>
          <div className="ml-4 whitespace-nowrap">├─ 🌍 Environment: Development</div>
          <div className="ml-4 whitespace-nowrap">
            └─ ⚙️ Features (configured per environment)
          </div>
        </div>
      </div>

      {spaces.length === 0 ? (
        <div className="card text-center py-16 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">

          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-cyan-300 mb-2">
            No spaces yet
          </h2>
          <p className="text-slate-400 mb-4">
            A space represents your organization or project. Create your first
            space to get started with feature flags.
          </p>
          <p className="text-slate-500 text-sm mb-6">
            Example: "Acme Corp", "Mobile App", "E-commerce Platform", etc.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-block w-full sm:w-auto"
          >
            Create First Space
          </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces
            .filter((s) =>
              s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((space) => (
            <a
              key={space.id}
              href={`/spaces/${space.slug}`}
              className="card group hover:shadow-2xl p-5 sm:p-6"
            >
              <h3 className="text-lg sm:text-xl font-bold text-cyan-300 group-hover:text-cyan-200 transition mb-2 break-words">
                {space.name}
              </h3>
              {space.description && (
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {space.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 border-t border-slate-700/50">
                <div className="text-xs sm:text-sm text-slate-500">
                  {new Date(space.created_at).toLocaleDateString()}
                </div>
                {space.members_count !== undefined && (
                  <div className="text-xs sm:text-sm text-slate-500">
                    {space.members_count} members
                  </div>
                )}
              </div>
            </a>
          ))}
          {spaces.filter((s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description?.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg">No spaces match "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-cyan-400 hover:text-cyan-300 mt-2 text-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 border border-cyan-700/30 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-cyan-300">Create Space</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSpace} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Space Name
                </label>
                <input
                  type="text"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="e.g., Production"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newSpaceDescription}
                  onChange={(e) => setNewSpaceDescription(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none h-20"
                  placeholder="Describe this space..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
