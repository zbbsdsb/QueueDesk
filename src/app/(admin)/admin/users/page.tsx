"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, MoreHorizontal, Mail, ShieldCheck, UserX } from "lucide-react";
import Modal from "@/components/shared/Modal";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Database } from "@/lib/supabase/types";
import { APP_USER_ROLE_CONFIG, APP_USER_STATUS_CONFIG } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

type AppUser = Database["public"]["Tables"]["app_user"]["Row"];
type AppUserRole = Database["public"]["Tables"]["app_user"]["Row"]["role"];

const ROLE_OPTIONS: { value: AppUserRole; label: string }[] = [
  { value: "requester", label: "Requester" },
  { value: "agent", label: "Agent" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner" },
];


interface InviteModalState {
  email: string;
  role: string;
  displayName: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const supabase = createClient();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState<InviteModalState>({ email: "", role: "agent", displayName: "" });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");

  // Edit role modal
  const [editUser, setEditUser] = useState<AppUser | null>(null);
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const { data } = await supabase
      .from("app_user")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers((data as AppUser[]) ?? []);
    setLoading(false);
  }

  async function handleInvite() {
    if (!invite.email || !invite.displayName) {
      setInviteError("Email and display name are required.");
      return;
    }
    setInviting(true);
    setInviteError("");

    try {
      const { error } = await supabase.auth.inviteUserByEmail(invite.email);
      if (error) throw error;

      // Create or update user record
      const { data: existing } = await supabase
        .from("app_user")
        .select("id")
        .eq("email", invite.email)
        .maybeSingle();

      if (!existing) {
        const { error: insertError } = await supabase.from("app_user").insert({
          email: invite.email,
          display_name: invite.displayName,
          role: invite.role as AppUser["role"],
          tenant_id: currentUser?.tenant_id ?? "",
          status: "invited",
        });
        if (insertError && insertError.code !== "23505") throw insertError;
      }

      setInviteOpen(false);
      setInvite({ email: "", role: "agent", displayName: "" });
      await loadUsers();
    } catch (err: unknown) {
      setInviteError((err as Error).message ?? "Failed to invite user.");
    } finally {
      setInviting(false);
    }
  }

  async function handleUpdateRole() {
    if (!editUser) return;
    setSaving(true);
    const { error } = await supabase
      .from("app_user")
      .update({ role: editRole as AppUser["role"] })
      .eq("id", editUser.id);
    setSaving(false);
    if (!error) {
      setEditUser(null);
      await loadUsers();
    }
  }

  async function handleToggleStatus(user: AppUser) {
    const newStatus = user.status === "active" ? "disabled" : "active";
    await supabase.from("app_user").update({ status: newStatus as AppUser["status"] }).eq("id", user.id);
    await loadUsers();
  }

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage team members, assign roles, and control access.
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
          <option value="invited">Invited</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">User</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Role</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Joined</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">Loading...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">No users found.</td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user.display_name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{user.display_name ?? "—"}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${APP_USER_ROLE_CONFIG[user.role ?? "requester"]?.bg ?? ""} ${APP_USER_ROLE_CONFIG[user.role ?? "requester"]?.text ?? ""}`}>
                      <ShieldCheck className="w-3 h-3" />
                      {(APP_USER_ROLE_CONFIG[user.role ?? "requester"]?.label ?? user.role)?.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${APP_USER_STATUS_CONFIG[user.status ?? "active"]?.bg ?? ""} ${APP_USER_STATUS_CONFIG[user.status ?? "active"]?.text ?? ""}`}>
                      {(APP_USER_STATUS_CONFIG[user.status ?? "active"]?.label ?? user.status ?? "active")?.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {timeAgo(user.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditUser(user);
                          setEditRole(user.role);
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                        title="Change role"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                        title={user.status === "active" ? "Deactivate" : "Activate"}
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
            {filtered.length} of {users.length} users
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Modal
        open={inviteOpen}
        onClose={() => { setInviteOpen(false); setInviteError(""); }}
        title="Invite User"
        footer={
          <>
            <button
              onClick={() => { setInviteOpen(false); setInviteError(""); }}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={inviting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {inviting ? "Inviting..." : "Send Invite"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={invite.displayName}
              onChange={(e) => setInvite((p) => ({ ...p, displayName: e.target.value }))}
              placeholder="Jane Smith"
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
            <input
              type="email"
              value={invite.email}
              onChange={(e) => setInvite((p) => ({ ...p, email: e.target.value }))}
              placeholder="jane@company.com"
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
            <select
              value={invite.role}
              onChange={(e) => setInvite((p) => ({ ...p, role: e.target.value }))}
              className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          {inviteError && (
            <p className="text-sm text-red-600 dark:text-red-400">{inviteError}</p>
          )}
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title={`Edit Role — ${editUser?.display_name ?? editUser?.email ?? ""}`}
        footer={
          <>
            <button onClick={() => setEditUser(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleUpdateRole}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
          <select
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Changing a role takes effect immediately. The user will see updated permissions on their next action.
          </p>
        </div>
      </Modal>
    </div>
  );
}
