import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || process.env.NEON_AUTH_BASE_URL || "http://localhost:3000",
  plugins: [
    organizationClient(),
  ],
});

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role?: string;
  workspaceId?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string | Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  activeOrganizationId?: string | null;
}

export interface SessionData {
  user: User;
  session: Session;
}

export interface UseSessionReturn {
  data: SessionData | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isPending: boolean;
  error: any;
  refetch: () => void;
}

/**
 * Enhanced useSession hook that provides both Better Auth state and
 * status ("loading" | "authenticated" | "unauthenticated") for seamless compatibility.
 */
export function useSession(): UseSessionReturn {
  const session = authClient.useSession();
  const rawData = session.data as unknown as SessionData | null;
  const status: "loading" | "authenticated" | "unauthenticated" = session.isPending
    ? "loading"
    : rawData?.user
    ? "authenticated"
    : "unauthenticated";

  return {
    data: rawData,
    status,
    isPending: session.isPending,
    error: session.error,
    refetch: session.refetch,
  };
}

export interface SignInCredentialsOptions {
  email?: string;
  password?: string;
  callbackUrl?: string;
  redirect?: boolean;
}

export type SignInFunction = {
  (
    provider: "credentials" | "google" | string,
    options?: SignInCredentialsOptions
  ): Promise<{ ok?: boolean; error?: string | null }>;
  email: typeof authClient.signIn.email;
  social: typeof authClient.signIn.social;
};

/**
 * Flexible signIn method supporting Better Auth methods (signIn.email, signIn.social)
 * as well as signIn("credentials", { email, password, callbackUrl }).
 */
export const signIn = new Proxy(
  async function (
    providerOrOptions?: any,
    options?: SignInCredentialsOptions
  ) {
    if (providerOrOptions === "credentials") {
      const res = await authClient.signIn.email({
        email: options?.email || "",
        password: options?.password || "",
      });
      if (res.error) {
        return { error: res.error.message || "Invalid email or password", ok: false };
      }
      return { ok: true, error: null };
    }

    if (providerOrOptions === "google") {
      return await authClient.signIn.social({
        provider: "google",
        callbackURL: options?.callbackUrl || "/feed",
      });
    }

    if (typeof providerOrOptions === "object") {
      return await authClient.signIn.email(providerOrOptions);
    }

    return { error: "Unsupported auth provider", ok: false };
  },
  {
    get(target, prop, receiver) {
      if (prop in target) return Reflect.get(target, prop, receiver);
      return Reflect.get(authClient.signIn, prop, receiver);
    },
  }
) as unknown as SignInFunction;

export type SignOutFunction = {
  (options?: { callbackUrl?: string }): Promise<void>;
};

/**
 * Flexible signOut method supporting Better Auth style ({ callbackUrl }).
 */
export const signOut = new Proxy(
  async function (options?: { callbackUrl?: string }) {
    await (authClient.signOut as any)({ fetchOptions: {} });
    const target = options?.callbackUrl || "/login";
    if (typeof window !== "undefined") {
      window.location.href = target;
    }
  },
  {
    get(target, prop, receiver) {
      if (prop in target) return Reflect.get(target, prop, receiver);
      return Reflect.get(authClient.signOut, prop, receiver);
    },
  }
) as unknown as SignOutFunction;

export const signUp = authClient.signUp;
export const organization = authClient.organization;
export const useActiveOrganization = authClient.useActiveOrganization;
