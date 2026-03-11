import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return NextResponse.json({ data: session });
}
