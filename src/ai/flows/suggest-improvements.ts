
'use server';

/**
 * @fileOverview Предоставляет предложения на основе ИИ для улучшения дизайна и доступности страниц.
 *
 * - suggestImprovements - Функция, которая предлагает улучшения для заданного дизайна страницы.
 * - SuggestImprovementsInput - Тип входных данных для функции suggestImprovements.
 * - SuggestImprovementsOutput - Тип возвращаемых данных для функции suggestImprovements.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestImprovementsInputSchema = z.object({
  htmlCode: z
    .string()
    .describe('HTML-код страницы для улучшения.'),
  cssCode: z.string().describe('CSS-код страницы для улучшения.'),
  pageDescription: z
    .string()
    .optional()
    .describe('Описание страницы и ее назначение.'),
});
export type SuggestImprovementsInput = z.infer<typeof SuggestImprovementsInputSchema>;

const SuggestImprovementsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'Предложения на основе ИИ для улучшения дизайна страницы, включая улучшения доступности.'
    ),
});
export type SuggestImprovementsOutput = z.infer<typeof SuggestImprovementsOutputSchema>;

export async function suggestImprovements(input: SuggestImprovementsInput): Promise<SuggestImprovementsOutput> {
  return suggestImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestImprovementsPrompt',
  input: {schema: SuggestImprovementsInputSchema},
  output: {schema: SuggestImprovementsOutputSchema},
  prompt: `Вы — ИИ-ассистент, который предоставляет предложения по улучшению дизайна и доступности веб-страниц.

  Учитывая следующий HTML и CSS-код, а также необязательное описание страницы, предоставьте предложения по улучшению дизайна и доступности страницы.

  HTML-код:
  {{htmlCode}}

  CSS-код:
  {{cssCode}}

  Описание страницы:
  {{#if pageDescription}}
  {{pageDescription}}
  {{else}}
  Описание страницы не предоставлено.
  {{/if}}
  `,
});

const suggestImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestImprovementsFlow',
    inputSchema: SuggestImprovementsInputSchema,
    outputSchema: SuggestImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
