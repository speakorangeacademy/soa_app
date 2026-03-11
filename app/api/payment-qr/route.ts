import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { qrSchema } from '@/types/qr';

export async function GET() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('payment_qr')
        .select('*')
        .order('uploaded_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Attach public URLs
    const formattedData = data.map(qr => ({
        ...qr,
        public_url: supabase.storage.from('payment-qr').getPublicUrl(qr.qr_image_path).data.publicUrl
    }));

    return NextResponse.json(formattedData);
}

export async function POST(request: Request) {
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
        const formData = await request.formData();
        const label = formData.get('qr_label') as string;
        const file = formData.get('file') as File;

        // Validate
        qrSchema.parse({ qr_label: label });
        if (!file) return NextResponse.json({ error: 'Please upload a QR image.' }, { status: 400 });

        // File validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Only JPG, PNG, or WEBP files are allowed.' }, { status: 400 });
        }
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 2MB.' }, { status: 400 });
        }

        const qrId = crypto.randomUUID();
        const extension = file.name.split('.').pop();
        const path = `qr/${qrId}.${extension}`;

        // 1. Upload to storage
        const { error: uploadError } = await supabase.storage
            .from('payment-qr')
            .upload(path, file, { upsert: false });

        if (uploadError) {
            return NextResponse.json({ error: 'Unable to upload QR image.' }, { status: 500 });
        }

        // 2. Transaction: Deactivate old and Insert new
        // Note: Since multi-row updates and inserts aren't a true single atomic call in standard JS client without RPC, 
        // we use the partial unique index at the DB level to prevent race conditions, and update sequentially.

        // Deactivate all active
        await supabase.from('payment_qr').update({ is_active: false }).eq('is_active', true);

        // Insert new
        const { data: newQr, error: dbError } = await supabase
            .from('payment_qr')
            .insert({
                qr_id: qrId,
                qr_image_path: path,
                qr_label: label,
                is_active: true,
                uploaded_by: session.user.id
            })
            .select()
            .single();

        if (dbError) {
            // Cleanup storage if DB fails
            await supabase.storage.from('payment-qr').remove([path]);
            return NextResponse.json({ error: 'Unable to activate QR code.' }, { status: 500 });
        }

        return NextResponse.json(newQr);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Invalid request' }, { status: 400 });
    }
}
