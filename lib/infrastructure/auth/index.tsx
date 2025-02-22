"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { User } from "@/lib/infrastructure/db/schema";

type UserContextType = {
  user: User | null;
  userPromise: Promise<User | null>;
};

const UserContext = createContext<UserContextType | null>(null);

export function useUser(): UserContextType {
  let context = useContext(UserContext);
  console.log("[useUser] Current user context:", context?.user?.id);
  if (context === null) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export function UserProvider({
  children,
  userPromise,
}: {
  children: ReactNode;
  userPromise: Promise<User | null>;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    userPromise.then(setUser);
  }, [userPromise]);

  return (
    <UserContext.Provider value={{ user, userPromise }}>
      {children}
    </UserContext.Provider>
  );
}
