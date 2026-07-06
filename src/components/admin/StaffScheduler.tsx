'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, DollarSign, Plus, Trash2, Users } from 'lucide-react';
import type { Booking, StaffMember } from '@/types/database';
import type { ShiftWithMember, StaffPeriodSummary } from '@/domain/staff/staff.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export function StaffScheduler() {
  const { t } = useTranslation();
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<ShiftWithMember[]>([]);
  const [summary, setSummary] = useState<StaffPeriodSummary>({
    totalHours: 0,
    totalPay: 0,
    shiftCount: 0,
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [newMember, setNewMember] = useState({
    fullName: '',
    role: 'bartender',
    hourlyRate: '18',
  });

  const [newShift, setNewShift] = useState({
    staffMemberId: '',
    bookingId: '',
    shiftStart: '',
    shiftEnd: '',
    notes: '',
  });

  const formatCurrency = useMemo(
    () => (n: number) =>
      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n),
    []
  );

  const loadData = useCallback(async () => {
    try {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const [membersRes, shiftsRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/staff/members'),
        fetch(`/api/admin/staff/shifts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
        fetch('/api/admin/bookings'),
      ]);

      const membersJson = (await membersRes.json()) as { data: StaffMember[] | null };
      const shiftsJson = (await shiftsRes.json()) as {
        data: { shifts: ShiftWithMember[]; summary: StaffPeriodSummary } | null;
      };
      const bookingsJson = (await bookingsRes.json()) as { data: Booking[] | null };

      setMembers(membersJson.data ?? []);
      setShifts(shiftsJson.data?.shifts ?? []);
      setSummary(
        shiftsJson.data?.summary ?? { totalHours: 0, totalPay: 0, shiftCount: 0 }
      );
      setBookings(bookingsJson.data ?? []);
    } catch {
      setError(t('admin.staff.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const [membersRes, shiftsRes, bookingsRes] = await Promise.all([
          fetch('/api/admin/staff/members'),
          fetch(`/api/admin/staff/shifts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
          fetch('/api/admin/bookings'),
        ]);

        if (cancelled) return;

        const membersJson = (await membersRes.json()) as { data: StaffMember[] | null };
        const shiftsJson = (await shiftsRes.json()) as {
          data: { shifts: ShiftWithMember[]; summary: StaffPeriodSummary } | null;
        };
        const bookingsJson = (await bookingsRes.json()) as { data: Booking[] | null };

        setMembers(membersJson.data ?? []);
        setShifts(shiftsJson.data?.shifts ?? []);
        setSummary(
          shiftsJson.data?.summary ?? { totalHours: 0, totalPay: 0, shiftCount: 0 }
        );
        setBookings(bookingsJson.data ?? []);
      } catch {
        if (!cancelled) setError(t('admin.staff.fetchError'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [t]);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/admin/staff/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: newMember.fullName,
        role: newMember.role,
        hourlyRate: Number(newMember.hourlyRate),
      }),
    });
    if (res.ok) {
      setNewMember({ fullName: '', role: 'bartender', hourlyRate: '18' });
      await loadData();
    }
    setSaving(false);
  }

  async function addShift(e: React.FormEvent) {
    e.preventDefault();
    if (!newShift.staffMemberId || !newShift.shiftStart || !newShift.shiftEnd) return;
    setSaving(true);
    const res = await fetch('/api/admin/staff/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staffMemberId: newShift.staffMemberId,
        bookingId: newShift.bookingId || null,
        shiftStart: new Date(newShift.shiftStart).toISOString(),
        shiftEnd: new Date(newShift.shiftEnd).toISOString(),
        notes: newShift.notes || undefined,
      }),
    });
    if (res.ok) {
      setNewShift({
        staffMemberId: '',
        bookingId: '',
        shiftStart: '',
        shiftEnd: '',
        notes: '',
      });
      await loadData();
    }
    setSaving(false);
  }

  async function removeShift(shiftId: string) {
    setSaving(true);
    await fetch(`/api/admin/staff/shifts/${shiftId}`, { method: 'DELETE' });
    await loadData();
    setSaving(false);
  }

  if (loading) {
    return <div className="skeleton h-64 rounded-xl" />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <Users className="h-8 w-8 text-emerald-400" />
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              {t('admin.staff.activeMembers')}
            </p>
            <p className="text-2xl font-bold text-white">
              {members.filter((m) => m.is_active).length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <Clock className="h-8 w-8 text-emerald-400" />
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              {t('admin.staff.monthHours')}
            </p>
            <p className="text-2xl font-bold text-white">{summary.totalHours.toFixed(1)}h</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <DollarSign className="h-8 w-8 text-emerald-400" />
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              {t('admin.staff.monthPay')}
            </p>
            <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalPay)}</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-white">{t('admin.staff.addMember')}</h2>
          <form onSubmit={addMember} className="space-y-3">
            <Input
              required
              value={newMember.fullName}
              onChange={(e) => setNewMember((s) => ({ ...s, fullName: e.target.value }))}
              placeholder={t('admin.staff.memberName')}
            />
            <Input
              value={newMember.role}
              onChange={(e) => setNewMember((s) => ({ ...s, role: e.target.value }))}
              placeholder={t('admin.staff.memberRole')}
            />
            <Input
              type="number"
              min="0"
              step="0.5"
              required
              value={newMember.hourlyRate}
              onChange={(e) => setNewMember((s) => ({ ...s, hourlyRate: e.target.value }))}
              placeholder={t('admin.staff.hourlyRate')}
            />
            <Button type="submit" loading={saving} className="w-full">
              <Plus className="h-4 w-4" />
              {t('admin.staff.addMember')}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-white">{t('admin.staff.addShift')}</h2>
          <form onSubmit={addShift} className="space-y-3">
            <select
              required
              value={newShift.staffMemberId}
              onChange={(e) => setNewShift((s) => ({ ...s, staffMemberId: e.target.value }))}
              className="w-full rounded-lg border border-admin-border bg-admin-bg px-3 py-2 text-sm text-white"
            >
              <option value="">{t('admin.staff.selectMember')}</option>
              {members
                .filter((m) => m.is_active)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} — ${Number(m.hourly_rate).toFixed(2)}/h
                  </option>
                ))}
            </select>
            <select
              value={newShift.bookingId}
              onChange={(e) => setNewShift((s) => ({ ...s, bookingId: e.target.value }))}
              className="w-full rounded-lg border border-admin-border bg-admin-bg px-3 py-2 text-sm text-white"
            >
              <option value="">{t('admin.staff.noBooking')}</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {new Date(b.booking_start).toLocaleDateString()} — {b.venue_city}
                </option>
              ))}
            </select>
            <Input
              type="datetime-local"
              required
              value={newShift.shiftStart}
              onChange={(e) => setNewShift((s) => ({ ...s, shiftStart: e.target.value }))}
            />
            <Input
              type="datetime-local"
              required
              value={newShift.shiftEnd}
              onChange={(e) => setNewShift((s) => ({ ...s, shiftEnd: e.target.value }))}
            />
            <Button type="submit" loading={saving} className="w-full">
              {t('admin.staff.addShift')}
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 font-semibold text-white">{t('admin.staff.shiftsThisMonth')}</h2>
        {shifts.length === 0 ? (
          <p className="text-sm text-zinc-500">{t('admin.staff.noShifts')}</p>
        ) : (
          <div className="space-y-2">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-admin-border bg-admin-bg px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-white">{shift.member.full_name}</p>
                  <p className="text-zinc-400">
                    {new Date(shift.shift_start).toLocaleString()} —{' '}
                    {new Date(shift.shift_end).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-zinc-300">
                    {shift.hours}h · {formatCurrency(shift.pay)}
                  </span>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={saving}
                    onClick={() => removeShift(shift.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
