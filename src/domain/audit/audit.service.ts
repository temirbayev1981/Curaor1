import { createAdminClient } from '@/lib/supabase/admin';

export interface AuditInput {
  tenantId: string;
  actorId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}

export class AuditService {
  async log(input: AuditInput): Promise<void> {
    const supabase = createAdminClient();
    await supabase.from('audit_logs').insert({
      tenant_id: input.tenantId,
      actor_id: input.actorId ?? null,
      action: input.action,
      resource_type: input.resourceType,
      resource_id: input.resourceId ?? null,
      details: input.details ?? {},
      ip_address: input.ipAddress ?? null,
    });
  }
}

export const auditService = new AuditService();
