// import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import type { Post } from "@prisma/client";

const addUserDataToPosts = async (posts: Post[]) => {
    const users = (await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
    })).map(filterUserForClient);

    return posts.map(post => {
        const author = users.find(user => user.id === post.authorId);

        if (!author || !author.username) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Author for post not found" })

        return {
            post,
            author: {
                ...author,
                username: author.username,
            },
        }
    });
}
// Create a new ratelimiter, that allows 4 requests per minute
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(4, "1 m"),
    analytics: true,
});

export const postsRouter = createTRPCRouter({
    getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        const post = await ctx.prisma.post.findUnique({ where: { id: input.id } });

        if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

        return (await addUserDataToPosts([post]))[0];
    }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
            orderBy: [{
                createdAt: "desc",
            }]
        });
        return addUserDataToPosts(posts);
    }),
    getPostsByUserId: publicProcedure.input(z.object({ userId: z.string() })).query(({ ctx, input }) => ctx.prisma.post.findMany({
        where: {
            authorId: input.userId,
        },
        take: 100,
        orderBy: [{ createdAt: "desc", }],

    }).then(addUserDataToPosts)),

    create: privateProcedure.input(z.object({
        content: z.string().emoji('Only emojis are allowed!').min(1).max(280),
    })).mutation(async ({ ctx, input }) => {
        const authorId = ctx.userId;
        const { success } = await ratelimit.limit(authorId);

        if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "You are posting too fast" });

        const post = await ctx.prisma.post.create({
            data: {
                authorId,
                content: input.content,
            },
        });
        return post;
    }),
});