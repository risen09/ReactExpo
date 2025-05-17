import { z } from "zod";

export const UserSchema = z.object({
  _id: z.string(),
  name: z.string(),
  username: z.string(),
  email: z.string().optional(),
  avatar: z.string().nullable().optional(),
  personalityType: z.string().nullable().optional(),
  createdAt: z.string(),
  vkProfile: z.object({
    id: z.number()
  }).optional()
}).superRefine(({email, vkProfile}, ctx) => {
  if (!email && !vkProfile) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Email or vkProfile is required"
    })
  }
});

export type User = z.infer<typeof UserSchema>;