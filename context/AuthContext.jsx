
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert, AppState } from "react-native";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get profile from database
  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return {
      ...data,
      savedJobs: [],
      skills: [],
    };
  };

  useEffect(() => {
    let active = true;

    // Restore existing login session
    const restoreSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await loadProfile(session.user.id);

          if (profile.status === "suspended") {
            await supabase.auth.signOut();

            if (active) setCurrentUser(null);
          } else {
            if (active) setCurrentUser(profile);
          }
        }
      } catch (error) {
      } finally {
        if (active) setLoading(false);
      }
    };

    restoreSession();

    // Listen for logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT" && active) {
          setCurrentUser(null);
        }
      }
    );

    // Refresh account status when returning to app
    const appState = AppState.addEventListener(
      "change",
      async (state) => {
        if (state === "active") {
          supabase.auth.startAutoRefresh();

          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (session?.user) {
              const profile = await loadProfile(session.user.id);

              if (!active) return;

              if (profile.status === "suspended") {
                setCurrentUser(null);
                await supabase.auth.signOut();
              } else {
                setCurrentUser(profile);
              }
            }
          } catch (error) {
            console.log(
              "Profile refresh error:",
              error.message
            );
          }
        } else {
          supabase.auth.stopAutoRefresh();
        }
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
      appState.remove();
    };
  }, []);

  // Listen for account suspension in real time
  useEffect(() => {
    if (!currentUser?.id) return;

    const userId = currentUser.id;

    const channel = supabase
      .channel(`account-status-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        async (payload) => {
            if (payload.new.status === "suspended") {

              setCurrentUser(null);

              const { error } = await supabase.auth.signOut();

              if (error) {
              }

              Alert.alert(
                "Account Suspended",
                "Your account has been suspended by an administrator. Please contact support if you believe this is a mistake.",
                [{ text: "OK" }]
              );
            }
         else {
            // Update profile when account details change
            setCurrentUser((previous) => {
              if (!previous || previous.id !== userId) {
                return previous;
              }

              return {
                ...previous,
                ...payload.new,
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  // Register account
  const register = async (account) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: account.email.trim().toLowerCase(),
        password: account.password,
        options: {
          data: {
            name: account.name,
            role: account.role,
          },
        },
      });

      if (error) throw error;

      return {
        success: true,
        requiresConfirmation: !data.session,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  // Login account
  const login = async (email, password) => {
    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (error) throw error;

      const profile = await loadProfile(data.user.id);

      if (profile.status === "suspended") {
        await supabase.auth.signOut();

        return {
          success: false,
          message: "Your account has been suspended.",
        };
      }

      setCurrentUser(profile);

      return {
        success: true,
        user: profile,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  // Logout account
  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    setCurrentUser(null);

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
