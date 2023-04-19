// import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

import { filterUserForClient } from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
    getUserByUsername: publicProcedure.input(z.object({
        username: z.string()
    })).query(async ({ input }) => {
        const [user] = await clerkClient.users.getUserList({ username: [input.username] });

        if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

        return filterUserForClient(user);
    }),
});
