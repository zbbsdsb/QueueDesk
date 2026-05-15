"use client";

import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/icon";

interface SearchResult {
  id: string;
  type: "ticket" | "user" | "article";
  title: string;
  subtitle: string;
  href: string;
}

const MOCK_RESULTS: SearchResult[] = [
  { id: "TKT-0089", type: "ticket", title: "VPN not connecting from home", subtitle: "IT Support · Open", href: "/agent/tickets/TKT-0089" },
  { id: "TKT-0088", type: "ticket", title: "Password reset for payroll system", subtitle: "IT Support · Pending", href: "/agent/tickets/TKT-0088" },
  { id: "U-042", type: "user", title: "Alice Johnson", subtitle: "alice@company.com · IT Dept", href: "/admin/users/u-042" },
  { id: "K-012", type: "article", title: "VPN Setup Guide", subtitle: "Knowledge Base · Published", href: "/agent/knowledge/k-012" },
];

interface GlobalSearchProps {
  className?: string;
}

export default function GlobalSearch({ className = "" }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const results = query.length > 1
    ? MOCK_RESULTS.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.id.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const TYPE_ICON: Record<string, string> = {
    ticket: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400",
    user: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
    article: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400",
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className={`flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all ${className}`}
      >
        <Icon icon={Search} size="sm" />
        <span className="hidden sm:inline">Search tickets, users…</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-xs bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1.5 py-0.5 font-mono ml-2">
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            ref={containerRef}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <Icon icon={Search} size="md" className="text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search tickets, users, knowledge base…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
                  <Icon icon={X} size="sm" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 rounded px-1.5 py-0.5"
              >
                esc
              </button>
            </div>

            {results.length > 0 ? (
              <ul className="py-2">
                {results.map((r) => (
                  <li key={r.id}>
                    <a
                      href={r.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <span className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center shrink-0 ${TYPE_ICON[r.type]}`}>
                        {r.type === "ticket" ? "T" : r.type === "user" ? "U" : "K"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {r.title}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {r.id} · {r.subtitle}
                        </p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            ) : query.length > 1 ? (
              <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                No results for &quot;{query}&quot;
              </p>
            ) : (
              <p className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                Type to search across tickets, users, and knowledge base
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
