import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

async function getUser(email: string) {
    await connectToDatabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await User.findOne({ email }).select('+password') as any;
    return user;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;

                    // If user has no password (e.g. created via OAuth), return null
                    if (!user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }) {
            console.log('Session callback:', { tokenSub: token.sub, sessionUser: !!session.user });
            if (token.sub && session.user) {
                // Add user ID and name to session
                // @ts-expect-error - Adding id to session user
                session.user.id = token.sub;
                // @ts-expect-error - Adding name from token
                if (token.name) session.user.name = token.name;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                console.log('JWT callback - user logged in:', user.email);
                // Add user name to token for session
                token.name = user.name;
            }
            return token;
        }
    },
    secret: process.env.AUTH_SECRET, // Explicitly set secret
    session: {
        strategy: 'jwt',
    },
});
