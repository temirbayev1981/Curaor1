'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { SeoArticle } from '@/types/database';

export function SeoArticleManager() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<SeoArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<SeoArticle | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/seo-articles')
      .then((res) => res.json())
      .then((json: { data: SeoArticle[] | null }) => {
        setArticles(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleApprove(articleId: string) {
    setActionLoading(articleId);
    await fetch(`/api/admin/seo-articles/${articleId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    setArticles((prev) =>
      prev.map((a) =>
        a.id === articleId ? { ...a, status: 'published' as const } : a
      )
    );
    setActionLoading(null);
  }

  async function handleReject(articleId: string) {
    setActionLoading(articleId);
    await fetch(`/api/admin/seo-articles/${articleId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    setArticles((prev) =>
      prev.map((a) =>
        a.id === articleId ? { ...a, status: 'rejected' as const } : a
      )
    );
    setActionLoading(null);
  }

  if (loading) {
    return <div className="skeleton h-48 rounded-xl" />;
  }

  const pending = articles.filter((a) => a.status === 'pending_approval');

  return (
    <div className="rounded-2xl border border-admin-border bg-admin-surface p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <FileText className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">
            {t('admin.seo.pendingApproval')}
          </h3>
          <p className="text-sm text-zinc-500">
            {t('admin.seo.articleCount', { count: pending.length })}
          </p>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <FileText className="mb-3 h-10 w-10 text-zinc-600" />
          <p className="text-zinc-500">{t('admin.seo.noPending')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col gap-4 rounded-xl border border-admin-border bg-admin-bg p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{article.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-zinc-500">
                    {article.city_slug} · {article.locale.toUpperCase()}
                  </span>
                  {article.ai_generated && (
                    <Badge variant="info">{t('admin.seo.aiGenerated')}</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreview(article)}
                  title={t('admin.seo.preview')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(article.id)}
                  loading={actionLoading === article.id}
                  title={t('admin.seo.approve')}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleReject(article.id)}
                  loading={actionLoading === article.id}
                  title={t('admin.seo.reject')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl border border-admin-border bg-admin-surface p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">{preview.title}</h3>
                <button
                  onClick={() => setPreview(null)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div
                className="prose prose-invert max-w-none text-zinc-300"
                dangerouslySetInnerHTML={{ __html: preview.content }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
