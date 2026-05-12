import "next-auth";
import "@auth/core/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Google sub claim — stable, not email
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken: string;
    refreshToken: string;
    tokenExpiry: number;
  }
}

// next-auth/jwt re-exports from @auth/core/jwt; augment the source to avoid
// re-export boundary issues with TypeScript module augmentation.
declare module "@auth/core/jwt" {
  interface JWT {
    sub?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiry?: number;
  }
}
