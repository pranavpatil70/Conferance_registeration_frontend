import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { count: total, error: totalError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true });

    const { count: students, error: studentError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('registration_type', 'student');

    const { count: professionals, error: professionalError } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('registration_type', 'professional');

    if (totalError || studentError || professionalError) {
      throw totalError || studentError || professionalError;
    }

    return NextResponse.json({
      success: true,
      data: {
        total,
        students,
        professionals
      }
    });
  } catch (error) {
    console.error('Statistics error:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}