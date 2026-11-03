
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

  // Get profile and Job Seeker skills from database
  // Get profile, jobSeeker bookmarks, and skills from database
  const loadProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    let skills = [];
    let savedBookmarks = [];

    // Load jobSeeker specific data only for Job Seeker accounts
    if (data.role?.toLowerCase() === "job seeker") {
      const { data: seekerData, error: seekerError } = await supabase
        .from("jobSeeker")
        .select("skills, bookmarks")
        .eq("jobseeker_id", userId)
        .maybeSingle();

      if (seekerError) {
        console.log(
          "Load Job Seeker data error:",
          seekerError.message
        );
      } else if (seekerData) {
        skills = seekerData.skills || [];
        savedBookmarks = seekerData.bookmarks || [];
      }
    }

    return {
      ...data,
      savedJobs: savedBookmarks, // <--- Now correctly mapped from jobSeeker.bookmarks!
      skills,
    };
  };

  // Update current user information
  const updateCurrentUser = async (updates) => {
    if (!currentUser) return false;

    try {
      // Save Job Seeker skills to Supabase
      if (
        Object.prototype.hasOwnProperty.call(updates, "skills")
      ) {
        if (currentUser.role?.toLowerCase() !== "job seeker") {
          throw new Error(
            "Only Job Seeker accounts can update skills."
          );
        }

        const { data, error } = await supabase
          .from("jobSeeker")
          .update({
            skills: updates.skills,
          })
          .eq("jobseeker_id", currentUser.id)
          .select("jobseeker_id")
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          throw new Error(
            "Your Job Seeker record was not found or cannot be updated. Please check your Supabase RLS policies."
          );
        }
      }

      // Update app state after successful database update
      setCurrentUser((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          ...updates,
        };
      });

      return true;
    } catch (error) {
      console.error(
        "Update Profile Error:",
        error.message
      );

      Alert.alert("Update Failed", error.message);

      return false;
    }
  };

  // Toggle Bookmark using Supabase RPC
  const toggleBookmark = async (jobId) => {
    if (!currentUser) return;

    const currentBookmarks = currentUser.savedJobs || [];

    // Compare UUIDs as strings
    const isSaved = currentBookmarks.some(
      (id) => String(id) === String(jobId)
    );

    const updatedBookmarks = isSaved
      ? currentBookmarks.filter(
          (id) => String(id) !== String(jobId)
        )
      : [...currentBookmarks, jobId];

    // Optimistically update UI
    setCurrentUser((previous) => ({
      ...previous,
      savedJobs: updatedBookmarks,
    }));

    try {
      if (isSaved) {
        const { error } = await supabase.rpc(
          "remove_bookmark",
          {
            target_profile_id: currentUser.id,
            job_id_to_remove: jobId,
          }
        );

        if (error) throw error;
      } else {
        const { error } = await supabase.rpc(
          "add_bookmark",
          {
            target_profile_id: currentUser.id,
            job_id_to_add: jobId,
          }
        );

        if (error) throw error;
      }
    } catch (error) {
      console.error("Bookmark RPC Error:", error);

      Alert.alert(
        "Error",
        `Failed to update bookmark: ${error.message}`
      );

      // Restore previous bookmarks if database update fails
      setCurrentUser((previous) => ({
        ...previous,
        savedJobs: currentBookmarks,
      }));
    }
  };

  // Restore existing login session
  useEffect(() => {
    let active = true;

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
        console.log(
          "Restore session error:",
          error.message
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    restoreSession();

    // Listen for logout changes
    const { data: listener } =
      supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT" && active) {
          setCurrentUser(null);
        }
      });

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
              const profile = await loadProfile(
                session.user.id
              );

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

  // Listen for account suspension and profile changes
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
              console.log(
                "Sign out error:",
                error.message
              );
            }

            Alert.alert(
              "Account Suspended",
              "Your account has been suspended by an administrator. Please contact support if you believe this is a mistake.",
              [{ text: "OK" }]
            );
          } else {
            setCurrentUser((previous) => {
              if (!previous || previous.id !== userId) {
                return previous;
              }

              return {
                ...previous,
                ...payload.new,

                // Keep bookmarks from jobSeeker
                savedJobs: previous.savedJobs || [],

                // Keep existing skills
                skills: previous.skills || [],
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

    return {
      success: true,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        register,
        login,
        logout,
        toggleBookmark,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}
