import { createAdminClient } from '@/lib/supabase/admin';
import type { Contract, ContractStatus } from '@/types/database';
import { eventBus } from '@/domain/events/event-bus';
import { EVENT_TYPES } from '@/domain/events/event.types';

export class ContractService {
  async sign(
    tenantId: string,
    contractId: string,
    signatureData: Record<string, unknown>
  ): Promise<Contract> {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('contracts')
      .update({
        status: 'signed' as ContractStatus,
        signed_at: new Date().toISOString(),
        signature_data: signatureData,
      })
      .eq('id', contractId)
      .eq('tenant_id', tenantId)
      .eq('status', 'sent')
      .select()
      .single();

    if (error || !data) throw new Error('Contract not found or already signed');

    await eventBus.publish({
      tenantId,
      eventType: EVENT_TYPES.CONTRACT_SIGNED,
      aggregateId: contractId,
      aggregateType: 'contract',
      payload: { contractId, bookingId: data.booking_id },
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
      .createSignedUrl(contract.storage_path, 3600);

    if (urlError || !urlData?.signedUrl) {
      throw new Error('Failed to generate contract URL');
    }
    return urlData.signedUrl;
  }
}

export const contractService = new ContractService();
