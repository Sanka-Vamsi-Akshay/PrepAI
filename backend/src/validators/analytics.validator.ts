import { z } from 'zod';

export const getPerformanceQuerySchema = z.object({
  query: z.object({
    days: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return 7;
        const parsed = parseInt(val, 10);
        if (parsed === 7 || parsed === 30 || parsed === 90) return parsed;
        return 7;
      }),
  }),
});

export const getOverviewQuerySchema = z.object({
  query: z.object({
    refresh: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
  }),
});

export type GetPerformanceQueryInput = z.infer<typeof getPerformanceQuerySchema>;
export type GetOverviewQueryInput = z.infer<typeof getOverviewQuerySchema>;
