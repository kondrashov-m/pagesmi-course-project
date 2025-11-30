
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { PenSquare, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader>
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <PenSquare className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold text-foreground font-headline">PagesMi</span>
          </Link>
          <CardTitle className="flex items-center justify-center text-2xl font-headline">
            <ShieldAlert className="mr-2 h-6 w-6 text-destructive" />
            Аутентификация отключена
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>
            Функция сброса пароля в данный момент недоступна.
          </CardDescription>
          <Button variant="outline" asChild>
            <Link href="/">
              Вернуться на главную
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
