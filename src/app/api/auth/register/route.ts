import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    // Walidacja danych wejściowych
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Wszystkie pola są wymagane' },
        { status: 400 }
      );
    }

    // Hashowanie hasła
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Sprawdzenie czy email jest już zajęty
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Użytkownik z tym adresem email już istnieje' },
        { status: 409 }
      );
    }

    // Tworzenie nowego użytkownika używając funkcji RPC
    const { data: newUser, error } = await supabase.rpc('register_user', {
      user_email: email,
      user_password_hash: passwordHash,
      user_first_name: firstName,
      user_last_name: lastName
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Błąd podczas tworzenia konta' },
        { status: 500 }
      );
    }

    // Funkcja RPC zwraca tablicę, więc bierzemy pierwszy element
    const userData = newUser[0];

    // Zwracanie danych użytkownika (bez hasła)
    return NextResponse.json({
      message: 'Konto zostało utworzone pomyślnie',
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        createdAt: userData.created_at,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas rejestracji' },
      { status: 500 }
    );
  }
}
