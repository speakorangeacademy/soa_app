import { createAdminClient } from './supabase/admin';
import { createClient } from './supabase/server';
import { NextResponse } from 'next/server';

/**
 * Valid Action and Entity Types for Audit Logging
 */
export type AuditActionType =
    | 'PAYMENT_APPROVED'
    | 'PAYMENT_REJECTED'
    | 'BATCH_ALLOCATED'
    | 'BATCH_REALLOCATED'
    | 'RECEIPT_GENERATED'
    | 'RECEIPT_CANCELLED'
    | 'TEACHER_ASSIGNED'
    | 'STUDENT_PROFILE_UPDATED'
    | 'BATCH_STATUS_AUDIT_CORRECTION';

export type AuditEntityType = 'payment' | 'receipt' | 'batch' | 'student' | 'teacher' | 'enrollment';

interface AuditLogParams {
    userId: string;
    actionType: AuditActionType;
    entityType: AuditEntityType;
    entityId: string;
    details?: Record<string, any>;
}

/**
 * Core Audit Logging Function
 * Runs in background (non-blocking) using admin client to bypass RLS.
 */
export async function logAudit({
    userId,
    actionType,
    entityType,
    entityId,
    details
}: AuditLogParams) {
    const adminSupabase = createAdminClient();

    try {
        const { error } = await adminSupabase.from('audit_logs').insert({
            user_id: userId,
            action_type: actionType,
            entity_type: entityType,
            entity_id: entityId,
            details: details || {}
        });

        if (error) {
            console.error('[AUDIT_LOG_ERROR]: Failed to insert audit log:', error);
        }
    } catch (err) {
        console.error('[AUDIT_LOG_CRITICAL]: Exception during audit logging:', err);
    }
}

/**
 * Higher-Order Function for Route Handlers
 * Automatically logs audit entries on successful responses.
 */
export function withAuditLogging(
    handler: (req: Request, context: any) => Promise<NextResponse>,
    config: {
        actionType: AuditActionType | ((request: Request, responseData: any) => AuditActionType | Promise<AuditActionType>);
        entityType: AuditEntityType;
        entityIdResolver: (request: Request, responseData: any) => string | Promise<string>;
        detailsResolver?: (request: Request, responseData: any) => Record<string, any> | Promise<Record<string, any>>;
    }
) {
    return async (req: Request, context: any) => {
        const supabase = createClient();

        // 1. Authenticate Session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized access. Please login again.' }, { status: 401 });
        }

        const role = user.app_metadata?.app_role;
        if (role !== 'Admin' && role !== 'Super Admin') {
            return NextResponse.json({ error: 'You do not have permission to perform this action.' }, { status: 403 });
        }

        // 2. Execute Original Handler
        try {
            const response = await handler(req, context);

            // 3. Log Audit if Success (2xx)
            if (response.ok) {
                // We read the response body as JSON to pass it to resolvers
                const responseClone = response.clone();
                let responseData = {};
                try {
                    responseData = await responseClone.json();
                } catch (e) {
                    // Not JSON or empty body
                }

                // Non-blocking log
                (async () => {
                    try {
                        const entityId = await config.entityIdResolver(req, responseData);
                        const details = config.detailsResolver ? await config.detailsResolver(req, responseData) : {};
                        const actionType = typeof config.actionType === 'function'
                            ? await config.actionType(req, responseData)
                            : config.actionType;

                        await logAudit({
                            userId: user.id,
                            actionType,
                            entityType: config.entityType,
                            entityId,
                            details: {
                                ...details,
                                _client_info: {
                                    role,
                                    ua: req.headers.get('user-agent'),
                                    ip: req.headers.get('x-forwarded-for')
                                }
                            }
                        });
                    } catch (err) {
                        console.error('[AUDIT_WRAPPER_ERROR]:', err);
                    }
                })();
            }

            return response;

        } catch (err: any) {
            console.error('[AUDIT_HANDLER_ERROR]:', err);
            return NextResponse.json({ error: 'System error. Please try again later.' }, { status: 500 });
        }
    };
}
