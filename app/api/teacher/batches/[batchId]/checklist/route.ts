import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Manage Batch Checklist API
 * GET: Fetch checklist for a batch.
 * POST: Upsert checklist items for a batch.
 */

export async function GET(
    request: Request,
    { params }: { params: { batchId: string } }
) {
    const { batchId } = params;
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Security check handled by RLS on batch_checklists
        const { data: checklist, error } = await supabase
            .from('batch_checklists')
            .select('*')
            .eq('batch_id', batchId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Fetch Checklist Error:', error);
            return NextResponse.json({ error: 'Unable to load checklist.' }, { status: 500 });
        }

        return NextResponse.json(checklist || { batch_id: batchId, item_values: {} });

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { batchId: string } }
) {
    const { batchId } = params;
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { item_values } = await request.json();

        if (!item_values || typeof item_values !== 'object') {
            return NextResponse.json({ error: 'Invalid checklist data.' }, { status: 400 });
        }

        // Upsert checklist
        const { error: dbError } = await supabase
            .from('batch_checklists')
            .upsert({
                batch_id: batchId,
                item_values,
                updated_at: new Date().toISOString(),
                updated_by: user.id
            }, { onConflict: 'batch_id' });

        if (dbError) {
            console.error('Upsert Checklist Error:', dbError);
            return NextResponse.json({ error: 'Checklist update failed. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Checklist updated successfully.' });

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
