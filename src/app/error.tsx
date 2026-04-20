'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-16 h-16 text-red-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            Произошла ошибка
          </h1>
          <p className="text-white/60">
            Извините, что-то пошло не так. Пожалуйста, попробуйте снова.
          </p>
          {error.message && (
            <p className="text-sm text-red-400/80 mt-4 font-mono">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={reset}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Попробовать снова
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="flex-1"
          >
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
}
