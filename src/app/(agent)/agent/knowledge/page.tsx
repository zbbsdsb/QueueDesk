"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type KbArticle = Database["public"]["Tables"]["kb_article"]["Row"];
type KbCategory = Database["public"]["Tables"]["kb_category"]["Row"];

type ArticleWithCategory = KbArticle & {
  category?: KbCategory | null;
};

export default function KnowledgeBasePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = createClient();

  const [articles, setArticles] = useState<ArticleWithCategory[]>([]);
  const [categories, setCategories] = useState<KbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const tenantId = user?.tenant_id;

  const fetchCategories = useCallback(async () => {
    if (!tenantId) return;
    const { data, error } = await supabase
      .from("kb_category")
      .select("*")
      .eq("tenant_id", tenantId)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });
    if (error) return;
    setCategories(data ?? []);
  }, [tenantId, supabase]);

  const fetchArticles = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);

    try {
      let query = supabase
        .from("kb_article")
        .select("*, category:kb_category(*)")
        .eq("tenant_id", tenantId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      if (selectedStatus) {
        query = query.eq("status", selectedStatus);
      }

      if (searchQuery.trim()) {
        query = query.ilike("title", `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setArticles((data ?? []) as ArticleWithCategory[]);
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Failed to load articles",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  }, [tenantId, supabase, toast, searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    if (tenantId) {
      fetchCategories();
    }
  }, [tenantId, fetchCategories]);

  useEffect(() => {
    if (tenantId) {
      fetchArticles();
    }
  }, [tenantId, fetchArticles]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300";
      case "draft":
        return "bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300";
      case "archived":
        return "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
    }
  };

  return (
    <div className="px-6 py-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Knowledge Base</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {articles.length} article{articles.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400/50"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400/50"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 py-16 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No articles found.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                      {article.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeClass(
                        article.status
                      )}`}
                    >
                      {article.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    {article.category && (
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {article.category.name}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {article.view_count} view{article.view_count !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(article.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
