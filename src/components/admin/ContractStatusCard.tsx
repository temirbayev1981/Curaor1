'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';
import type { Contract } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function ContractStatusCard({ bookingId }: { bookingId: string }) {
  const { t, i18n } = useTranslation();
  const [contract, setContract] = useState<Contract | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const dateLocale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';

  useEffect(() => {
    fetch(`/api/admin/bookings/${bookingId}/contract`)
      .then(async (res) => {
        const json = (await res.json()) as {
          data: { contract: Contract | null; downloadUrl: string | null } | null;
          error: { message: string } | null;
        };
        if (!res.ok || json.error) {
          setError(json.error?.message ?? t('admin.contract.fetchError'));
          setLoading(false);
          return;
        }
        setContract(json.data?.contract ?? null);
        setDownloadUrl(json.data?.downloadUrl ?? null);
        setLoading(false);
      })
      .catch(() => {
        setError(t('admin.contract.fetchError'));
        setLoading(false);
      });
  }, [bookingId, t]);

  if (loading) return <div className="skeleton h-32 rounded-xl" />;

  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-400">{error}</p>
      </Card>
    );
  }

  if (!contract) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-zinc-500">
          <FileText className="h-5 w-5" />
          <p className="text-sm">{t('admin.contract.none')}</p>
        </div>
      </Card>
    );
  }

  const statusVariant =
    contract.status === 'signed'
      ? 'success'
      : contract.status === 'sent'
        ? 'warning'
        : 'default';

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="mb-2 flex items-center gap-2 font-semibold text-white">
            <FileText className="h-5 w-5 text-emerald-400" />
            {t('admin.contract.title')}
          </h2>
          <Badge variant={statusVariant}>{t(`admin.contract.status.${contract.status}`)}</Badge>
          {contract.signed_at && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              {t('admin.contract.signedAt', {
                date: new Date(contract.signed_at).toLocaleString(dateLocale),
              })}
            </p>
          )}
          {!contract.signed_at && contract.status === 'sent' && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-amber-400">
              <Clock className="h-4 w-4" />
              {t('admin.contract.awaitingSignature')}
            </p>
          )}
        </div>
        {downloadUrl && (
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4" />
              {t('admin.contract.download')}
            </Button>
          </a>
        )}
      </div>
    </Card>
  );
}
