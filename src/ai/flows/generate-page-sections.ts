
'use server';

/**
 * @fileOverview Поток для генерации предлагаемых разделов страницы на основе запроса.
 *
 * - generatePageSections - Функция, которая обрабатывает генерацию разделов страницы.
 * - GeneratePageSectionsInput - Тип входных данных для функции generatePageSections.
 * - GeneratePageSectionsOutput - Тип возвращаемых данных для функции generatePageSections.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePageSectionsInputSchema = z.object({
  prompt: z.string().describe('Запрос, описывающий желаемые разделы страницы.'),
});
export type GeneratePageSectionsInput = z.infer<typeof GeneratePageSectionsInputSchema>;

const GeneratePageSectionsOutputSchema = z.object({
  sections: z
    .array(z.string())
    .describe('Массив предлагаемых разделов страницы на основе запроса.'),
});
export type GeneratePageSectionsOutput = z.infer<typeof GeneratePageSectionsOutputSchema>;

export async function generatePageSections(input: GeneratePageSectionsInput): Promise<GeneratePageSectionsOutput> {
  return generatePageSectionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePageSectionsPrompt',
  input: {schema: GeneratePageSectionsInputSchema},
  output: {schema: GeneratePageSectionsOutputSchema},
  prompt: `Вы — ассистент по веб-дизайну. На основе запроса пользователя вы предложите разделы для веб-страницы.

  Запрос: {{{prompt}}}

  Верните разделы в виде массива строк.`,
});

const generatePageSectionsFlow = ai.defineFlow(
  {
    name: 'generatePageSectionsFlow',
    inputSchema: GeneratePageSectionsInputSchema,
    outputSchema: GeneratePageSectionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
