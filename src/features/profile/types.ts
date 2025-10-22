import { z } from 'zod';

export type Profile = {
  firstName: string;
  lastName: string;
  displayName: string;
  handle: string; // @handle
  email: string; // read-only
  phone?: string;
  bio?: string; // <= 240
  timezone: string;
  locale: string;
  school?: string;
  program?: string;
  graduationYear?: number;
  socials?: { github?: string; linkedin?: string; website?: string };
  avatarUrl?: string;
  coverUrl?: string;
};

export type Preferences = {
  emailReminders: boolean;
  pushReminders: boolean;
  calendar: { autoImportIcs: boolean; showCategoryColors: boolean };
  grades: { showWeighted: boolean };
  categoryColors: string[]; // hex strings
};

export type SecurityState = {
  has2FA: boolean;
  sessions: Array<{ id: string; agent: string; ip: string; lastActive: string }>;
  recoveryCodes?: string[];
};

export type Connections = {
  google: boolean;
  outlook: boolean;
  brightspace: boolean;
};

export const profileSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  displayName: z.string().min(1, 'Required'),
  handle: z.string().regex(/^@[a-zA-Z0-9_]{2,16}$/g, 'Use @handle (letters, numbers, _)'),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().max(240, 'Max 240 characters').optional(),
  timezone: z.string().min(1, 'Select a time zone'),
  locale: z.string().min(1, 'Select a locale'),
  school: z.string().optional(),
  program: z.string().optional(),
  graduationYear: z
    .preprocess((v) => (v === '' || v == null ? undefined : Number(v)), z.number().int().min(1900).max(2100))
    .optional(),
  socials: z
    .object({
      github: z.string().url().optional().or(z.literal('')),
      linkedin: z.string().url().optional().or(z.literal('')),
      website: z.string().url().optional().or(z.literal('')),
    })
    .optional(),
  avatarUrl: z.string().optional(),
  coverUrl: z.string().optional(),
});

export const preferencesSchema = z.object({
  emailReminders: z.boolean(),
  pushReminders: z.boolean(),
  calendar: z.object({ autoImportIcs: z.boolean(), showCategoryColors: z.boolean() }),
  grades: z.object({ showWeighted: z.boolean() }),
  categoryColors: z.array(z.string()).min(3).max(6),
});

export const passwordSchema = z
  .object({
    current: z.string().min(6),
    next: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, 'Use upper, lower, and a number'),
    confirm: z.string().min(8),
  })
  .refine((vals) => vals.next === vals.confirm, {
    path: ['confirm'],
    message: 'Passwords do not match',
  });

