
import { NextResponse } from 'next/server';
import { getAllUsers, createUser, updateUser as updateUserAuth, deleteUser as deleteUserAuth, hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const users = getAllUsers();
    // Возвращаем без паролей для безопасности
    const safeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("Ошибка в GET /api/admin/users:", error);
    return NextResponse.json({ error: "Ошибка сервера при получении пользователей" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // Принимаем либо username (email), либо email
    const userEmail = email || username;

    if (!userEmail || !password) {
      return NextResponse.json({ error: "Email и пароль обязательны" }, { status: 400 });
    }
    
    const newUser = await createUser(userEmail, password, userEmail.split('@')[0]);
    return NextResponse.json({ 
      success: true, 
      message: "Пользователь успешно создан", 
      user: { id: newUser.id, email: newUser.email }
    }, { status: 201 });
  } catch (error: any) {
    console.error("Ошибка в POST /api/admin/users:", error.message);
    if (error.message.includes('already exists')) {
      return NextResponse.json({ error: "Пользователь с такой почтой уже существует" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || "Ошибка при создании пользователя" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, password } = body;

    if (!id || !password) {
      return NextResponse.json({ error: "ID и пароль обязательны" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const updatedUser = await updateUserAuth(id, { password: hashedPassword });
    return NextResponse.json({ success: true, message: "Пароль успешно изменён", user: updatedUser });
  } catch (error: any) {
    console.error("Ошибка в PATCH /api/admin/users:", error.message);
    if (error.message.includes('not found')) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || "Ошибка при обновлении пароля" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID пользователя не предоставлен" }, { status: 400 });
    }

    const result = await deleteUserAuth(id);
    return NextResponse.json({ success: true, message: "Пользователь успешно удален" });
  } catch (error: any) {
    console.error("Ошибка в DELETE /api/admin/users:", error.message);
    if (error.message.includes('not found')) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || "Ошибка при удалении пользователя" }, { status: 500 });
  }
}
