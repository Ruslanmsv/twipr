# Twipr 👽

This is a twitter clone where you can only post emojis(and numbers). Consists of github login, main page, post page and user profile page
Build with [T3 Stack](https://create.t3.gg/).

## Technologies and Integrations

Following technologies and services were used for this project:

- TypeScript
- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [Clerk](https://clerk.com/)
- [Vercel](https://vercel.com/)
- [Upstash](https://upstash.com/)
- [Planetscale](https://planetscale.com/)

## How this project can be improved?

- Showing only 100 posts right now. Try implementing infinite scroll with additional data fetching. Should probably involve some pagination techniques with trpc.
- Make separate deployments for production and development and configure CI
- Test coverage. There are no test right now
- Try integrating and benchmarking Planetscale [database-js](https://github.com/planetscale/database-js) or [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm)
- Better styles? There are some bugs on edge cases right now.
