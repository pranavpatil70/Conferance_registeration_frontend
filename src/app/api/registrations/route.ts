import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import validator from 'validator';

export async function POST(request: NextRequest) {
  try {
    const { name, email, registration_type, company, phone } = await request.json();

    // Validation
    if (!name || !email || !registration_type) {
      return NextResponse.json(
        { error: 'Name, email, and registration type are required' },
        { status: 400 }
      );
    }

    if (!validator.isEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (!['student', 'professional'].includes(registration_type)) {
      return NextResponse.json(
        { error: 'Registration type must be either student or professional' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('registrations')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is no rows found
      throw checkError;
    }

    if (existing) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 409 });
    }

    // Insert into database
    const { data, error } = await supabase
      .from('registrations')
      .insert([
        {
          name,
          email,
          registration_type,
          company: company || null,
          phone: phone || null
        }
      ])
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      id: data.id
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const order = searchParams.get('order') || 'DESC';
    const checkEmail = searchParams.get('checkEmail');

    // Handle email availability check
    if (checkEmail) {
      const { data: existing, error: checkError } = await supabase
        .from('registrations')
        .select('id')
        .eq('email', checkEmail)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is no rows found
        throw checkError;
      }

      return NextResponse.json({
        available: !existing
      });
    }

    let query = supabase
      .from('registrations')
      .select('*');

    // Filter by type if specified
    if (type && ['student', 'professional'].includes(type)) {
      query = query.eq('registration_type', type);
    }

    // Add sorting
    query = query.order(sortBy, { ascending: order === 'ASC' });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Fetch registrations error:', error);
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}