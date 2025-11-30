
"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
// import { auth } from "@/lib/firebase"; // Firebase import removed
// import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"; // Firebase imports removed

// Клиентский тип пользователя (без пароля)
export interface AppUser {
  id: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false); // Initially false, true during API calls
  const router = useRouter();
  const { toast } = useToast();

  // useEffect(() => {
  //   // Optional: Check for user session from localStorage on initial load
  //   // const storedUser = localStorage.getItem('appUser');
  //   // if (storedUser) {
  //   //   setUser(JSON.parse(storedUser));
  //   // }
  //   // setLoading(false);
  // }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Не удалось войти в систему.");
      }

      const loggedInUser: AppUser = {
        id: result.user.id,
        email: result.user.email,
        displayName: result.user.displayName,
      };
      setUser(loggedInUser);
      // localStorage.setItem('appUser', JSON.stringify(loggedInUser)); // Optional: persist user
      toast({ title: "Успешный вход", description: "Добро пожаловать!" });
      router.push("/");
    } catch (error: any) {
      console.error("Ошибка входа:", error);
      toast({ variant: "destructive", title: "Ошибка входа", description: error.message || "Не удалось войти. Проверьте данные." });
      setUser(null);
      // localStorage.removeItem('appUser'); // Optional: clear persisted user
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, displayName: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', { // Using admin endpoint for creation
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, displayName }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Не удалось зарегистрироваться.");
      }
      
      toast({ title: "Регистрация успешна", description: "Теперь вы можете войти." });
      router.push("/auth/login");
    } catch (error: any) {
      console.error("Ошибка регистрации:", error);
      toast({ variant: "destructive", title: "Ошибка регистрации", description: error.message || "Не удалось зарегистрироваться." });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    // localStorage.removeItem('appUser'); // Optional: clear persisted user
    toast({ title: "Выход выполнен", description: "Вы успешно вышли из системы." });
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return context;
}
