import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('payment_qr')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json(null);
    }

    const publicUrl = supabase.storage.from('payment-qr').getPublicUrl(data.qr_image_path).data.publicUrl;

    return NextResponse.json({ ...data, public_url: publicUrl });
}
