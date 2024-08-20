import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { spaces } from "@/server/db/schema";
import { gen_id } from "@/lib/utils";
import { eq } from "drizzle-orm";

export const spaceRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userConvs = await ctx.db.query.spaces.findMany({
      where: (_space, { eq }) => eq(_space.userId, ctx.user),
      orderBy: (_space, { desc }) => [desc(_space.updatedAt)],
      limit: 10,
    });
    return userConvs;
  }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const space = await ctx.db.query.spaces.findFirst({
        where: (_space, { eq, and }) =>
          and(eq(_space.userId, ctx.user), eq(_space.id, input.id)),
      });
      return space ?? null;
    }),
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const id = gen_id();
    const [inserted] = await ctx.db
      .insert(spaces)
      .values({ id, userId: ctx.user })
      .returning();
    return inserted ?? null;
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1),
        summary: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(spaces)
        .set({
          title: input.title,
          summary: input.summary,
        })
        .where(eq(spaces.id, input.id));
    }),
});
