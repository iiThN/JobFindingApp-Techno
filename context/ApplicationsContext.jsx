import { createContext, useContext, useState } from "react";

const ApplicationsContext = createContext(null);

export function ApplicationsProvider({ children }) {
  const [applications, setApplications] = useState([]);

  const hasApplied = (jobId) =>
    applications.some((item) => item.jobId === String(jobId));

  const applyToJob = (jobId) => {
    if (hasApplied(jobId)) {
      return { success: false, message: "You already applied to this job." };
    }

    setApplications((previous) => [
      {
        jobId: String(jobId),
        status: "Pending",
        appliedAt: new Date().toISOString(),
      },
      ...previous,
    ]);

    return { success: true };
  };

  return (
    <ApplicationsContext.Provider value={{ applications, hasApplied, applyToJob }}>
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications() {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error("useApplications must be used inside ApplicationsProvider.");
  }
  return context;
}