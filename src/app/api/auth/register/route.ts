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

    // Hashowanie hasła
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Tworzenie nowego użytkownika
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
      })
      .select('id, email, first_name, last_name, created_at')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Błąd podczas tworzenia konta' },
        { status: 500 }
      );
    }

    // Zwracanie danych użytkownika (bez hasła)
    return NextResponse.json({
      message: 'Konto zostało utworzone pomyślnie',
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        createdAt: newUser.created_at,
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
