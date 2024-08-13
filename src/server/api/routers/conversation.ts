import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { conversations } from "@/server/db/schema";
import { gen_id } from "@/lib/utils";
import { eq } from "drizzle-orm";

export const conversationRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userConvs = await ctx.db.query.conversations.findMany({
      where: (_conv, { eq }) => eq(_conv.userId, ctx.user),
      orderBy: (_conv, { desc }) => [desc(_conv.updatedAt)],
      limit: 10,
    });
    return userConvs;
  }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const conv = await ctx.db.query.conversations.findFirst({
        where: (_conv, { eq, and }) =>
          and(eq(_conv.userId, ctx.user), eq(_conv.id, input.id)),
      });
      return conv ?? null;
    }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const id = gen_id();
    const [inserted] = await ctx.db
      .insert(conversations)
      .values({ id, userId: ctx.user })
      .returning();
    return inserted ?? null;
  }),
  update: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        title: z.string().min(1),
        summary: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(conversations)
        .set({
          title: input.title,
          summary: input.summary,
        })
        .where(eq(conversations.id, input.conversationId));
    }),
});
