'use client';

import { useEffect, useState } from 'react';
import { Check, X, Eye } from 'lucide-react';
import type { SeoArticle } from '@/types/database';

const DEFAULT_TENANT_ID = 'a0000000-0000-4000-8000-000000000001';

export function SeoArticleManager() {
  const [articles, setArticles] = useState<SeoArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<SeoArticle | null>(null);

  useEffect(() => {
    fetch(`/api/admin/seo-articles?tenantId=${DEFAULT_TENANT_ID}`)
      .then((res) => res.json())
      .then((json: { data: SeoArticle[] | null }) => {
        setArticles(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleApprove(articleId: string) {
    await fetch(`/api/admin/seo-articles/${articleId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: DEFAULT_TENANT_ID }),
    });
    setArticles((prev) =>
      prev.map((a) =>
        a.id === articleId ? { ...a, status: 'published' as const } : a
      )
    );
  }

  async function handleReject(articleId: string) {
    await fetch(`/api/admin/seo-articles/${articleId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: DEFAULT_TENANT_ID }),
    });
    setArticles((prev) =>
      prev.map((a) =>
        a.id === articleId ? { ...a, status: 'rejected' as const } : a
      )
    );
  }

  if (loading) {
    return <div className="skeleton h-48 rounded-xl" />;
  }

  const pending = articles.filter((a) => a.status === 'pending_approval');

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-white">
        Pending Approval ({pending.length})
      </h3>
      {pending.length === 0 ? (
        <p className="text-zinc-500">No articles awaiting approval.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((article) => (
            <div
              key={article.id}
              className="flex items-center justify-between rounded-lg border border-admin-border bg-admin-bg p-4"
            >
              <div>
                <p className="font-medium text-white">{article.title}</p>
                <p className="text-sm text-zinc-500">
                  {article.city_slug} · {article.locale.toUpperCase()}
                  {article.ai_generated && ' · AI Generated'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreview(article)}
                  className="rounded-lg border border-admin-border p-2 text-zinc-400 hover:text-white"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleApprove(article.id)}
                  className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 hover:bg-emerald-500/20"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleReject(article.id)}
                  className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-xl border border-admin-border bg-admin-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{preview.title}</h3>
              <button onClick={() => setPreview(null)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div
              className="prose prose-invert max-w-none text-zinc-300"
              dangerouslySetInnerHTML={{ __html: preview.content }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
