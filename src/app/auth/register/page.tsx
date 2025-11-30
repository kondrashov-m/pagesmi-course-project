
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { PenSquare, UserPlus } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const registerSchema = z.object({
  name: z.string().min(2, "Имя должно содержать не менее 2 символов."),
  email: z.string().email("Неверный формат электронной почты."),
  password: z.string().min(6, "Пароль должен содержать не менее 6 символов."),
  confirmPassword: z.string().min(6, "Подтверждение пароля обязательно."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают.",
  path: ["confirmPassword"], // Поле, к которому применится ошибка
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register, loading: authLoading, user } = useAuth();
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      router.push("/"); // Если пользователь уже вошел, перенаправляем на главную
    }
  }, [user, router]);

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    await register(data.email, data.password, data.name);
  };
  
  if (user) {
     return <div className="flex items-center justify-center min-h-screen bg-background p-4"><p>Перенаправление...</p></div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <PenSquare className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold text-foreground font-headline">Page Forge</span>
          </Link>
          <CardTitle className="text-2xl font-headline">Создать учетную запись</CardTitle>
          <CardDescription>Присоединяйтесь к Page Forge, чтобы начать создавать красивые страницы.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="name">Полное имя</Label>
                    <FormControl>
                      <Input id="name" type="text" placeholder="Ваше имя" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Электронная почта</Label>
                    <FormControl>
                      <Input id="email" type="email" placeholder="vy@primer.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="password">Пароль</Label>
                    <FormControl>
                      <Input id="password" type="password" placeholder="Создайте надежный пароль" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                    <FormControl>
                      <Input id="confirm-password" type="password" placeholder="Подтвердите ваш пароль" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? "Регистрация..." : <><UserPlus className="mr-2 h-4 w-4" /> Зарегистрироваться</>}
              </Button>
              <p className="text-sm text-muted-foreground">
                Уже есть учетная запись?{" "}
                <Link href="/auth/login" className="font-medium text-primary hover:underline">
                  Войдите здесь
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
