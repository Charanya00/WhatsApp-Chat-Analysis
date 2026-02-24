import { z } from 'zod';
import { insertSessionSchema, analysisSessions } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  badRequest: z.object({
    message: z.string(),
  })
};

export const api = {
  chat: {
    upload: {
      method: 'POST' as const,
      path: '/api/chat/upload' as const,
      // Input is FormData (multipart/form-data), handled specially in backend
      responses: {
        200: z.any(), // Returns UploadChatResponse (zod schema too complex for full metrics, using any for now)
        400: errorSchemas.badRequest,
        500: errorSchemas.internal,
      },
    },
  },
  sessions: {
    get: {
      method: 'GET' as const,
      path: '/api/sessions/:id' as const,
      responses: {
        200: z.any(), // Returns GetSessionResponse
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/sessions' as const,
      responses: {
        200: z.array(z.custom<typeof analysisSessions.$inferSelect>()),
      }
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
