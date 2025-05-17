import { z } from "zod";

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  avatar: z.string().nullable().optional(),
  personalityType: z.string().nullable().optional(),
  createdAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;