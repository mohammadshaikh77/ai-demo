import { createContext, useContext, type ReactNode } from "react";
import { useUser, SignOutButton } from "@clerk/react";

interface AuthUser {
  id: string;
  firstName?: string | null;
  username?: string | null;
  imageUrl: string;
}

interface AuthContextValue {
  isSignedIn: boolean;
  user: AuthUser | null | undefined;
  isLoaded: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  isSignedIn: false,
  user: null,
  isLoaded: true,
});

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, user, isLoaded } = useUser();
  return (
    <AuthContext.Provider value={{ isSignedIn: !!isSignedIn, user: user ?? null, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function NoAuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ isSignedIn: false, user: null, isLoaded: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export { SignOutButton };

export function useAppAuth() {
  return useContext(AuthContext);
}
