import { createAdminClient } from '@/lib/supabase/admin';
import { generateContractPdf } from './contract-pdf.service';
import type { Booking, Contract, Customer } from '@/types/database';

export class ContractService {
  async getByBooking(tenantId: string, bookingId: string): Promise<Contract | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as Contract) ?? null;
  }

  async createForBooking(tenantId: string, bookingId: string): Promise<Contract> {
    const supabase = createAdminClient();

    const existing = await this.getByBooking(tenantId, bookingId);
    if (existing) return existing;

    const storagePath = `${tenantId}/${bookingId}/contract.pdf`;

    const { data: bookingRow } = await supabase
      .from('bookings')
      .select('*, customers(*)')
      .eq('id', bookingId)
      .eq('tenant_id', tenantId)
      .single();

    if (bookingRow) {
      const booking = bookingRow as Booking & { customers: Customer };
      const pdfBytes = await generateContractPdf(booking, booking.customers);
      await supabase.storage.from('contracts').upload(storagePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });
    }

    const { data, error } = await supabase
      .from('contracts')
      .insert({
        tenant_id: tenantId,
        booking_id: bookingId,
        storage_path: storagePath,
        status: 'sent',
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create contract');
    return data as Contract;
  }

  async sign(
    tenantId: string,
    contractId: string,
    signatureData: Record<string, unknown>
  ): Promise<Contract> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('contracts')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
        signature_data: signatureData,
      })
      .eq('id', contractId)
      .eq('tenant_id', tenantId)
      .in('status', ['draft', 'sent'])
      .select()
      .single();

    if (error || !data) throw new Error('Contract not found or already signed');

    const { eventBus } = await import('@/domain/events/event-bus');
    const { EVENT_TYPES } = await import('@/domain/events/event.types');

    await eventBus.publish({
      tenantId,
      eventType: EVENT_TYPES.CONTRACT_SIGNED,
      aggregateId: contractId,
      aggregateType: 'contract',
      payload: { contractId, bookingId: (data as Contract).booking_id },
      idempotencyKey: `contract.signed:${contractId}`,
    });

    return data as Contract;
  }

  async getSignedUrl(tenantId: string, contractId: string): Promise<string> {
    const supabase = createAdminClient();
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('storage_path')
      .eq('id', contractId)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !contract) throw new Error('Contract not found');

    const { data: urlData, error: urlError } = await supabase.storage
      .from('contracts')
      .createSignedUrl((contract as { storage_path: string }).storage_path, 3600);

    if (urlError || !urlData?.signedUrl) {
      throw new Error('Failed to generate contract URL');
    }
    return urlData.signedUrl;
  }
}

export const contractService = new ContractService();
