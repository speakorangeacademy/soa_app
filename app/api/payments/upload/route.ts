import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = createClient();

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const student_id = formData.get('student_id') as string;

        if (!file || !student_id) {
            return NextResponse.json({ error: 'Missing file or student ID' }, { status: 400 });
        }

        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Only JPG, PNG, or WEBP files are allowed' }, { status: 400 });
        }
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'Screenshot must be under 5MB' }, { status: 400 });
        }

        const paymentId = crypto.randomUUID();
        const extension = file.name.split('.').pop();
        const path = `${student_id}/${paymentId}.${extension}`;

        const { error: uploadError } = await supabase.storage
            .from('payment-screenshots')
            .upload(path, file, { upsert: false });

        if (uploadError) {
            console.error('Upload API error:', uploadError);
            return NextResponse.json({ error: 'Storage service failure' }, { status: 500 });
        }

        return NextResponse.json({ success: true, path });

    } catch (error: any) {
        console.error('Upload API system error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
