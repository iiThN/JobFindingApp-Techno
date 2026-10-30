
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

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

    const newAccount = {
      ...account,
      email: normalizedEmail,
      savedJobs: account.savedJobs || [],
      skills: account.skills || [],
    };

    setAccounts((previousAccounts) => [
      ...previousAccounts,
      newAccount,
    ]);

    return { success: true };
  };

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

    setCurrentUser({
      ...account,
      savedJobs: account.savedJobs || [],
      skills: account.skills || [],
    });

    return { success: true, user: account };
  };

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

  const logout = () => {
    setCurrentUser(null);
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
