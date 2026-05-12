import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Google sub claim — stable, not email
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, account, profile }) {
      // On first sign-in, capture the stable sub claim from Google
      if (account?.provider === "google" && profile?.sub) {
        token.sub = profile.sub;
      }
      return token;
    },
    session({ session, token }) {
      // Expose sub as session.user.id so callers never depend on email
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});
