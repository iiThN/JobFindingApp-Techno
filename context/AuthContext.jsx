
import { createContext, useContext, useState } from "react";
import { ADMIN_ROLE, BUILT_IN_ADMINS } from "../data/admins";

const AuthContext = createContext(null);

const isEmployerRole = (role) =>
  String(role || "").toLowerCase().includes("employer");

// Remove password from session data
const toSessionUser = ({ password, ...account }) => account;

export function AuthProvider({ children }) {
  // Built-in Admin accounts
  const [accounts, setAccounts] = useState(BUILT_IN_ADMINS);
  const [currentUser, setCurrentUser] = useState(null);

  // Register Job Seeker or Employer
  const register = (account) => {
    const normalizedEmail = account.email.trim().toLowerCase();

    const alreadyExists = accounts.some(
      (item) =>
        item.email.toLowerCase() === normalizedEmail
    );

    if (alreadyExists) {
      return {
        success: false,
        message: "An account with this email already exists.",
      };
    }

    // Prevent public Admin registration
    if (
      String(account.role || "").toLowerCase() ===
      ADMIN_ROLE.toLowerCase()
    ) {
      return {
        success: false,
        message: "This role is not available for registration.",
      };
    }

    const employer = isEmployerRole(account.role);

    const newAccount = {
      ...account,
      email: normalizedEmail,
      savedJobs: account.savedJobs || [],
      skills: account.skills || [],
      status: "active",
      createdAt: new Date().toISOString(),

      ...(employer && {
        verificationPending: true,
        verificationStatus: "Pending",
        verificationSubmittedAt: new Date().toISOString(),
      }),
    };

    setAccounts((previousAccounts) => [
      ...previousAccounts,
      newAccount,
    ]);

    return { success: true };
  };

  // Login
  const login = (email, password) => {
    const account = accounts.find(
      (item) =>
        item.email.toLowerCase() ===
          email.trim().toLowerCase() &&
        item.password === password
    );

    if (!account) {
      return {
        success: false,
        message:
          "Incorrect email or password, or this account is not registered.",

      };
    }

    // Block suspended accounts
    if (account.status === "suspended") {
      return {
        success: false,
        message:
          "This account has been suspended. Please contact an administrator.",
      };
    }

    const sessionUser = {
      ...toSessionUser(account),
      savedJobs: account.savedJobs || [],
      skills: account.skills || [],
    };

    setCurrentUser(sessionUser);

    return {
      success: true,
      user: sessionUser,
    };
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
  };

  // Check Admin permission
  const requireAdmin = () =>
    currentUser?.role === ADMIN_ROLE
      ? null
      : {
          success: false,
          message: "Only administrators can do this.",
        };

  // Admin: Suspend or reactivate user
  const setAccountStatus = (email, status) => {
    const denied = requireAdmin();
    if (denied) return denied;

    const target = accounts.find(
      (item) => item.email === email
    );

    if (!target || target.role === ADMIN_ROLE) {
      return {
        success: false,
        message: "This account can't be changed.",
      };
    }

    setAccounts((previous) =>
      previous.map((item) =>
        item.email === email
          ? { ...item, status }
          : item
      )
    );

    return { success: true };
  };

  // Admin: Delete user
  const deleteAccount = (email) => {
    const denied = requireAdmin();
    if (denied) return denied;

    const target = accounts.find(
      (item) => item.email === email
    );

    if (!target || target.role === ADMIN_ROLE) {
      return {
        success: false,
        message: "This account can't be deleted.",
      };
    }

    setAccounts((previous) =>
      previous.filter((item) => item.email !== email)
    );

    return { success: true };
  };



  // Update current user's profile
  const updateCurrentUser = (updates) => {
    setCurrentUser((previousUser) => {
      if (!previousUser) return previousUser;

      const updatedUser = {
        ...previousUser,
        ...updates,
      };

      const previousEmail = previousUser.email
        ?.trim()
        .toLowerCase();

      setAccounts((previousAccounts) =>
        previousAccounts.map((account) =>
          account.email?.trim().toLowerCase() === previousEmail
            ? { ...account, ...updates }
            : account
        )
      );

      return updatedUser;
    });
  };

  // Admin: Verify or reject employer
  const reviewEmployer = (email, decision, remarks = "") => {
    const denied = requireAdmin();
    if (denied) return denied;

    const target = accounts.find(
      (item) => item.email === email
    );

    if (!target || !isEmployerRole(target.role)) {
      return {
        success: false,
        message: "Employer not found.",
      };
    }

    if (!["Verified", "Rejected"].includes(decision)) {
      return {
        success: false,
        message: "Invalid verification decision.",
      };
    }

    setAccounts((previous) =>
      previous.map((item) =>
        item.email === email
          ? {
              ...item,
              verificationPending: false,
              verificationStatus: decision,
              verificationRemarks: remarks,
              reviewedBy: currentUser.email,
              reviewedByName: currentUser.name,
              reviewedAt: new Date().toISOString(),
            }
          : item
      )
    );

    return { success: true };
  };


  return (
    <AuthContext.Provider
      value={{
        accounts,
        currentUser,
        register,
        login,
        updateCurrentUser,
        logout,
        setAccountStatus,
        deleteAccount,
        reviewEmployer,
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
