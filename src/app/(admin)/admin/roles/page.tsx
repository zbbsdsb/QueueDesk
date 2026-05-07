"use client";

import { ShieldCheck } from "lucide-react";

const ROLES = [
  {
    name: "Owner",
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-900/30",
    description: "Full access to all settings, billing, and data. Cannot be removed or reassigned.",
    permissions: ["All access", "Billing", "Delete workspace", "Transfer ownership"],
  },
  {
    name: "Admin",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    description: "Can manage users, teams, queues, SLA policies, and all operational settings.",
    permissions: ["Manage users", "Manage teams", "Manage queues", "SLA policies", "View reports", "Cannot access billing"],
  },
  {
    name: "Agent",
    color: "text-cyan-600",
    bg: "bg-cyan-50 dark:bg-cyan-900/30",
    description: "Can view and respond to tickets assigned to them or their team. Cannot change settings.",
    permissions: ["View assigned tickets", "Reply & comment", "Change ticket status", "No settings access"],
  },
  {
    name: "Requester",
    color: "text-slate-600",
    bg: "bg-slate-50 dark:bg-slate-900/30",
    description: "Can submit requests and track the status of their own tickets.",
    permissions: ["Submit requests", "Track own tickets", "No agent access"],
  },
];

export default function AdminRolesPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Roles define what users can do in QueueDesk. Permissions are additive — each role builds on the one below it.
        </p>
      </div>

      <div className="space-y-4">
        {ROLES.map((role) => (
          <div key={role.name}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${role.bg} flex items-center justify-center shrink-0`}>
                <ShieldCheck className={`w-5 h-5 ${role.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold ${role.color} dark:text-white`}>{role.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{role.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {role.permissions.map((perm) => (
                    <span key={perm}
                      className="inline-flex px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>Custom roles</strong> with granular permissions are on the roadmap. For now, assign users to one of the four built-in roles.
        </p>
      </div>
    </div>
  );
}
