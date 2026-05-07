"use client";

import { GitBranch } from "lucide-react";

export default function AdminApprovalsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Approvals let you require a second pair of eyes before certain actions are taken.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <GitBranch className="w-7 h-7 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-2">Approvals Coming Soon</h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
          Configure approval workflows for high-priority tickets, sensitive actions, and budget requests. This feature is in active development.
        </p>
      </div>
    </div>
  );
}
