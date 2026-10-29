import { createContext, useContext, useState } from "react";
<<<<<<< HEAD
import { ADMIN_ROLE, BUILT_IN_ADMINS } from "../data/admins";

const AuthContext = createContext(null);

const isEmployerRole = (role) => String(role || "").toLowerCase().includes("employer");

// Never expose the password to the rest of the app.
const toSessionUser = ({ password, ...account }) => account;

export function AuthProvider({ children }) {
  // The five built-in admins are part of the initial state, so they exist
  // before anyone registers and can't be removed or re-registered.
  const [accounts, setAccounts] = useState(BUILT_IN_ADMINS);
=======

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
>>>>>>> target/Jamisola/techno_app
  const [currentUser, setCurrentUser] = useState(null);

  const register = (account) => {
    const normalizedEmail = account.email.trim().toLowerCase();

    const alreadyExists = accounts.some(
      (item) => item.email.toLowerCase() === normalizedEmail
    );

    if (alreadyExists) {
      return { success: false, message: "An account with this email already exists." };
    }

<<<<<<< HEAD
    // Public registration can never create an admin.
    if (String(account.role || "").toLowerCase() === ADMIN_ROLE.toLowerCase()) {
      return { success: false, message: "This role is not available for registration." };
    }

    const employer = isEmployerRole(account.role);

    setAccounts((previousAccounts) => [
      ...previousAccounts,
      {
        ...account,
        email: normalizedEmail,
        status: "active",
        createdAt: new Date().toISOString(),
        ...(employer && {
          verificationStatus: "Pending",
          verificationSubmittedAt: new Date().toISOString(),
        }),
      },
=======
    setAccounts((previousAccounts) => [
      ...previousAccounts,
      { ...account, email: normalizedEmail },
>>>>>>> target/Jamisola/techno_app
    ]);

    return { success: true };
  };

  const login = (email, password) => {
    const account = accounts.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password
    );

    if (!account) {
      return {
        success: false,
        message: "Incorrect email or password, or this account is not registered.",
      };
    }

<<<<<<< HEAD
    if (account.status === "suspended") {
      return {
        success: false,
        message: "This account has been suspended. Please contact an administrator.",
      };
    }

    setCurrentUser(toSessionUser(account));
=======
    setCurrentUser({
      name: account.name,
      email: account.email,
      role: account.role,
    });
>>>>>>> target/Jamisola/techno_app

    return { success: true, user: account };
  };

  const logout = () => setCurrentUser(null);

<<<<<<< HEAD
  /* ---------------- Admin actions ---------------- */

  const requireAdmin = () =>
    currentUser?.role === ADMIN_ROLE
      ? null
      : { success: false, message: "Only administrators can do this." };

  // Manage users: suspend / re-activate (admins themselves are protected)
  const setAccountStatus = (email, status) => {
    const denied = requireAdmin();
    if (denied) return denied;

    const target = accounts.find((item) => item.email === email);
    if (!target || target.role === ADMIN_ROLE) {
      return { success: false, message: "This account can't be changed." };
    }

    setAccounts((previous) =>
      previous.map((item) => (item.email === email ? { ...item, status } : item))
    );
    return { success: true };
  };

  // Manage users: delete
  const deleteAccount = (email) => {
    const denied = requireAdmin();
    if (denied) return denied;

    const target = accounts.find((item) => item.email === email);
    if (!target || target.role === ADMIN_ROLE) {
      return { success: false, message: "This account can't be deleted." };
    }

    setAccounts((previous) => previous.filter((item) => item.email !== email));
    return { success: true };
  };

  // Verify employer: decision is "Verified" or "Rejected"
  const reviewEmployer = (email, decision, remarks = "") => {
    const denied = requireAdmin();
    if (denied) return denied;

    const target = accounts.find((item) => item.email === email);
    if (!target || !isEmployerRole(target.role)) {
      return { success: false, message: "Employer not found." };
    }

    setAccounts((previous) =>
      previous.map((item) =>
        item.email === email
          ? {
              ...item,
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
        logout,
        setAccountStatus,
        deleteAccount,
        reviewEmployer,
      }}
    >
=======
  return (
    <AuthContext.Provider value={{ accounts, currentUser, register, login, logout }}>
>>>>>>> target/Jamisola/techno_app
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
<<<<<<< HEAD
}
=======
}
>>>>>>> target/Jamisola/techno_app
