import { createContext, useContext, useEffect, useState } from "react";
import { auth, signIn, signOut } from "../auth";

const AuthContext = createContext<{
  user: any;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}>({
  user: null,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const session = await auth();
      setUser(session?.user ?? null);
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
