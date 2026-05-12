import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/drive.file",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, account, profile }) {
      if (account?.provider === "google") {
        if (profile?.sub) {
          token.sub = profile.sub;
        }
        if (account.access_token) {
          token.accessToken = account.access_token;
        }
        if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
        }
        if (account.expires_at) {
          token.tokenExpiry = account.expires_at;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      session.accessToken = typeof token.accessToken === "string" ? token.accessToken : "";
      session.refreshToken = typeof token.refreshToken === "string" ? token.refreshToken : "";
      session.tokenExpiry = typeof token.tokenExpiry === "number" ? token.tokenExpiry : 0;
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});
