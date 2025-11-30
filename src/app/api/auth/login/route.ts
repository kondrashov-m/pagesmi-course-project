
import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/users';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email и пароль обязательны" }, { status: 400 });
    }

    const user = findUserByEmail(email);

    if (!user) {
      return NextResponse.json({ message: "Пользователь с таким email не найден" }, { status: 404 });
    }

    // ВНИМАНИЕ: Сравнение паролей в открытом виде - НЕБЕЗОПАСНО для продакшена!
    // В реальном приложении используйте хеширование (например, bcrypt.compare)
    if (user.password !== password) {
      return NextResponse.json({ message: "Неверный пароль" }, { status: 401 });
    }

    // Аутентификация успешна, но сессии/токены не создаются, так как общая аутентификация отключена
    // Возвращаем только информацию о пользователе (без пароля)
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ success: true, message: "Вход в систему выполнен успешно", user: userWithoutPassword });

  } catch (error) {
    console.error("Error in POST /api/auth/login:", error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: "Неверный формат запроса (JSON)" }, { status: 400 });
    }
    return NextResponse.json({ message: "Ошибка сервера при входе в систему" }, { status: 500 });
  }
}
