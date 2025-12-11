import * as React from "react";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import {
  USE_COGNITO,
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID,
} from "./cognitoConfig";

export interface AuthUser {
  email: string;
  name?: string;
  sub?: string;
}

interface StoredUserRecord {
  password: string;
  displayName?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail: string | null;
  userName: string | null;
  signIn: (params: { email: string; password: string }) => Promise<void>;
  signUp: (params: { email: string; password: string; name?: string }) => Promise<void>;
  signOut: () => Promise<void> | void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const CURRENT_USER_KEY = "od:auth:currentUser:v1";
const USERS_KEY = "od:auth:users:v1";

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function loadUserStore(): Record<string, StoredUserRecord> {
  const raw = typeof window !== "undefined" ? window.localStorage.getItem(USERS_KEY) : null;
  const parsed = safeParse<Record<string, StoredUserRecord>>(raw);
  return parsed || {};
}

function saveUserStore(store: Record<string, StoredUserRecord>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(store));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const cognitoUserPool = React.useMemo(() => {
    if (!USE_COGNITO || !COGNITO_USER_POOL_ID || !COGNITO_CLIENT_ID) return null;
    return new CognitoUserPool({
      UserPoolId: COGNITO_USER_POOL_ID,
      ClientId: COGNITO_CLIENT_ID,
    });
  }, []);

  React.useEffect(() => {
    if (USE_COGNITO && cognitoUserPool) {
      const currentUser = cognitoUserPool.getCurrentUser();
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      currentUser.getSession((err, session) => {
        if (err || !session || !session.isValid()) {
          setUser(null);
          setLoading(false);
          return;
        }

        const payload = session.getIdToken().payload || {};
        const email = (payload.email || currentUser.getUsername() || "").toLowerCase();
        const name = payload.name || payload.given_name;
        const sub = payload.sub;

        setUser({
          email,
          name,
          sub,
        });
        setLoading(false);
      });
    } else {
      // fallback to stored local user
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(CURRENT_USER_KEY) : null;
      const parsed = safeParse<AuthUser>(raw);
      if (parsed && parsed.email) {
        setUser(parsed);
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, [cognitoUserPool]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user) {
      window.localStorage.removeItem(CURRENT_USER_KEY);
    } else {
      window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
  }, [user]);

  const signIn = React.useCallback(async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();

      if (USE_COGNITO && cognitoUserPool) {
        const userData = {
          Username: trimmedEmail,
          Pool: cognitoUserPool,
        };
        const cognitoUser = new CognitoUser(userData);
        const authDetails = new AuthenticationDetails({
          Username: trimmedEmail,
          Password: password,
        });

        await new Promise<void>((resolve, reject) => {
          cognitoUser.authenticateUser(authDetails, {
            onSuccess: (session) => {
              const payload = session.getIdToken().payload || {};
              const emailAttr = (payload.email || trimmedEmail).toLowerCase();
              const nameAttr = payload.name || payload.given_name;
              const sub = payload.sub;

              setUser({
                email: emailAttr,
                name: nameAttr,
                sub,
              });
              resolve();
            },
            onFailure: (err) => {
              reject(err);
            },
          });
        });
        return;
      }

      const store = loadUserStore();
      const record = store[trimmedEmail];

      if (!record || record.password !== password) {
        throw new Error("Invalid email or password.");
      }

      setUser({
        email: trimmedEmail,
        name: record.displayName,
      });
    } finally {
      setLoading(false);
    }
  }, [cognitoUserPool]);

  const signUp = React.useCallback(
    async ({ email, password, name }: { email: string; password: string; name?: string }) => {
      setLoading(true);
      try {
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedName = name?.trim();

        if (!trimmedEmail || !password) {
          throw new Error("Email and password are required.");
        }

        if (USE_COGNITO && cognitoUserPool) {
          const attributes: CognitoUserAttribute[] = [];

          attributes.push(
            new CognitoUserAttribute({
              Name: "email",
              Value: trimmedEmail,
            })
          );

          if (trimmedName) {
            attributes.push(
              new CognitoUserAttribute({
                Name: "name",
                Value: trimmedName,
              })
            );
          }

          await new Promise<void>((resolve, reject) => {
            cognitoUserPool.signUp(trimmedEmail, password, attributes, [], (err, result) => {
              if (err || !result) {
                reject(err || new Error("Unable to sign up."));
                return;
              }
              resolve();
            });
          });

          return;
        }

        const store = loadUserStore();
        if (store[trimmedEmail]) {
          throw new Error("An account already exists for this email.");
        }

        store[trimmedEmail] = {
          password,
          displayName: trimmedName || undefined,
        };
        saveUserStore(store);

        setUser({
          email: trimmedEmail,
          name: trimmedName || undefined,
        });
      } finally {
        setLoading(false);
      }
    },
    [cognitoUserPool, signIn]
  );

  const signOut = React.useCallback(async () => {
    if (USE_COGNITO && cognitoUserPool) {
      const currentUser = cognitoUserPool.getCurrentUser();
      if (currentUser) {
        currentUser.signOut();
      }
    }
    setUser(null);
  }, [cognitoUserPool]);

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: loading,
      userEmail: user?.email ?? null,
      userName: user?.name ?? null,
      signIn,
      signUp,
      signOut,
    }),
    [user, loading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
