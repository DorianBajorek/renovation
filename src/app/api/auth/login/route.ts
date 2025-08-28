import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Walidacja danych wejściowych
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email i hasło są wymagane' },
        { status: 400 }
      );
    }

    // Pobieranie użytkownika z bazy danych
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name, created_at')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Nieprawidłowy email lub hasło' },
        { status: 401 }
      );
    }

    // Sprawdź czy użytkownik to użytkownik Google (nie ma hasła)
    if (!user.password_hash || user.password_hash === 'google_oauth_user') {
      return NextResponse.json(
        { error: 'To konto zostało utworzone przez Google. Zaloguj się przez Google.' },
        { status: 401 }
      );
    }

    // Weryfikacja hasła
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Nieprawidłowy email lub hasło' },
        { status: 401 }
      );
    }

    // Zwracanie danych użytkownika (bez hasła)
    return NextResponse.json({
      message: 'Logowanie udane',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas logowania' },
      { status: 500 }
    );
  }
}
