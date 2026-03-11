import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { batchSchema } from '@/types/batch';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.app_metadata?.app_role;
    if (role !== 'Super Admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const validatedData = batchSchema.parse(body);

        // Verify capacity constraints
        const { data: currentBatch } = await supabase
            .from('batches')
            .select('current_enrollment_count')
            .eq('batch_id', params.id)
            .single();

        if (currentBatch && validatedData.max_capacity < currentBatch.current_enrollment_count) {
            return NextResponse.json({ error: 'Cannot reduce capacity below current enrollment.' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('batches')
            .update({
                ...validatedData,
                updated_at: new Date().toISOString()
            })
            .eq('batch_id', params.id)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Batch with this name already exists for selected course.' }, { status: 400 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.errors || 'Invalid request body' }, { status: 400 });
    }
}
