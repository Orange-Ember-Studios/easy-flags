import React, { useState } from "react";
import SpaceNavigation from "./SpaceNavigation";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  joinedAt: string;
}

interface PermissionsViewProps {
  spaceId: string | undefined;
}

export default function PermissionsView({ spaceId }: PermissionsViewProps) {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      role: "admin",
      joinedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      role: "editor",
      joinedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "viewer",
      joinedAt: new Date().toISOString(),
    },
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">(
    "editor",
  );

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember: TeamMember = {
      id: Math.max(...members.map((m) => m.id), 0) + 1,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      joinedAt: new Date().toISOString(),
    };

    setMembers([...members, newMember]);
    setInviteEmail("");
    setInviteRole("editor");
    setShowInviteModal(false);
  };

  const roleDescriptions: Record<string, string> = {
    admin: "Full access including team management",
    editor: "Can modify features and environments",
    viewer: "Read-only access",
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-500/20 text-red-300",
    editor: "bg-yellow-500/20 text-yellow-300",
    viewer: "bg-blue-500/20 text-blue-300",
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <SpaceNavigation
        spaceId={spaceId}
        spaceName="Acme Corporation"
        currentTab="permissions"
      />

      <div className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-300">Team & Permissions</h2>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary"
          >
            + Invite Member
          </button>
        </div>

        <p className="text-slate-400 mb-6">
          Manage team members and their access levels for this space.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Members Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-bold text-cyan-300 mb-4">
                Team Members
              </h3>

              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition"
                  >
                    <div>
                      <p className="font-medium text-white">{member.name}</p>
                      <p className="text-sm text-slate-400">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${roleColors[member.role]}`}
                      >
                        {member.role.charAt(0).toUpperCase() +
                          member.role.slice(1)}
                      </span>
                      <button className="text-slate-400 hover:text-slate-200">
                        ⋮
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Invitations */}
            <div className="card mt-6">
              <h3 className="text-lg font-bold text-cyan-300 mb-4">
                Pending Invitations
              </h3>
              <p className="text-slate-400 text-center py-8">
                No pending invitations
              </p>
            </div>
          </div>

          {/* Roles Reference */}
          <div>
            <div className="card">
              <h3 className="text-lg font-bold text-cyan-300 mb-4">
                Role Permissions
              </h3>

              <div className="space-y-3">
                {(
                  [
                    { role: "admin", desc: roleDescriptions.admin },
                    { role: "editor", desc: roleDescriptions.editor },
                    { role: "viewer", desc: roleDescriptions.viewer },
                  ] as const
                ).map(({ role, desc }) => (
                  <div key={role} className="p-3 bg-slate-800/50 rounded-lg">
                    <div
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${roleColors[role]} mb-2`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </div>
                    <p className="text-sm text-slate-400">{desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-slate-800/50 border border-cyan-500/20 rounded-lg">
                <p className="text-xs text-slate-400">
                  <span className="text-cyan-300 font-semibold">Tip:</span> A
                  space must have at least one admin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800 border border-cyan-700/30 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-cyan-300 mb-4">
              Invite Team Member
            </h2>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "admin" | "editor" | "viewer")
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="editor">Editor (Modify features)</option>
                  <option value="admin">Admin (Full access)</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  {roleDescriptions[inviteRole]}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 btn-primary rounded-lg"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
