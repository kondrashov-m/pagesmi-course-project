
import { NextResponse } from 'next/server';
import { getAllUsers, deleteUserById, findUserById, createUser, updateUserPassword, findUserByEmail } from '@/lib/users';

export async function GET() {
  try {
    const users = getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json({ message: "Ошибка сервера при получении пользователей" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, displayName, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Email и пароль обязательны" }, { status: 400 });
    }
    
    const existingUser = findUserByEmail(email);
    if (existingUser) {
        return NextResponse.json({ message: "Пользователь с таким email уже существует" }, { status: 409 });
    }

    const newUser = createUser({ email, displayName, password });
    if (newUser) {
      return NextResponse.json({ success: true, message: "Пользователь успешно создан", user: {id: newUser.id, email: newUser.email, displayName: newUser.displayName} }, { status: 201 });
    } else {
      // If createUser returns null, log more details
      const stillExistingUser = findUserByEmail(email);
      if (stillExistingUser) {
        console.error(`Admin API POST: createUser returned null, but user ${email} was found by findUserByEmail. This indicates a duplicate.`);
        return NextResponse.json({ message: "Пользователь с таким email уже существует." }, { status: 409 });
      } else {
        console.error(`Admin API POST: createUser returned null for ${email}, but user was NOT found by findUserByEmail. Unknown reason for createUser failure.`);
        return NextResponse.json({ message: "Не удалось создать пользователя по неизвестной причине на сервере." }, { status: 500 });
      }
    }
  } catch (error: any) {
    console.error("Error in POST /api/admin/users:", error.message, error.stack);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: "Неверный формат запроса (JSON)" }, { status: 400 });
    }
    return NextResponse.json({ message: "Ошибка сервера при создании пользователя" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json({ message: "ID пользователя и новый пароль обязательны" }, { status: 400 });
    }
    
    const userExists = findUserById(userId);
    if (!userExists) {
        return NextResponse.json({ message: "Пользователь с таким ID не найден" }, { status: 404 });
    }

    const success = updateUserPassword(userId, newPassword);
    if (success) {
      return NextResponse.json({ success: true, message: "Пароль пользователя успешно обновлен" });
    } else {
      console.error(`Admin API PATCH: updateUserPassword failed for userId ${userId}.`);
      return NextResponse.json({ message: "Не удалось обновить пароль пользователя" }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error in PATCH /api/admin/users:", error.message, error.stack);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: "Неверный формат запроса (JSON)" }, { status: 400 });
    }
    return NextResponse.json({ message: "Ошибка сервера при обновлении пароля" }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ message: "ID пользователя не предоставлен" }, { status: 400 });
    }

    const userExists = findUserById(userId);
    if (!userExists) {
        return NextResponse.json({ message: "Пользователь с таким ID не найден" }, { status: 404 });
    }

    const deleted = deleteUserById(userId);

    if (deleted) {
      return NextResponse.json({ success: true, message: "Пользователь успешно удален" });
    } else {
      console.error(`Admin API DELETE: deleteUserById failed for userId ${userId}.`);
      return NextResponse.json({ success: false, message: "Не удалось удалить пользователя или пользователь не найден" }, { status: 404 });
    }
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/users:", error.message, error.stack);
    return NextResponse.json({ message: "Ошибка сервера при удалении пользователя" }, { status: 500 });
  }
}
